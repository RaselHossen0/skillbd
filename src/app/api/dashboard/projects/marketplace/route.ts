import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import * as projectUtils from '@/lib/projects';

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters for filtering
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const category = url.searchParams.get('category');
    const skill = url.searchParams.get('skill');
    const paid = url.searchParams.get('paid');
    const studentId = url.searchParams.get('studentId');
    
    // Use server-side client with service role to bypass RLS
    const supabaseServerClient = createServerSupabaseClient();
    
    // Fetch open projects
    const { data: projects, error: projectsError } = await supabaseServerClient
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
            name,
            category
          )
        )
      `)
      .eq('status', 'OPEN')
      .order('created_at', { ascending: false });
    
    if (projectsError) {
      console.error('Error fetching projects:', projectsError);
      return NextResponse.json(
        { error: 'Failed to fetch projects' },
        { status: 500 }
      );
    }
    
    if (!projects || projects.length === 0) {
      return NextResponse.json({ projects: [] });
    }
    
    // Process and transform the project data
    let processedProjects = projects.map((project: any) => {
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
        company_name: project.employers?.company_name,
        technologies,
        created_at: project.created_at,
        type: 'AVAILABLE'
      };
    });
    
    // Filter projects based on query parameters
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      processedProjects = processedProjects.filter(project => 
        project.title?.toLowerCase().includes(searchLower) || 
        project.description?.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply category filter (assuming category is stored in technologies)
    if (category) {
      processedProjects = processedProjects.filter(project => 
        project.technologies?.some((tech: string) => tech.toLowerCase() === category.toLowerCase())
      );
    }
    
    // Apply skill filter
    if (skill) {
      processedProjects = processedProjects.filter(project => 
        project.technologies?.some((tech: string) => tech.toLowerCase() === skill.toLowerCase())
      );
    }
    
    // Apply paid filter
    if (paid !== null && paid !== undefined) {
      const isPaid = paid === 'true';
      processedProjects = processedProjects.filter(project => project.is_paid === isPaid);
    }
    
    // Check if student has already applied to projects
    if (studentId) {
      try {
        const { data: applications, error } = await supabaseServerClient
          .from('project_applicants')
          .select('project_id')
          .eq('student_id', studentId);
        
        if (!error && applications) {
          const appliedProjectIds = applications.map(app => app.project_id);
          
          // Add an 'applied' flag to projects
          processedProjects = processedProjects.map(project => ({
            ...project,
            applied: appliedProjectIds.includes(project.id)
          }));
        }
      } catch (error) {
        console.error('Error fetching student applications:', error);
      }
    }
    
    return NextResponse.json({ projects: processedProjects });
  } catch (error) {
    console.error('Error fetching marketplace projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
} 