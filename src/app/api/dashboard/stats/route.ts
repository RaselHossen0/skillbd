import { NextRequest, NextResponse } from 'next/server';
import { getDashboardStats } from '@/lib/dashboard';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const userRole = searchParams.get('userRole');

    if (!userId || !userRole) {
      return NextResponse.json(
        { error: 'Missing required parameters: userId and userRole' },
        { status: 400 }
      );
    }

    const stats = await getDashboardStats(userId, userRole);
    
    return NextResponse.json(stats);
  } catch (error: any) {
    console.error('Error in dashboard stats API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
} 