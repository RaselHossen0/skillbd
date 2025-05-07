import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// Define types for the response data structure
interface StudentData {
  id: string;
  name: string;
  avatar_url: string | null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Ensure params is properly awaited
    const mentorId = params?.id;
    
    if (!mentorId) {
      return NextResponse.json(
        { error: 'Missing mentor ID' },
        { status: 400 }
      );
    }
    
    // Use server-side Supabase client to bypass RLS
    const supabaseServerClient = createServerSupabaseClient();
    
    // First, get the mentor's record to verify it exists
    const { data: mentor, error: mentorError } = await supabaseServerClient
      .from('mentors')
      .select('id')
      .eq('id', mentorId)
      .single();
      
    if (mentorError) {
      console.error('Error fetching mentor:', mentorError);
      return NextResponse.json(
        { error: 'Mentor not found' },
        { status: 404 }
      );
    }
    
    // Fetch the students from mentorship_sessions table
    // This table connects mentors and students
    const { data: sessions, error: sessionsError } = await supabaseServerClient
      .from('mentorship_sessions')
      .select(`
        student_id,
        students (
          id,
          user_id,
          users (
            name,
            avatar_url
          )
        )
      `)
      .eq('mentor_id', mentorId)
      .order('created_at', { ascending: false });
    
    if (sessionsError) {
      console.error('Error fetching mentor sessions:', sessionsError);
      return NextResponse.json(
        { error: 'Failed to fetch student relationships' },
        { status: 500 }
      );
    }
    
    // Get unique students from the sessions
    const studentMap = new Map();
    
    sessions.forEach((session: any) => {
      if (session.students && !studentMap.has(session.student_id)) {
        studentMap.set(session.student_id, {
          id: session.student_id,
          name: session.students.users?.name || 'Unknown Student',
          avatar_url: session.students.users?.avatar_url || null
        });
      }
    });
    
    const students: StudentData[] = Array.from(studentMap.values());
    
    return NextResponse.json({ students });
  } catch (error) {
    console.error('Error fetching mentor students:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 