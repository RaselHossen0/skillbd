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
    let sessions: Session[] = [];
    
    if (userRole === 'STUDENT') {
      // Fetch student sessions
      const { data, error } = await supabase
        .from('mentorship_sessions')
        .select(`
          id, 
          title, 
          date, 
          time, 
          status, 
          zoom_link,
          description,
          mentors:mentor_id(id, users(name, avatar_url))
        `)
        .eq('student_id', userId)
        .order('date', { ascending: true });
      
      if (error) throw error;
      sessions = data || [];
    } 
    else if (userRole === 'MENTOR') {
      // Fetch mentor sessions
      const { data, error } = await supabase
        .from('mentorship_sessions')
        .select(`
          id, 
          title, 
          date, 
          time, 
          status, 
          zoom_link,
          description,
          students:student_id(id, users(name, avatar_url))
        `)
        .eq('mentor_id', userId)
        .order('date', { ascending: true });
      
      if (error) throw error;
      sessions = data || [];
    }
    else if (userRole === 'EMPLOYER') {
      // Fetch employer sessions - could be interviews or project discussions
      const { data, error } = await supabase
        .from('employer_sessions')
        .select(`
          id, 
          title, 
          date, 
          time, 
          status, 
          meeting_link,
          description,
          applicants:applicant_id(id, users(name, avatar_url)),
          job:job_id(id, title)
        `)
        .eq('employer_id', userId)
        .order('date', { ascending: true });
      
      if (error) throw error;
      sessions = data || [];
    }

    return NextResponse.json({ sessions });
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
    
    let result;
    
    // Create session based on user role
    if (userRole === 'STUDENT' || userRole === 'MENTOR') {
      // Validate required fields
      if (!sessionData.mentor_id || !sessionData.student_id || !sessionData.title || !sessionData.date || !sessionData.time) {
        return NextResponse.json(
          { error: 'Missing required fields for mentorship session' },
          { status: 400 }
        );
      }
      
      // Create mentorship session
      const { data, error } = await supabase
        .from('mentorship_sessions')
        .insert([{
          title: sessionData.title,
          date: sessionData.date,
          time: sessionData.time,
          status: sessionData.status || 'PENDING',
          zoom_link: sessionData.zoom_link || '',
          mentor_id: sessionData.mentor_id,
          student_id: sessionData.student_id,
          description: sessionData.description || ''
        }])
        .select();
      
      if (error) throw error;
      result = data;
    } 
    else if (userRole === 'EMPLOYER') {
      // Validate required fields
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
      result = data;
    } else {
      return NextResponse.json(
        { error: 'Invalid user role' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ session: result[0] });
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
    
    let result;
    
    // Update session based on user role
    if (userRole === 'STUDENT' || userRole === 'MENTOR') {
      // Update mentorship session
      const { data, error } = await supabase
        .from('mentorship_sessions')
        .update({
          title: sessionData.title,
          date: sessionData.date,
          time: sessionData.time,
          status: sessionData.status,
          zoom_link: sessionData.zoom_link,
          description: sessionData.description
        })
        .eq('id', sessionId)
        .select();
      
      if (error) throw error;
      result = data;
    } 
    else if (userRole === 'EMPLOYER') {
      // Update employer session
      const { data, error } = await supabase
        .from('employer_sessions')
        .update({
          title: sessionData.title,
          date: sessionData.date,
          time: sessionData.time,
          status: sessionData.status,
          meeting_link: sessionData.meeting_link,
          job_id: sessionData.job_id,
          description: sessionData.description
        })
        .eq('id', sessionId)
        .select();
      
      if (error) throw error;
      result = data;
    } else {
      return NextResponse.json(
        { error: 'Invalid user role' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ session: result[0] });
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
    let result;
    
    // Delete session based on user role
    if (userRole === 'STUDENT' || userRole === 'MENTOR') {
      const { error } = await supabase
        .from('mentorship_sessions')
        .delete()
        .eq('id', sessionId);
      
      if (error) throw error;
    } 
    else if (userRole === 'EMPLOYER') {
      const { error } = await supabase
        .from('employer_sessions')
        .delete()
        .eq('id', sessionId);
      
      if (error) throw error;
    } else {
      return NextResponse.json(
        { error: 'Invalid user role' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Session deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting session:', error);
    return NextResponse.json(
      { error: 'Failed to delete session' },
      { status: 500 }
    );
  }
} 