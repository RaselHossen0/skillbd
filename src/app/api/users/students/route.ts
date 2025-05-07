import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Fetch users with STUDENT role
    const { data: userStudents, error: userError } = await supabase
      .from('users')
      .select(`
        id,
        name,
        email,
        avatar_url,
        students(id)
      `)
      .eq('role', 'STUDENT');
    
    if (userError) throw userError;
    
    // Format the data for the frontend
    const students = userStudents.map(user => ({
      id: user.students?.[0]?.id || user.id,
      userId: user.id,
      name: user.name,
      email: user.email,
      avatar_url: user.avatar_url
    }));
    
    return NextResponse.json({ students });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
} 