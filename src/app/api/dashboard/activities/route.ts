import { NextRequest, NextResponse } from 'next/server';
import { getRecentActivities } from '@/lib/dashboard';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required parameter: userId' },
        { status: 400 }
      );
    }

    const activities = await getRecentActivities(userId);
    
    return NextResponse.json({ activities });
  } catch (error: any) {
    console.error('Error in user activities API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch user activities' },
      { status: 500 }
    );
  }
} 