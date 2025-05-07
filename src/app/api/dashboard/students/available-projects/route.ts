import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    
    if (!studentId) {
      return NextResponse.json(
        { error: 'Missing required parameter: studentId' },
        { status: 400 }
      );
    }
    
    // Create server-side client with service role to bypass RLS
    const supabaseServerClient = createServerSupabaseClient();
    
    // First, get the student's skills
    const { data: studentSkills, error: skillsError } = await supabaseServerClient
      .from('student_skills')
      .select('skill_id, skills(name)')
      .eq('student_id', studentId);
    
    if (skillsError) {
      console.error('Error fetching student skills:', skillsError);
      return NextResponse.json(
        { error: 'Failed to fetch student skills' },
        { status: 500 }
      );
    }
    
    // Extract skill IDs
    const skillIds = studentSkills?.map(item => item.skill_id) || [];
    
    // Fetch projects that are OPEN
    let query = supabaseServerClient
      .from('projects')
      .select(`
        id,
        title,
        description,
        is_paid,
        budget,
        deadline,
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
        ),
        created_at
      `)
      .eq('status', 'OPEN')
      .order('created_at', { ascending: false });
    
    // If the student has skills, try to match projects that require those skills
    // But still return other projects if there are no matches or too few matches
    const { data: projects, error: projectsError } = await query;
    
    if (projectsError) {
      console.error('Error fetching projects:', projectsError);
      return NextResponse.json(
        { error: 'Failed to fetch projects' },
        { status: 500 }
      );
    }
    
    // Process the projects data to make it more usable on the client side
    const processedProjects = projects.map((project: any) => {
      // Extract technologies/skills
      const technologies = project.project_skills
        ?.map((ps: any) => ps.skills?.name)
        .filter(Boolean) || [];
      
      // Calculate a relevance score based on skill matches
      let relevanceScore = 0;
      if (skillIds.length > 0 && project.project_skills) {
        const projectSkillIds = project.project_skills.map((ps: any) => ps.skill_id);
        const matches = projectSkillIds.filter((skillId: string) => skillIds.includes(skillId)).length;
        relevanceScore = matches / projectSkillIds.length;
      }
      
      return {
        id: project.id,
        title: project.title,
        description: project.description,
        is_paid: project.is_paid,
        budget: project.budget,
        deadline: project.deadline,
        company_name: project.employers?.company_name,
        technologies,
        created_at: project.created_at,
        relevance_score: relevanceScore
      };
    });
    
    // Sort by relevance score (most relevant first) and then by creation date
    processedProjects.sort((a: any, b: any) => {
      if (a.relevance_score !== b.relevance_score) {
        return b.relevance_score - a.relevance_score;
      }
      
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    
    return NextResponse.json({ projects: processedProjects });
  } catch (error) {
    console.error('Error in available projects API:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 