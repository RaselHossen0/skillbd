import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// GET a specific project with its details
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
    
    // Create server-side client with service role to bypass RLS
    const supabaseServerClient = createServerSupabaseClient();
    
    // Fetch the project with related data
    const { data, error } = await supabaseServerClient
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
        technologies,
        employer_id,
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
          cover_letter,
          status,
          applied_at,
          students (
            id,
            user_id,
            users (
              name,
              avatar_url
            )
          )
        )
      `)
      .eq('id', projectId)
      .single();
    
    if (error) {
      console.error('Error fetching project details:', error);
      return NextResponse.json(
        { error: 'Failed to fetch project details' },
        { status: error.code === 'PGRST116' ? 404 : 500 }
      );
    }
    
    // Process the data to make it more usable on the client side
    const employerData = data.employers as any;
    const project = {
      id: data.id,
      title: data.title,
      description: data.description,
      is_paid: data.is_paid,
      budget: data.budget,
      deadline: data.deadline,
      status: data.status,
      created_at: data.created_at,
      updated_at: data.updated_at,
      employer_id: data.employer_id,
      company_name: employerData?.company_name,
      technologies: data.technologies || 
        data.project_skills
          ?.map((ps: any) => ps.skills?.name)
          .filter(Boolean) || [],
      applicants: data.project_applicants?.map((app: any) => ({
        id: app.id,
        status: app.status,
        cover_letter: app.cover_letter,
        applied_at: app.applied_at,
        student: {
          id: app.students?.id,
          name: app.students?.users?.name,
          avatar_url: app.students?.users?.avatar_url
        }
      })) || []
    };
    
    return NextResponse.json({ project });
  } catch (error) {
    console.error('Error in project details API:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// PATCH endpoint to update a project
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
    
    // Get request body
    const body = await request.json();
    const {
      title,
      description,
      is_paid,
      budget,
      deadline,
      status,
      technologies
    } = body;
    
    // Prepare update object
    const updateData: any = {};
    
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (is_paid !== undefined) updateData.is_paid = is_paid;
    if (budget !== undefined) updateData.budget = budget;
    if (deadline !== undefined) updateData.deadline = deadline ? new Date(deadline).toISOString() : null;
    if (status !== undefined) updateData.status = status;
    if (technologies !== undefined) updateData.technologies = technologies;
    
    // Only proceed if there's something to update
    if (Object.keys(updateData).length === 0 && !technologies) {
      return NextResponse.json(
        { error: 'No valid update fields provided' },
        { status: 400 }
      );
    }
    
    // Create server-side client with service role to bypass RLS
    const supabaseServerClient = createServerSupabaseClient();
    
    // Update the project
    const { data: project, error } = await supabaseServerClient
      .from('projects')
      .update(updateData)
      .eq('id', projectId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating project:', error);
      return NextResponse.json(
        { error: 'Failed to update project' },
        { status: 500 }
      );
    }
    
    // Handle technologies update if provided
    if (technologies) {
      // First, delete existing project_skills
      const { error: deleteError } = await supabaseServerClient
        .from('project_skills')
        .delete()
        .eq('project_id', projectId);
      
      if (deleteError) {
        console.error('Error deleting existing project skills:', deleteError);
      }
      
      // Then add new technologies
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
              project_id: projectId,
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
      message: 'Project updated successfully'
    });
  } catch (error) {
    console.error('Error in project update API:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// DELETE endpoint to delete a project
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
    
    // Create server-side client with service role to bypass RLS
    const supabaseServerClient = createServerSupabaseClient();
    
    // Delete the project
    const { error } = await supabaseServerClient
      .from('projects')
      .delete()
      .eq('id', projectId);
    
    if (error) {
      console.error('Error deleting project:', error);
      return NextResponse.json(
        { error: 'Failed to delete project' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Error in project delete API:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 