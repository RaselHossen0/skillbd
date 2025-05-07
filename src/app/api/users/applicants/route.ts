import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // For applicants, we'll fetch STUDENT role users who have applied to jobs
    // or all STUDENT users as potential applicants
    const { data: userApplicants, error: userError } = await supabase
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
    const applicants = userApplicants.map(user => ({
      id: user.students?.[0]?.id || user.id,
      userId: user.id,
      name: user.name,
      email: user.email,
      avatar_url: user.avatar_url
    }));
    
    return NextResponse.json({ applicants });
  } catch (error) {
    console.error('Error fetching applicants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applicants' },
      { status: 500 }
    );
  }
} 