import { NextRequest, NextResponse } from 'next/server';
import { getStudentSkills } from '@/lib/dashboard';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json(
        { error: 'Missing required parameter: studentId' },
        { status: 400 }
      );
    }

    const skills = await getStudentSkills(studentId);
    
    return NextResponse.json({ skills });
  } catch (error: any) {
    console.error('Error in student skills API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch student skills' },
      { status: 500 }
    );
  }
} 