import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface Skill {
  id: string;
  name: string;
  category: string;
}

interface ExpertiseRecord {
  id: string;
  level: number;
  skills: Skill;
}

// GET all expertise areas for a mentor
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const mentorId = searchParams.get('mentorId');

    if (!mentorId) {
      return NextResponse.json(
        { error: 'Missing required parameter: mentorId' },
        { status: 400 }
      );
    }

    // Fetch the mentor's expertise with skill details
    const { data, error } = await supabase
      .from('mentor_expertise')
      .select(`
        id,
        level,
        skill_id,
        skills:skill_id (
          id,
          name,
          category
        )
      `)
      .eq('mentor_id', mentorId);

    if (error) {
      console.error('Error fetching mentor expertise:', error);
      return NextResponse.json(
        { error: 'Failed to fetch expertise' },
        { status: 500 }
      );
    }

    // Format the expertise data for API response
    const expertise = data.map((item: any) => {
      // Handle the case where skills might be null or undefined
      return {
        id: item.id,
        name: item.skills?.name || 'Unknown Skill',
        category: item.skills?.category || 'Uncategorized',
        skill_id: item.skill_id,
        level: item.level
      };
    });

    return NextResponse.json({ expertise });
  } catch (error) {
    console.error('Error in expertise API:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// POST endpoint to add a new expertise area
export async function POST(request: NextRequest) {
  try {
    // Get request body
    const body = await request.json();
    const { mentor_id, skill_id, level } = body;

    // Validate required fields
    if (!mentor_id || !skill_id || !level) {
      return NextResponse.json(
        { error: 'Missing required fields: mentor_id, skill_id, and level are required' },
        { status: 400 }
      );
    }

    // Check if this expertise already exists
    const { data: existingData, error: checkError } = await supabase
      .from('mentor_expertise')
      .select('id')
      .eq('mentor_id', mentor_id)
      .eq('skill_id', skill_id)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking for existing expertise:', checkError);
      return NextResponse.json(
        { error: 'Failed to check for existing expertise' },
        { status: 500 }
      );
    }

    if (existingData) {
      return NextResponse.json(
        { error: 'This expertise already exists for the mentor' },
        { status: 409 }
      );
    }

    // Insert the new expertise
    const { data: insertedData, error: insertError } = await supabase
      .from('mentor_expertise')
      .insert({
        mentor_id,
        skill_id,
        level
      })
      .select('id, level, skill_id')
      .single();

    if (insertError) {
      console.error('Error creating mentor expertise:', insertError);
      return NextResponse.json(
        { error: 'Failed to add expertise' },
        { status: 500 }
      );
    }

    // Get skill details
    const { data: skillData, error: skillError } = await supabase
      .from('skills')
      .select('id, name, category')
      .eq('id', skill_id)
      .single();

    if (skillError) {
      console.error('Error fetching skill details:', skillError);
      return NextResponse.json(
        { error: 'Failed to fetch skill details' },
        { status: 500 }
      );
    }

    // Format and return the created expertise
    const expertise = {
      id: insertedData.id,
      name: skillData.name,
      category: skillData.category,
      skill_id: skillData.id,
      level: insertedData.level
    };

    return NextResponse.json({ 
      success: true,
      expertise,
      message: 'Expertise added successfully' 
    });
  } catch (error) {
    console.error('Error in expertise API:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 