import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import * as projectUtils from '@/lib/projects';

export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body = await request.json();
    
    // Verify user role and appropriate data
    if (!body.userRole) {
      return NextResponse.json(
        { error: 'Missing required field: userRole' },
        { status: 400 }
      );
    }

    const userRole = body.userRole;
    const supabaseAdmin = createServerSupabaseClient();
    
    if (userRole === 'EMPLOYER') {
      // Employer is creating a new project
      if (!body.title || !body.description || !body.employer_id) {
        return NextResponse.json(
          { error: 'Missing required fields for employer project: title, description, and employer_id' },
          { status: 400 }
        );
      }
      
      try {
        // Use the server-side client to bypass RLS
        const { data: project, error } = await supabaseAdmin
          .from('projects')
          .insert({
            employer_id: body.employer_id,
            title: body.title,
            description: body.description,
            is_paid: body.is_paid || false,
            budget: body.budget,
            deadline: body.deadline,
            status: 'OPEN',
            technologies: body.technologies || []
          })
          .select()
          .single();

        if (error) throw error;
        
        return NextResponse.json({ 
          success: true,
          project,
          message: 'Project created successfully'
        });
      } catch (error: any) {
        console.error('Error creating employer project:', error);
        return NextResponse.json(
          { error: error.message || 'Failed to create employer project' },
          { status: 500 }
        );
      }
    } else if (userRole === 'MENTOR') {
      // Mentor is creating a new challenge
      if (!body.title || !body.description || !body.mentor_id) {
        return NextResponse.json(
          { error: 'Missing required fields for mentor challenge: title, description, and mentor_id' },
          { status: 400 }
        );
      }
      
      try {
        // Use the server-side client to bypass RLS
        const { data: challenge, error } = await supabaseAdmin
          .from('mentor_expertise')
          .insert({
            mentor_id: body.mentor_id,
            title: body.title,
            description: body.description,
            deadline: body.deadline,
            status: 'IN_PROGRESS',
            is_paid: false,
            technologies: body.technologies || [],
            student_id: body.student_id
          })
          .select()
          .single();

        if (error) throw error;
        
        return NextResponse.json({ 
          success: true,
          project: challenge,
          message: 'Challenge created successfully'
        });
      } catch (error: any) {
        console.error('Error creating mentor challenge:', error);
        return NextResponse.json(
          { error: error.message || 'Failed to create mentor challenge' },
          { status: 500 }
        );
      }
    } else if (userRole === 'STUDENT') {
      // Students apply to projects, not create them
      if (!body.project_id || !body.student_id) {
        return NextResponse.json(
          { error: 'Missing required fields for project application: project_id and student_id' },
          { status: 400 }
        );
      }
      
      try {
        // Use the server-side client to bypass RLS
        const { data: application, error } = await supabaseAdmin
          .from('project_applicants')
          .insert({
            project_id: body.project_id,
            student_id: body.student_id,
            cover_letter: body.cover_letter,
            status: 'PENDING'
          })
          .select()
          .single();

        if (error) throw error;
        
        return NextResponse.json({ 
          success: true,
          application,
          message: 'Project application submitted successfully'
        });
      } catch (error: any) {
        console.error('Error applying to project:', error);
        return NextResponse.json(
          { error: error.message || 'Failed to apply to project' },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid user role' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in project creation API:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 