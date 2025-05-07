import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Fetch users with MENTOR role
    const { data: userMentors, error: userError } = await supabase
      .from('users')
      .select(`
        id,
        name,
        email,
        avatar_url,
        mentors(id)
      `)
      .eq('role', 'MENTOR');
    
    if (userError) throw userError;
    
    // Format the data for the frontend
    const mentors = userMentors.map(user => ({
      id: user.mentors?.[0]?.id || user.id,
      userId: user.id,
      name: user.name,
      email: user.email,
      avatar_url: user.avatar_url
    }));
    
    return NextResponse.json({ mentors });
  } catch (error) {
    console.error('Error fetching mentors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mentors' },
      { status: 500 }
    );
  }
} 