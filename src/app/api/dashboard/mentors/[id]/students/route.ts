import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Define types for the response data structure
interface MentorStudentRecord {
  student_id: string;
  students: {
    id: string;
    name: string;
    user_id: string;
    users?: {
      avatar_url: string | null;
    };
  };
}

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
    const mentorId = params.id;
    
    if (!mentorId) {
      return NextResponse.json(
        { error: 'Missing mentor ID' },
        { status: 400 }
      );
    }
    
    // Fetch students assigned to this mentor
    const { data, error } = await supabase
      .from('mentor_students')
      .select(`
        student_id,
        students (
          id,
          name,
          user_id,
          users (
            avatar_url
          )
        )
      `)
      .eq('mentor_id', mentorId);
    
    if (error) {
      console.error('Error fetching mentor students:', error);
      return NextResponse.json(
        { error: 'Failed to fetch students' },
        { status: 500 }
      );
    }
    
    // Format the students data with type assertion
    const students: StudentData[] = (data as unknown as MentorStudentRecord[]).map(record => ({
      id: record.students.id,
      name: record.students.name,
      avatar_url: record.students.users?.avatar_url || null
    }));
    
    // No mock data, just return empty array if no students found
    return NextResponse.json({ students });
  } catch (error) {
    console.error('Error fetching mentor students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
} 