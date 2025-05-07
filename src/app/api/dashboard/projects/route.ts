import { NextRequest, NextResponse } from 'next/server';
import { getRecommendedProjects } from '@/lib/dashboard';

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

    const projects = await getRecommendedProjects(studentId);
    
    return NextResponse.json({ projects });
  } catch (error: any) {
    console.error('Error in recommended projects API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch recommended projects' },
      { status: 500 }
    );
  }
} 