import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// GET a specific job by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id;
    
    if (!jobId) {
      return NextResponse.json(
        { error: 'Missing job ID' },
        { status: 400 }
      );
    }
    
    // Create server-side client with service role to bypass RLS
    const supabaseServerClient = createServerSupabaseClient();
    
    // Fetch the job with employer and applications details
    const { data, error } = await supabaseServerClient
      .from('jobs')
      .select(`
        *,
        employers (
          company_name
        ),
        job_applications (
          id,
          status,
          created_at,
          cover_letter,
          student_id,
          students (
            id,
            users (
              id,
              name,
              email,
              avatar_url
            )
          )
        )
      `)
      .eq('id', jobId)
      .single();
    
    if (error) {
      console.error('Error fetching job details:', error);
      return NextResponse.json(
        { error: 'Failed to fetch job details' },
        { status: error.code === 'PGRST116' ? 404 : 500 }
      );
    }
    
    // Transform the response to a more usable format
    const job = {
      ...data,
      company_name: data.employers?.company_name,
      applications: data.job_applications?.map((app: any) => ({
        id: app.id,
        status: app.status,
        created_at: app.created_at,
        cover_letter: app.cover_letter,
        student_id: app.student_id,
        student_name: app.students?.users?.name,
        student_email: app.students?.users?.email,
        student_avatar: app.students?.users?.avatar_url
      })) || [],
      applications_count: data.job_applications?.length || 0
    };
    
    // Remove the nested objects we've flattened
    delete job.employers;
    delete job.job_applications;
    
    return NextResponse.json({ job });
  } catch (error) {
    console.error('Error in job details API:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// PATCH endpoint to update a job
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id;
    
    if (!jobId) {
      return NextResponse.json(
        { error: 'Missing job ID' },
        { status: 400 }
      );
    }
    
    // Get request body
    const body = await request.json();
    const { 
      title,
      description,
      requirements,
      location,
      salary_range,
      deadline,
      status
    } = body;
    
    // Prepare update object - only include fields that are provided
    const updateData: any = {};
    
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (requirements !== undefined) updateData.requirements = requirements;
    if (location !== undefined) updateData.location = location;
    if (salary_range !== undefined) updateData.salary_range = salary_range;
    if (deadline !== undefined) updateData.deadline = deadline ? new Date(deadline).toISOString() : null;
    if (status !== undefined) updateData.status = status;
    
    // Only proceed if there's something to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid update fields provided' },
        { status: 400 }
      );
    }
    
    // Create server-side client with service role to bypass RLS
    const supabaseServerClient = createServerSupabaseClient();
    
    // Update the job
    const { data, error } = await supabaseServerClient
      .from('jobs')
      .update(updateData)
      .eq('id', jobId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating job:', error);
      return NextResponse.json(
        { error: 'Failed to update job' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      job: data,
      message: 'Job updated successfully'
    });
  } catch (error) {
    console.error('Error in job update API:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// DELETE endpoint to remove a job
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id;
    
    if (!jobId) {
      return NextResponse.json(
        { error: 'Missing job ID' },
        { status: 400 }
      );
    }
    
    // Create server-side client with service role to bypass RLS
    const supabaseServerClient = createServerSupabaseClient();
    
    // Delete the job
    const { error } = await supabaseServerClient
      .from('jobs')
      .delete()
      .eq('id', jobId);
    
    if (error) {
      console.error('Error deleting job:', error);
      return NextResponse.json(
        { error: 'Failed to delete job' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Error in job delete API:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 