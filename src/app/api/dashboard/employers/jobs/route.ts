import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// GET jobs for a specific employer
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const employerId = searchParams.get('employerId');
    const status = searchParams.get('status');
    
    if (!employerId) {
      return NextResponse.json(
        { error: 'Missing required parameter: employerId' },
        { status: 400 }
      );
    }
    
    // Create server-side client with service role to bypass RLS
    const supabaseServerClient = createServerSupabaseClient();
    
    // Build the query
    let query = supabaseServerClient
      .from('jobs')
      .select(`
        id,
        title,
        description,
        requirements,
        location,
        salary_range,
        deadline,
        status,
        created_at,
        employer_id,
        employers (
          company_name
        ),
        job_applications (
          id
        )
      `)
      .eq('employer_id', employerId);
    
    // Filter by status if provided
    if (status) {
      query = query.eq('status', status);
    }
    
    // Order by creation date, newest first
    query = query.order('created_at', { ascending: false });
    
    // Execute the query
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching jobs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch jobs' },
        { status: 500 }
      );
    }
    
    // Transform the response to match the expected format
    const jobs = data.map((job: any) => ({
      id: job.id,
      title: job.title,
      description: job.description,
      requirements: job.requirements,
      location: job.location,
      salary_range: job.salary_range,
      deadline: job.deadline,
      status: job.status,
      created_at: job.created_at,
      company_name: job.employers?.company_name,
      applications_count: job.job_applications ? job.job_applications.length : 0
    }));
    
    return NextResponse.json({ jobs });
  } catch (error) {
    console.error('Error in jobs API:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// POST endpoint to create a new job
export async function POST(request: NextRequest) {
  try {
    // Get request body
    const body = await request.json();
    const { 
      employer_id, 
      title, 
      description, 
      requirements, 
      location, 
      salary_range, 
      deadline,
      status = 'ACTIVE'
    } = body;
    
    // Validate required fields
    if (!employer_id || !title || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: employer_id, title, and description are required' },
        { status: 400 }
      );
    }
    
    // Create server-side client with service role to bypass RLS
    const supabaseServerClient = createServerSupabaseClient();
    
    // Create the job using service role client
    const { data, error } = await supabaseServerClient
      .from('jobs')
      .insert({
        employer_id,
        title,
        description,
        requirements,
        location,
        salary_range,
        deadline: deadline ? new Date(deadline).toISOString() : null,
        status
      })
      .select('*')
      .single();
    
    if (error) {
      console.error('Error creating job:', error);
      return NextResponse.json(
        { error: 'Failed to create job' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      job: data,
      message: 'Job created successfully' 
    });
  } catch (error) {
    console.error('Error in jobs API:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 