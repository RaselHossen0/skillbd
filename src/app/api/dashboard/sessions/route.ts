import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface MentorshipSession {
  id: string;
  title: string;
  date: string;
  time: string;
  status: string;
  zoom_link?: string;
  mentor_id?: string;
  student_id?: string;
  description?: string;
  mentors?: any;
  students?: any;
}

interface EmployerSession {
  id: string;
  title: string;
  date: string;
  time: string;
  status: string;
  meeting_link?: string;
  employer_id?: string;
  applicant_id?: string;
  job_id?: string;
  description?: string;
  applicants?: any;
  job?: any;
}

type Session = MentorshipSession | EmployerSession;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const userRole = searchParams.get('userRole');
  
  if (!userId || !userRole) {
    return NextResponse.json(
      { error: 'Missing userId or userRole parameter' },
      { status: 400 }
    );
  }

  try {
    // Use the enhanced database function for all roles
    const { data, error } = await supabase
      .rpc('get_dashboard_sessions', {
        p_user_id: userId,
        p_role: userRole
      });
    
    if (error) throw error;
    
    return NextResponse.json({ sessions: data || [] });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

// Create new session
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userRole, sessionData } = body;
    
    if (!userRole || !sessionData) {
      return NextResponse.json(
        { error: 'Missing userRole or sessionData' },
        { status: 400 }
      );
    }
    
    // Validate required fields for mentorship sessions
    if (userRole === 'STUDENT' || userRole === 'MENTOR') {
      if (!sessionData.mentor_id || !sessionData.student_id || !sessionData.title || !sessionData.date || !sessionData.time) {
        return NextResponse.json(
          { error: 'Missing required fields for mentorship session' },
          { status: 400 }
        );
      }
      
      // Use the enhanced database function for creating sessions
      const { data, error } = await supabase
        .rpc('create_mentorship_session', {
          p_role: userRole,
          p_creator_id: sessionData.creator_id,
          p_mentor_id: sessionData.mentor_id,
          p_student_id: sessionData.student_id,
          p_title: sessionData.title,
          p_description: sessionData.description || null,
          p_date: sessionData.date,
          p_time: sessionData.time,
          p_zoom_link: sessionData.zoom_link || null
        });
      
      if (error) throw error;
      return NextResponse.json({ session: data });
    } 
    else if (userRole === 'EMPLOYER') {
      // For employer sessions, continue with the existing implementation
      // since there's no enhanced function for employer sessions yet
      if (!sessionData.employer_id || !sessionData.applicant_id || !sessionData.title || !sessionData.date || !sessionData.time) {
        return NextResponse.json(
          { error: 'Missing required fields for employer session' },
          { status: 400 }
        );
      }
      
      // Create employer session
      const { data, error } = await supabase
        .from('employer_sessions')
        .insert([{
          title: sessionData.title,
          date: sessionData.date,
          time: sessionData.time,
          status: sessionData.status || 'PENDING',
          meeting_link: sessionData.meeting_link || '',
          employer_id: sessionData.employer_id,
          applicant_id: sessionData.applicant_id,
          job_id: sessionData.job_id || null,
          description: sessionData.description || ''
        }])
        .select();
      
      if (error) throw error;
      return NextResponse.json({ session: data[0] });
    } else {
      return NextResponse.json(
        { error: 'Invalid user role' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}

// Update existing session
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { userRole, sessionId, sessionData } = body;
    
    if (!userRole || !sessionId || !sessionData) {
      return NextResponse.json(
        { error: 'Missing userRole, sessionId, or sessionData' },
        { status: 400 }
      );
    }
    
    // Update session based on user role
    if (userRole === 'STUDENT' || userRole === 'MENTOR') {
      // Use the enhanced database function for updating sessions
      const { data, error } = await supabase
        .rpc('update_mentorship_session', {
          p_session_id: sessionId,
          p_role: userRole,
          p_title: sessionData.title || null,
          p_description: sessionData.description || null,
          p_date: sessionData.date || null,
          p_time: sessionData.time || null, 
          p_status: sessionData.status || null,
          p_zoom_link: sessionData.zoom_link || null
        });
      
      if (error) throw error;
      return NextResponse.json({ session: data });
    } 
    else if (userRole === 'EMPLOYER') {
      // For employer sessions, continue with the existing implementation
      const { data, error } = await supabase
        .from('employer_sessions')
        .update({
          title: sessionData.title,
          date: sessionData.date,
          time: sessionData.time,
          status: sessionData.status,
          meeting_link: sessionData.meeting_link,
          description: sessionData.description
        })
        .eq('id', sessionId)
        .select();
      
      if (error) throw error;
      return NextResponse.json({ session: data[0] });
    } else {
      return NextResponse.json(
        { error: 'Invalid user role' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error updating session:', error);
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    );
  }
}

// Delete session
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');
  const userRole = searchParams.get('userRole');
  
  if (!sessionId || !userRole) {
    return NextResponse.json(
      { error: 'Missing sessionId or userRole parameter' },
      { status: 400 }
    );
  }

  try {
    let error;
    
    // Delete session based on user role
    if (userRole === 'STUDENT' || userRole === 'MENTOR') {
      // For mentorship sessions
      const result = await supabase
        .from('mentorship_sessions')
        .delete()
        .eq('id', sessionId);
      
      error = result.error;
    } 
    else if (userRole === 'EMPLOYER') {
      // For employer sessions
      const result = await supabase
        .from('employer_sessions')
        .delete()
        .eq('id', sessionId);
      
      error = result.error;
    } else {
      return NextResponse.json(
        { error: 'Invalid user role' },
        { status: 400 }
      );
    }
    
    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting session:', error);
    return NextResponse.json(
      { error: 'Failed to delete session' },
      { status: 500 }
    );
  }
} 