import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
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
    
    if (userRole === 'EMPLOYER') {
      // Employer is creating a new project
      if (!body.title || !body.description || !body.employer_id) {
        return NextResponse.json(
          { error: 'Missing required fields for employer project: title, description, and employer_id' },
          { status: 400 }
        );
      }
      
      try {
        const project = await projectUtils.createEmployerProject({
          employer_id: body.employer_id,
          title: body.title,
          description: body.description,
          is_paid: body.is_paid,
          budget: body.budget,
          deadline: body.deadline,
          technologies: body.technologies
        });
        
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
        const project = await projectUtils.createMentorProject({
          mentor_id: body.mentor_id,
          title: body.title,
          description: body.description,
          deadline: body.deadline,
          technologies: body.technologies,
          student_id: body.student_id
        });
        
        return NextResponse.json({ 
          success: true,
          project,
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
        const application = await projectUtils.applyToProject({
          project_id: body.project_id,
          student_id: body.student_id,
          cover_letter: body.cover_letter
        });
        
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