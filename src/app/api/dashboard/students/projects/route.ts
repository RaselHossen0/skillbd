import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
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
    
    // Fetch the student's project applications
    let query = supabaseServerClient
      .from('project_applicants')
      .select(`
        id,
        project_id,
        student_id,
        cover_letter,
        status,
        applied_at,
        projects (
          id,
          title,
          description,
          is_paid,
          budget,
          deadline,
          status,
          created_at,
          employer_id,
          employers (
            id,
            company_name
          ),
          project_skills (
            skill_id,
            skills (
              id,
              name
            )
          )
        )
      `)
      .eq('student_id', studentId);
    
    // Filter by application status if provided
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    
    // Order by application date, newest first
    query = query.order('applied_at', { ascending: false });
    
    const { data: applications, error: applicationsError } = await query;
    
    if (applicationsError) {
      console.error('Error fetching student applications:', applicationsError);
      return NextResponse.json(
        { error: 'Failed to fetch student applications' },
        { status: 500 }
      );
    }
    
    // Process the applications data to extract projects
    const projects: any[] = applications
      .filter((app: any) => app.projects) // Filter out any null projects
      .map((app: any) => {
        const project = app.projects;
        
        // Extract technologies/skills
        const technologies = project.project_skills
          ?.map((ps: any) => ps.skills?.name)
          .filter(Boolean) || [];
        
        return {
          id: project.id,
          title: project.title,
          description: project.description,
          is_paid: project.is_paid,
          budget: project.budget,
          deadline: project.deadline,
          status: project.status,
          created_at: project.created_at,
          company_name: project.employers?.company_name,
          technologies,
          application: {
            id: app.id,
            status: app.status,
            cover_letter: app.cover_letter,
            applied_at: app.applied_at
          }
        };
      });
    
    // Fetch assigned projects where the student is directly assigned
    // This would be for mentor-assigned projects or accepted employer projects
    const { data: assignedProjects, error: assignedError } = await supabaseServerClient
      .from('projects')
      .select(`
        id,
        title,
        description,
        is_paid,
        budget,
        deadline,
        status,
        created_at,
        employer_id,
        employers (
          id,
          company_name
        ),
        project_skills (
          skill_id,
          skills (
            id,
            name
          )
        )
      `)
      .eq('status', 'IN_PROGRESS')
      .contains('assigned_students', [studentId]);
    
    if (assignedError) {
      console.error('Error fetching assigned projects:', assignedError);
    }
    
    // Process and combine with projects from applications
    if (assignedProjects) {
      const processedAssigned = assignedProjects.map((project: any) => {
        // Extract technologies/skills
        const technologies = project.project_skills
          ?.map((ps: any) => ps.skills?.name)
          .filter(Boolean) || [];
        
        return {
          id: project.id,
          title: project.title,
          description: project.description,
          is_paid: project.is_paid,
          budget: project.budget,
          deadline: project.deadline,
          status: project.status,
          created_at: project.created_at,
          company_name: project.employers?.company_name,
          technologies,
          assigned: true
        };
      });
      
      // Add to projects, but avoid duplicates
      const existingIds = new Set(projects.map((p: any) => p.id));
      for (const project of processedAssigned) {
        if (!existingIds.has(project.id)) {
          projects.push(project);
        }
      }
    }
    
    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Error in student projects API:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 