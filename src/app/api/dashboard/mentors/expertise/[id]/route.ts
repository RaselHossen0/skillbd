import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// PATCH endpoint to update an expertise's level
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const expertiseId = params.id;
    
    if (!expertiseId) {
      return NextResponse.json(
        { error: 'Missing expertise ID' },
        { status: 400 }
      );
    }
    
    // Get request body
    const body = await request.json();
    const { level } = body;
    
    if (level === undefined || level < 1 || level > 5) {
      return NextResponse.json(
        { error: 'Invalid level value. Level must be between 1 and 5.' },
        { status: 400 }
      );
    }
    
    // Update the expertise level
    const { data: updatedExpertise, error } = await supabase
      .from('mentor_expertise')
      .update({ level })
      .eq('id', expertiseId)
      .select('id, level, skill_id')
      .single();
    
    if (error) {
      console.error('Error updating mentor expertise:', error);
      return NextResponse.json(
        { error: 'Failed to update expertise' },
        { status: 500 }
      );
    }
    
    // Get skill details
    const { data: skillData, error: skillError } = await supabase
      .from('skills')
      .select('id, name, category')
      .eq('id', updatedExpertise.skill_id)
      .single();

    if (skillError) {
      console.error('Error fetching skill details:', skillError);
      return NextResponse.json(
        { error: 'Failed to fetch skill details' },
        { status: 500 }
      );
    }
    
    // Format and return the updated expertise
    const expertise = {
      id: updatedExpertise.id,
      name: skillData.name,
      category: skillData.category,
      skill_id: skillData.id,
      level: updatedExpertise.level
    };
    
    return NextResponse.json({
      success: true,
      expertise,
      message: 'Expertise updated successfully'
    });
  } catch (error) {
    console.error('Error in expertise update API:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// DELETE endpoint to remove an expertise
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const expertiseId = params.id;
    
    if (!expertiseId) {
      return NextResponse.json(
        { error: 'Missing expertise ID' },
        { status: 400 }
      );
    }
    
    // Delete the expertise
    const { error } = await supabase
      .from('mentor_expertise')
      .delete()
      .eq('id', expertiseId);
    
    if (error) {
      console.error('Error deleting mentor expertise:', error);
      return NextResponse.json(
        { error: 'Failed to delete expertise' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Expertise deleted successfully'
    });
  } catch (error) {
    console.error('Error in expertise delete API:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 