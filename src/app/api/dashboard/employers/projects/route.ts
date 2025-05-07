import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employerId = searchParams.get('employerId');
    const status = searchParams.get('status');
    
    if (!employerId) {
      return NextResponse.json(
        { error: 'Missing required parameter: employerId' },
        { status: 400 }
      );
    }
    
    // Create server-side client with service role to bypass RLS
    const supabaseServerClient = createServerSupabaseClient();
    
    // Build the query for projects
    let query = supabaseServerClient
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
        updated_at,
        employers (
          id,
          company_name
        ),
        project_skills (
          id,
          skill_id,
          skills (
            id,
            name,
            category
          )
        ),
        project_applicants (
          id,
          student_id,
          status,
          applied_at
        )
      `)
      .eq('employer_id', employerId);
    
    // Filter by status if provided
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    
    // Order by creation date, newest first
    query = query.order('created_at', { ascending: false });
    
    // Execute the query
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching employer projects:', error);
      return NextResponse.json(
        { error: 'Failed to fetch employer projects' },
        { status: 500 }
      );
    }
    
    // Process the data to make it more usable on the client side
    const projects = data.map((project: any) => {
      // Use technologies directly from the JSONB column or from project_skills
      const technologies = project.technologies || 
        (project.project_skills
          ?.map((ps: any) => ps.skills?.name)
          .filter(Boolean) || []);
      
      // Count applications
      const applications_count = project.project_applicants?.length || 0;
      
      return {
        id: project.id,
        title: project.title,
        description: project.description,
        is_paid: project.is_paid,
        budget: project.budget,
        deadline: project.deadline,
        status: project.status,
        created_at: project.created_at,
        updated_at: project.updated_at,
        company_name: project.employers?.company_name,
        technologies,
        applications_count
      };
    });
    
    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Error in employer projects API:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      employer_id,
      title,
      description,
      is_paid,
      budget,
      deadline,
      technologies,
      status = 'OPEN'
    } = body;
    
    // Validate required fields
    if (!title || !description || !employer_id) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, employer_id' },
        { status: 400 }
      );
    }
    
    // Create server-side client with service role to bypass RLS
    const supabaseServerClient = createServerSupabaseClient();
    
    // Insert the project
    const { data: project, error } = await supabaseServerClient
      .from('projects')
      .insert({
        employer_id,
        title,
        description,
        is_paid: is_paid || false,
        budget,
        deadline: deadline ? new Date(deadline).toISOString() : null,
        status,
        technologies: technologies || []
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating project:', error);
      return NextResponse.json(
        { error: 'Failed to create project' },
        { status: 500 }
      );
    }
    
    // If there are technologies, we need to:
    // 1. Check if each technology exists in the skills table
    // 2. If not, create it
    // 3. Create the project_skills association
    if (technologies && technologies.length > 0) {
      for (const tech of technologies) {
        // Check if the skill exists
        const { data: existingSkill, error: skillError } = await supabaseServerClient
          .from('skills')
          .select('id')
          .eq('name', tech)
          .maybeSingle();
        
        if (skillError) {
          console.error('Error checking for existing skill:', skillError);
          continue;
        }
        
        let skillId = existingSkill?.id;
        
        // If skill doesn't exist, create it
        if (!skillId) {
          const { data: newSkill, error: createError } = await supabaseServerClient
            .from('skills')
            .insert({
              name: tech,
              category: 'Technology' // Default category
            })
            .select('id')
            .single();
          
          if (createError) {
            console.error('Error creating skill:', createError);
            continue;
          }
          
          skillId = newSkill.id;
        }
        
        // Create the project_skills association
        if (skillId) {
          const { error: linkError } = await supabaseServerClient
            .from('project_skills')
            .insert({
              project_id: project.id,
              skill_id: skillId
            });
          
          if (linkError) {
            console.error('Error linking skill to project:', linkError);
          }
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      project,
      message: 'Project created successfully'
    });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
} 