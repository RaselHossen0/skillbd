import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// GET job applications for a student
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const status = searchParams.get('status');
    
    if (!studentId) {
      return NextResponse.json(
        { error: 'Missing required parameter: studentId' },
        { status: 400 }
      );
    }
    
    // Create server-side client with service role to bypass RLS
    const supabaseServerClient = createServerSupabaseClient();
    
    // Build the query
    let query = supabaseServerClient
      .from('job_applications')
      .select(`
        id,
        status,
        cover_letter,
        created_at,
        job_id,
        jobs (
          id, 
          title,
          description,
          requirements,
          location,
          salary_range,
          deadline,
          status,
          employers (
            id,
            company_name
          )
        )
      `)
      .eq('student_id', studentId);
    
    // Filter by status if provided
    if (status) {
      query = query.eq('status', status);
    }
    
    // Order by creation date, newest first
    query = query.order('created_at', { ascending: false });
    
    // Execute the query
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching job applications:', error);
      return NextResponse.json(
        { error: 'Failed to fetch job applications' },
        { status: 500 }
      );
    }
    
    // Transform the response to match the expected format
    const applications = data.map((app: any) => ({
      id: app.id,
      status: app.status,
      cover_letter: app.cover_letter,
      created_at: app.created_at,
      job: {
        id: app.jobs?.id,
        title: app.jobs?.title,
        description: app.jobs?.description,
        requirements: app.jobs?.requirements,
        location: app.jobs?.location,
        salary_range: app.jobs?.salary_range,
        deadline: app.jobs?.deadline,
        status: app.jobs?.status,
        company_name: app.jobs?.employers?.company_name
      }
    }));
    
    return NextResponse.json({ applications });
  } catch (error) {
    console.error('Error in job applications API:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// POST endpoint to create a new job application
export async function POST(request: NextRequest) {
  try {
    // Get request body
    const body = await request.json();
    const { 
      job_id, 
      student_id, 
      cover_letter 
    } = body;
    
    // Validate required fields
    if (!job_id || !student_id) {
      return NextResponse.json(
        { error: 'Missing required fields: job_id and student_id are required' },
        { status: 400 }
      );
    }
    
    // Create server-side client with service role to bypass RLS
    const supabaseServerClient = createServerSupabaseClient();
    
    // Check if the student has already applied
    const { data: existingApplication, error: checkError } = await supabaseServerClient
      .from('job_applications')
      .select('id')
      .eq('job_id', job_id)
      .eq('student_id', student_id)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking existing application:', checkError);
      return NextResponse.json(
        { error: 'Failed to check for existing application' },
        { status: 500 }
      );
    }
    
    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already applied for this job' },
        { status: 400 }
      );
    }
    
    // Create the application
    const { data, error } = await supabaseServerClient
      .from('job_applications')
      .insert({
        job_id,
        student_id,
        cover_letter,
        status: 'PENDING'
      })
      .select('*, jobs(title, employers(company_name))')
      .single();
    
    if (error) {
      console.error('Error creating job application:', error);
      return NextResponse.json(
        { error: 'Failed to submit application' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      application: data,
      message: 'Application submitted successfully' 
    });
  } catch (error) {
    console.error('Error in job application API:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 