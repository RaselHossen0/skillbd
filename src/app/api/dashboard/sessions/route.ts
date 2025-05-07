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
    // Try to use the enhanced database function first
    try {
      const { data, error } = await supabase
        .rpc('get_dashboard_sessions', {
          p_user_id: userId,
          p_role: userRole
        });
      
      if (!error) {
        return NextResponse.json({ sessions: data || [] });
      }
      
      // If there's an error with the RPC function, continue to the fallback
      console.log('Function not available, falling back to direct queries:', error);
    } catch (rpcError) {
      console.log('Error calling RPC function:', rpcError);
    }
    
    // Fallback to the original implementation
    let sessions: any[] = [];
    
    if (userRole === 'STUDENT') {
      // Fetch student sessions
      const { data, error } = await supabase
        .from('mentorship_sessions')
        .select(`
          id, 
          title, 
          description,
          date, 
          time, 
          status, 
          zoom_link,
          mentors:mentor_id(id, users(name, avatar_url))
        `)
        .eq('student_id', userId)
        .order('date', { ascending: true });
      
      if (error) throw error;
      
      // Transform the response to match our expected format
      sessions = (data || []).map(session => {
        const mentors = session.mentors as any;
        return {
          ...session,
          mentor: mentors ? {
            id: mentors.id,
            name: mentors.users?.name || "Mentor",
            avatar_url: mentors.users?.avatar_url
          } : undefined
        };
      });
    } 
    else if (userRole === 'MENTOR') {
      // Fetch mentor sessions
      const { data, error } = await supabase
        .from('mentorship_sessions')
        .select(`
          id, 
          title, 
          description,
          date, 
          time, 
          status, 
          zoom_link,
          students:student_id(id, users(name, avatar_url))
        `)
        .eq('mentor_id', userId)
        .order('date', { ascending: true });
      
      if (error) throw error;
      
      // Transform the response to match our expected format
      sessions = (data || []).map(session => {
        const students = session.students as any;
        return {
          ...session,
          student: students ? {
            id: students.id,
            name: students.users?.name || "Student",
            avatar_url: students.users?.avatar_url
          } : undefined
        };
      });
    }
    else if (userRole === 'EMPLOYER') {
      // Fetch employer sessions - could be interviews or project discussions
      const { data, error } = await supabase
        .from('employer_sessions')
        .select(`
          id, 
          title, 
          description,
          date, 
          time, 
          status, 
          meeting_link,
          applicants:applicant_id(id, users(name, avatar_url)),
          job:job_id(id, title)
        `)
        .eq('employer_id', userId)
        .order('date', { ascending: true });
      
      if (error) throw error;
      
      // Transform the response to match our expected format
      sessions = (data || []).map(session => {
        const applicants = session.applicants as any;
        return {
          ...session,
          applicant: applicants ? {
            id: applicants.id,
            name: applicants.users?.name || "Applicant",
            avatar_url: applicants.users?.avatar_url
          } : undefined,
          zoom_link: session.meeting_link
        };
      });
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
    
    // Validate required fields for mentorship sessions
    if (userRole === 'STUDENT' || userRole === 'MENTOR') {
      if (!sessionData.mentor_id || !sessionData.student_id || !sessionData.title || !sessionData.date || !sessionData.time) {
        return NextResponse.json(
          { error: 'Missing required fields for mentorship session' },
          { status: 400 }
        );
      }
      
      // Try the enhanced database function first
      try {
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
        
        if (!error) {
          return NextResponse.json({ session: data });
        }
        
        // If RPC fails, log error and continue to fallback
        console.log('Function create_mentorship_session not available, falling back:', error);
      } catch (rpcError) {
        console.log('Error calling RPC function:', rpcError);
      }
      
      // Fallback to direct table insert
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
      
      // Get the mentor details to return a properly formatted response
      const mentorResponse = await supabase
        .from('mentors')
        .select('id, users(name, avatar_url)')
        .eq('id', sessionData.mentor_id)
        .single();
        
      const session = data[0];
      const mentorData = mentorResponse.data as any;
      
      const formattedSession = {
        ...session,
        mentor: mentorData ? {
          id: mentorData.id,
          name: mentorData.users?.name || "Mentor",
          avatar_url: mentorData.users?.avatar_url
        } : undefined
      };
      
      return NextResponse.json({ session: formattedSession });
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
      // Try the enhanced database function first
      try {
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
        
        if (!error) {
          return NextResponse.json({ session: data });
        }
        
        // If RPC fails, log error and continue to fallback
        console.log('Function update_mentorship_session not available, falling back:', error);
      } catch (rpcError) {
        console.log('Error calling RPC function:', rpcError);
      }
      
      // Fallback to direct table update
      // Build update object with only the fields that are provided
      const updateFields: any = {};
      if (sessionData.title) updateFields.title = sessionData.title;
      if (sessionData.description !== undefined) updateFields.description = sessionData.description;
      if (sessionData.date) updateFields.date = sessionData.date;
      if (sessionData.time) updateFields.time = sessionData.time;
      if (sessionData.status) updateFields.status = sessionData.status;
      if (sessionData.zoom_link) updateFields.zoom_link = sessionData.zoom_link;
      
      const { data, error } = await supabase
        .from('mentorship_sessions')
        .update(updateFields)
        .eq('id', sessionId)
        .select(`
          id, 
          title, 
          description,
          date, 
          time, 
          status, 
          zoom_link,
          mentor_id,
          student_id
        `);
      
      if (error) throw error;
      
      // Get related data based on user role
      let formattedSession: any = data[0];
      
      if (userRole === 'STUDENT') {
        // Get mentor details
        const mentorResponse = await supabase
          .from('mentors')
          .select('id, users(name, avatar_url)')
          .eq('id', data[0].mentor_id)
          .single();
          
        const mentorData = mentorResponse.data as any;
        
        formattedSession = {
          ...formattedSession,
          mentor: mentorData ? {
            id: mentorData.id,
            name: mentorData.users?.name || "Mentor",
            avatar_url: mentorData.users?.avatar_url
          } : undefined
        };
      } else {
        // Get student details
        const studentResponse = await supabase
          .from('students')
          .select('id, users(name, avatar_url)')
          .eq('id', data[0].student_id)
          .single();
          
        const studentData = studentResponse.data as any;
        
        formattedSession = {
          ...formattedSession,
          student: studentData ? {
            id: studentData.id,
            name: studentData.users?.name || "Student",
            avatar_url: studentData.users?.avatar_url
          } : undefined
        };
      }
      
      return NextResponse.json({ session: formattedSession });
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