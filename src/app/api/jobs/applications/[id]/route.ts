import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// GET a specific job application
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const applicationId = params.id;
    
    if (!applicationId) {
      return NextResponse.json(
        { error: 'Missing application ID' },
        { status: 400 }
      );
    }
    
    // Create server-side client with service role to bypass RLS
    const supabaseServerClient = createServerSupabaseClient();
    
    // Fetch the application with job and employer details
    const { data, error } = await supabaseServerClient
      .from('job_applications')
      .select(`
        id,
        status,
        cover_letter,
        created_at,
        updated_at,
        student_id,
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
      .eq('id', applicationId)
      .single();
    
    if (error) {
      console.error('Error fetching application details:', error);
      return NextResponse.json(
        { error: 'Failed to fetch application details' },
        { status: error.code === 'PGRST116' ? 404 : 500 }
      );
    }
    
    // Transform the response to a more usable format
    const application = {
      id: data.id,
      status: data.status,
      cover_letter: data.cover_letter,
      created_at: data.created_at,
      updated_at: data.updated_at,
      student_id: data.student_id,
      job: {
        id: data.jobs?.id,
        title: data.jobs?.title,
        description: data.jobs?.description,
        requirements: data.jobs?.requirements,
        location: data.jobs?.location,
        salary_range: data.jobs?.salary_range,
        deadline: data.jobs?.deadline,
        status: data.jobs?.status,
        company_name: data.jobs?.employers?.company_name
      }
    };
    
    return NextResponse.json({ application });
  } catch (error) {
    console.error('Error in application details API:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// PATCH endpoint to update an application
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const applicationId = params.id;
    
    if (!applicationId) {
      return NextResponse.json(
        { error: 'Missing application ID' },
        { status: 400 }
      );
    }
    
    // Get request body
    const body = await request.json();
    const { cover_letter, status } = body;
    
    // Prepare update object
    const updateData: any = {};
    
    // Only students can update cover letter
    if (cover_letter !== undefined) {
      updateData.cover_letter = cover_letter;
    }
    
    // Only employers can update status, validated by RLS
    if (status !== undefined) {
      updateData.status = status;
    }
    
    // Only proceed if there's something to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid update fields provided' },
        { status: 400 }
      );
    }
    
    // Create server-side client with service role to bypass RLS
    const supabaseServerClient = createServerSupabaseClient();
    
    // Update the application
    const { data, error } = await supabaseServerClient
      .from('job_applications')
      .update(updateData)
      .eq('id', applicationId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating application:', error);
      return NextResponse.json(
        { error: 'Failed to update application' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      application: data,
      message: 'Application updated successfully'
    });
  } catch (error) {
    console.error('Error in application update API:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// DELETE endpoint to withdraw an application
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const applicationId = params.id;
    
    if (!applicationId) {
      return NextResponse.json(
        { error: 'Missing application ID' },
        { status: 400 }
      );
    }
    
    // Create server-side client with service role to bypass RLS
    const supabaseServerClient = createServerSupabaseClient();
    
    // Delete the application
    const { error } = await supabaseServerClient
      .from('job_applications')
      .delete()
      .eq('id', applicationId);
    
    if (error) {
      console.error('Error deleting application:', error);
      return NextResponse.json(
        { error: 'Failed to withdraw application' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Application withdrawn successfully'
    });
  } catch (error) {
    console.error('Error in application delete API:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 