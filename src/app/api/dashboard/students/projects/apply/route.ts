import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { project_id, student_id, cover_letter } = body;
    
    // Validate required fields
    if (!project_id || !student_id) {
      return NextResponse.json(
        { error: 'Missing required fields: project_id, student_id' },
        { status: 400 }
      );
    }
    
    // Create server-side client with service role to bypass RLS
    const supabaseServerClient = createServerSupabaseClient();
    
    // Check if the project exists and is in OPEN status
    const { data: project, error: projectError } = await supabaseServerClient
      .from('projects')
      .select('id, status')
      .eq('id', project_id)
      .single();
    
    if (projectError) {
      console.error('Error checking project:', projectError);
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }
    
    if (project.status !== 'OPEN') {
      return NextResponse.json(
        { error: 'This project is not open for applications' },
        { status: 400 }
      );
    }
    
    // Check if the student has already applied
    const { data: existingApplication, error: checkError } = await supabaseServerClient
      .from('project_applicants')
      .select('id')
      .eq('project_id', project_id)
      .eq('student_id', student_id)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking existing application:', checkError);
      return NextResponse.json(
        { error: 'Failed to check application status' },
        { status: 500 }
      );
    }
    
    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already applied for this project' },
        { status: 400 }
      );
    }
    
    // Create the application
    const { data: application, error: applyError } = await supabaseServerClient
      .from('project_applicants')
      .insert({
        project_id,
        student_id,
        cover_letter,
        status: 'PENDING'
      })
      .select()
      .single();
    
    if (applyError) {
      console.error('Error creating application:', applyError);
      return NextResponse.json(
        { error: 'Failed to submit application' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      application,
      message: 'Application submitted successfully'
    });
  } catch (error) {
    console.error('Error in project application API:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 