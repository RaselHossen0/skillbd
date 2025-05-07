import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import * as projectUtils from '@/lib/projects';

// Define TypeScript types with any to accommodate Supabase's return types
interface ProjectResponse {
  id: any;
  title: string;
  description: string;
  status: string;
  created_at: string;
  technologies?: string[];
  students?: any;  // Use any for flexibility with Supabase response
  mentors?: any;   // Use any for flexibility with Supabase response
}

interface FormattedProject {
  id: string | number;
  title: string;
  description: string;
  status: string;
  student_id?: string;
  student_name?: string;
  mentor_id?: string;
  mentor_name?: string;
  created_at: string;
  technologies: string[];
}

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const userRole = searchParams.get('userRole');

    if (!userId || !userRole) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Get user profile to determine role-specific IDs
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        id,
        role,
        students (id),
        mentors (id),
        employers (id)
      `)
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      );
    }

    let projects: any[] = [];

    if (userRole === 'MENTOR') {
      const mentorId = profile.mentors?.[0]?.id;
      
      if (!mentorId) {
        return NextResponse.json(
          { error: 'Mentor profile not found' },
          { status: 404 }
        );
      }

      // Fetch both mentor challenges and assigned employer projects
      try {
        // First get mentor's own challenges
        const { data: mentorChallenges, error: mentorError } = await supabase
          .from('mentor_challenges')
          .select(`
            id,
            title,
            description,
            status,
            technologies,
            created_at,
            updated_at,
            deadline,
            submission_url,
            students (
              id,
              users (
                id,
                name,
                avatar_url
              )
            )
          `)
          .eq('mentor_id', mentorId)
          .order('created_at', { ascending: false });

        if (mentorError) throw mentorError;

        // Format mentor challenges
        const formattedChallenges = (mentorChallenges || []).map((challenge: any) => ({
          id: challenge.id,
          title: challenge.title,
          description: challenge.description,
          status: challenge.status,
          type: 'CHALLENGE',
          technologies: challenge.technologies || [],
          created_at: challenge.created_at,
          updated_at: challenge.updated_at,
          deadline: challenge.deadline,
          submission_url: challenge.submission_url,
          student_id: challenge.students?.id,
          student_name: challenge.students?.users?.name || 'Unassigned',
          student_avatar: challenge.students?.users?.avatar_url
        }));

        // Also fetch employer projects assigned to this mentor
        const { data: assignedProjects, error: assignedError } = await supabase
          .from('projects')
          .select(`
            id,
            title,
            description,
            status,
            technologies,
            created_at,
            updated_at,
            deadline,
            employer_id,
            employers (
              id,
              company_name
            ),
            student_assignments (
              id,
              student_id,
              students (
                id,
                users (
                  id,
                  name,
                  avatar_url
                )
              )
            )
          `)
          .eq('mentor_id', mentorId)
          .order('created_at', { ascending: false });

        if (assignedError) throw assignedError;

        // Format assigned projects
        const formattedAssigned = (assignedProjects || []).map((project: any) => ({
          id: project.id,
          title: project.title,
          description: project.description,
          status: project.status,
          type: 'ASSIGNED',
          technologies: project.technologies || [],
          created_at: project.created_at,
          updated_at: project.updated_at,
          deadline: project.deadline,
          employer_id: project.employer_id,
          employer_name: project.employers?.company_name,
          student_id: project.student_assignments?.[0]?.student_id,
          student_name: project.student_assignments?.[0]?.students?.users?.name || 'Unassigned',
          student_avatar: project.student_assignments?.[0]?.students?.users?.avatar_url
        }));

        // Combine both types
        projects = [...formattedChallenges, ...formattedAssigned];
      } catch (error) {
        console.error('Error fetching mentor projects:', error);
        return NextResponse.json(
          { error: 'Failed to fetch mentor projects' },
          { status: 500 }
        );
      }
    } else if (userRole === 'STUDENT') {
      const studentId = profile.students?.[0]?.id;
      
      if (!studentId) {
        return NextResponse.json(
          { error: 'Student profile not found' },
          { status: 404 }
        );
      }

      try {
        // Get student projects
        const studentProjects = await projectUtils.getStudentProjects(studentId);
        
        // Format applications
        const applications = (studentProjects.applications || []).map((app: any) => ({
          id: app.projects.id,
          application_id: app.id,
          title: app.projects.title,
          description: app.projects.description,
          status: app.status, // This is the application status
          project_status: app.projects.status,
          type: 'APPLICATION',
          technologies: app.projects.technologies || [],
          created_at: app.projects.created_at,
          applied_at: app.applied_at,
          employer_id: app.projects.employer_id,
          employer_name: app.projects.employers?.company_name
        }));
        
        // Format challenges
        const challenges = (studentProjects.challenges || []).map((challenge: any) => ({
          id: challenge.id,
          title: challenge.title,
          description: challenge.description,
          status: challenge.status,
          type: 'CHALLENGE',
          technologies: challenge.technologies || [],
          created_at: challenge.created_at,
          deadline: challenge.deadline,
          mentor_id: challenge.mentor_id,
          mentor_name: challenge.mentors?.users?.name,
          submission_url: challenge.submission_url
        }));
        
        // Combine both types
        projects = [...applications, ...challenges];
      } catch (error) {
        console.error('Error fetching student projects:', error);
        return NextResponse.json(
          { error: 'Failed to fetch student projects' },
          { status: 500 }
        );
      }
    } else if (userRole === 'EMPLOYER') {
      const employerId = profile.employers?.[0]?.id;
      
      if (!employerId) {
        return NextResponse.json(
          { error: 'Employer profile not found' },
          { status: 404 }
        );
      }

      try {
        // Get employer projects
        const { data, error } = await supabase
          .from('projects')
          .select(`
            id,
            title,
            description,
            status,
            is_paid,
            budget,
            deadline,
            technologies,
            created_at,
            updated_at,
            mentor_id,
            mentors (
              id, 
              users (
                id,
                name,
                avatar_url
              )
            ),
            project_applicants (
              id,
              status,
              applied_at,
              students (
                id,
                users (
                  id,
                  name,
                  avatar_url
                )
              )
            )
          `)
          .eq('employer_id', employerId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Format employer projects
        projects = (data || []).map((project: any) => ({
          id: project.id,
          title: project.title,
          description: project.description,
          status: project.status,
          type: 'EMPLOYER',
          is_paid: project.is_paid,
          budget: project.budget,
          deadline: project.deadline,
          technologies: project.technologies || [],
          created_at: project.created_at,
          updated_at: project.updated_at,
          mentor_id: project.mentor_id,
          mentor_name: project.mentors?.users?.name,
          applicants_count: project.project_applicants?.length || 0,
          applicants: project.project_applicants?.map((app: any) => ({
            id: app.id,
            status: app.status,
            applied_at: app.applied_at,
            student_id: app.students.id,
            student_name: app.students.users.name,
            student_avatar: app.students.users.avatar_url
          }))
        }));
      } catch (error) {
        console.error('Error fetching employer projects:', error);
        return NextResponse.json(
          { error: 'Failed to fetch employer projects' },
          { status: 500 }
        );
      }
    }

    // If no projects found but we need to show something, add mockup data for development
    if (projects.length === 0) {
      // Removed all mock data as per requirement
      return NextResponse.json({ projects });
    }

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
} 