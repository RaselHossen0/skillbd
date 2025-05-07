import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import * as projectUtils from '@/lib/projects';

export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body = await request.json();
    
    // Enhanced validation
    if (!body.userRole) {
      return NextResponse.json(
        { error: 'Missing required field: userRole', details: body },
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
      // Validate student project application
      if (!body.project_id || !body.student_id) {
        return NextResponse.json(
          { 
            error: 'Missing required fields for project application', 
            details: {
              project_id: body.project_id ? 'Provided' : 'Missing',
              student_id: body.student_id ? 'Provided' : 'Missing'
            }
          },
          { status: 400 }
        );
      }
      
      try {
        // First, check if the project exists and is open
        const { data: projectCheck, error: projectError } = await supabaseAdmin
          .from('projects')
          .select('id, status')
          .eq('id', body.project_id)
          .single();

        if (projectError || !projectCheck) {
          return NextResponse.json(
            { 
              error: 'Invalid project', 
              details: projectError || 'Project not found' 
            },
            { status: 404 }
          );
        }

        if (projectCheck.status !== 'OPEN') {
          return NextResponse.json(
            { 
              error: 'Project is not currently accepting applications', 
              current_status: projectCheck.status 
            },
            { status: 400 }
          );
        }

        // Check if student has already applied
        const { data: existingApplication, error: existingError } = await supabaseAdmin
          .from('project_applicants')
          .select('id')
          .eq('project_id', body.project_id)
          .eq('student_id', body.student_id)
          .single();

        if (existingApplication) {
          return NextResponse.json(
            { error: 'You have already applied to this project' },
            { status: 400 }
          );
        }

        // Insert new project application
        const { data: application, error } = await supabaseAdmin
          .from('project_applicants')
          .insert({
            project_id: body.project_id,
            student_id: body.student_id,
            cover_letter: body.cover_letter || '',
            status: 'PENDING',
            applied_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;
        
        return NextResponse.json({ 
          success: true,
          application,
          message: 'Project application submitted successfully'
        }, { status: 201 });
      } catch (error: any) {
        console.error('Detailed project application error:', {
          message: error.message,
          details: error,
          body: body
        });
        
        return NextResponse.json(
          { 
            error: 'Failed to submit project application', 
            details: error.message 
          },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid operation for this user role' },
        { status: 403 }
      );
    }
  } catch (error) {
    console.error('Unhandled error in project creation API:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: String(error) },
      { status: 500 }
    );
  }
} 