import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const mentorId = searchParams.get('mentorId');
    const query = searchParams.get('query') || '';
    
    if (!mentorId) {
      return NextResponse.json(
        { error: 'Missing required parameter: mentorId' },
        { status: 400 }
      );
    }
    
    // First get the skills that the mentor already has
    const { data: existingSkills, error: existingError } = await supabase
      .from('mentor_expertise')
      .select('skill_id')
      .eq('mentor_id', mentorId);
    
    if (existingError) {
      console.error('Error fetching existing mentor skills:', existingError);
      return NextResponse.json(
        { error: 'Failed to fetch existing skills' },
        { status: 500 }
      );
    }
    
    // Extract the skill IDs into an array
    const existingSkillIds = existingSkills.map(item => item.skill_id);
    
    // Now fetch all skills that the mentor doesn't already have
    let skillsQuery = supabase
      .from('skills')
      .select('id, name, category')
      .order('name');
    
    // If there are existing skills, exclude them
    if (existingSkillIds.length > 0) {
      skillsQuery = skillsQuery.not('id', 'in', `(${existingSkillIds.join(',')})`);
    }
    
    // If there's a search query, filter by name
    if (query) {
      skillsQuery = skillsQuery.ilike('name', `%${query}%`);
    }
    
    const { data: skills, error: skillsError } = await skillsQuery;
    
    if (skillsError) {
      console.error('Error fetching available skills:', skillsError);
      return NextResponse.json(
        { error: 'Failed to fetch available skills' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ skills });
  } catch (error) {
    console.error('Error in skills API:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 