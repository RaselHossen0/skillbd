import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import * as projectUtils from '@/lib/projects';

// GET a specific project by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;
    
    if (!projectId) {
      return NextResponse.json(
        { error: 'Missing project ID' },
        { status: 400 }
      );
    }

    // Check if this is a regular project or a mentor challenge
    const { data: projectExists, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .maybeSingle();

    const { data: challengeExists, error: challengeError } = await supabase
      .from('mentor_challenges')
      .select('id')
      .eq('id', projectId)
      .maybeSingle();

    // Based on the type, fetch the appropriate data
    if (projectExists) {
      // It's a regular employer project
      const projectData = await projectUtils.getProjectById(projectId);
      
      if (!projectData) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ project: projectData, type: 'employer' });
    } else if (challengeExists) {
      // It's a mentor challenge
      const challengeData = await projectUtils.getMentorChallengeById(projectId);
      
      if (!challengeData) {
        return NextResponse.json(
          { error: 'Challenge not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ project: challengeData, type: 'mentor' });
    } else {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error fetching project details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project details' },
      { status: 500 }
    );
  }
}

// PATCH to update a project
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;
    
    if (!projectId) {
      return NextResponse.json(
        { error: 'Missing project ID' },
        { status: 400 }
      );
    }
    
    // Get the request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.userRole) {
      return NextResponse.json(
        { error: 'Missing required field: userRole' },
        { status: 400 }
      );
    }

    const userRole = body.userRole;
    
    // Check if this is a regular project or a mentor challenge
    const { data: projectExists, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .maybeSingle();

    const { data: challengeExists, error: challengeError } = await supabase
      .from('mentor_challenges')
      .select('id')
      .eq('id', projectId)
      .maybeSingle();

    if (userRole === 'EMPLOYER' && projectExists) {
      // Employer is updating their project
      const updateData = {
        title: body.title,
        description: body.description,
        status: body.status,
        is_paid: body.is_paid,
        budget: body.budget,
        deadline: body.deadline,
        technologies: body.technologies,
        mentor_id: body.mentor_id
      };
      
      const updatedProject = await projectUtils.updateEmployerProject(projectId, updateData);
      
      return NextResponse.json({ 
        success: true,
        project: updatedProject,
        message: 'Project updated successfully'
      });
    } else if (userRole === 'MENTOR') {
      if (challengeExists) {
        // Mentor is updating their challenge
        const updateData = {
          title: body.title,
          description: body.description,
          status: body.status,
          deadline: body.deadline,
          technologies: body.technologies,
          student_id: body.student_id
        };
        
        const updatedChallenge = await projectUtils.updateMentorProject(projectId, updateData);
        
        return NextResponse.json({ 
          success: true,
          project: updatedChallenge,
          message: 'Challenge updated successfully'
        });
      } else if (projectExists && body.review) {
        // Check if this is a mentor reviewing a challenge or just grading an employer project
        if (body.is_challenge) {
          // Mentor is reviewing their own challenge
          const review = await projectUtils.reviewStudentChallenge(
            projectId,
            {
              mentor_id: body.mentor_id,
              rating: body.rating,
              feedback: body.feedback,
              status: body.status || 'COMPLETED'
            }
          );
          
          return NextResponse.json({
            success: true,
            review,
            message: 'Challenge review submitted successfully'
          });
        } else {
          // Mentor is reviewing an employer's project (they were assigned to oversee)
          const review = await projectUtils.reviewProjectSubmission({
            completed_project_id: body.completed_project_id,
            employer_id: body.employer_id,
            rating: body.rating,
            feedback: body.feedback
          });
          
          return NextResponse.json({ 
            success: true,
            review,
            message: 'Project review submitted successfully'
          });
        }
      }
    } else if (userRole === 'STUDENT') {
      if (body.application_id) {
        // Student is updating an application
        const updatedApplication = await projectUtils.updateProjectApplication(
          body.application_id,
          { cover_letter: body.cover_letter }
        );
        
        return NextResponse.json({ 
          success: true,
          application: updatedApplication,
          message: 'Application updated successfully'
        });
      } else if (body.submission_url) {
        // Student is submitting project work
        if (challengeExists) {
          // It's a challenge submission
          const submission = await projectUtils.submitChallengeResponse(
            projectId,
            {
              student_id: body.student_id,
              submission_url: body.submission_url,
              notes: body.notes
            }
          );
          
          return NextResponse.json({ 
            success: true,
            submission,
            message: 'Challenge response submitted successfully'
          });
        } else if (projectExists) {
          // It's a project submission
          const submission = await projectUtils.submitCompletedProject({
            project_id: projectId,
            student_id: body.student_id,
            submission_url: body.submission_url
          });
          
          return NextResponse.json({ 
            success: true,
            submission,
            message: 'Project completed and submitted successfully'
          });
        }
      }
    }
    
    return NextResponse.json(
      { error: 'Invalid operation for this user role or project type' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update project' },
      { status: 500 }
    );
  }
}

// DELETE a project
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;
    
    if (!projectId) {
      return NextResponse.json(
        { error: 'Missing project ID' },
        { status: 400 }
      );
    }

    // Parse the URL to get query parameters
    const url = new URL(request.url);
    const userRole = url.searchParams.get('userRole');
    const entityType = url.searchParams.get('type');
    
    if (!userRole) {
      return NextResponse.json(
        { error: 'Missing required parameter: userRole' },
        { status: 400 }
      );
    }

    if (userRole === 'EMPLOYER' && (!entityType || entityType === 'project')) {
      // Employer is deleting their project
      await projectUtils.deleteEmployerProject(projectId);
      
      return NextResponse.json({ 
        success: true,
        message: 'Project deleted successfully'
      });
    } else if (userRole === 'MENTOR' && entityType === 'challenge') {
      // Mentor is deleting their challenge
      await projectUtils.deleteMentorProject(projectId);
      
      return NextResponse.json({ 
        success: true,
        message: 'Challenge deleted successfully'
      });
    } else if (userRole === 'STUDENT' && entityType === 'application') {
      // Student is withdrawing an application
      await projectUtils.withdrawProjectApplication(projectId);
      
      return NextResponse.json({ 
        success: true,
        message: 'Application withdrawn successfully'
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid operation for this user role or entity type' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete project' },
      { status: 500 }
    );
  }
} 