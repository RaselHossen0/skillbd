-- Enhanced database functions for session-related APIs
-- This handles all role-specific dashboards and fixes field naming consistency issues

-- 1. Create a new function to retrieve sessions with proper field mapping for all roles
CREATE OR REPLACE FUNCTION get_dashboard_sessions(
  p_user_id UUID,
  p_role TEXT
)
RETURNS SETOF json AS $$
DECLARE
  v_student_id UUID;
  v_mentor_id UUID;
  v_employer_id UUID;
BEGIN
  -- First, resolve the role-specific ID from the user ID
  IF p_role = 'STUDENT' THEN
    SELECT id INTO v_student_id FROM students WHERE user_id = p_user_id;
    
    -- For students, return mentor-led sessions
    IF v_student_id IS NOT NULL THEN
      RETURN QUERY
      SELECT json_build_object(
        'id', ms.id,
        'title', ms.title,
        'description', ms.description,
        'date', COALESCE(ms.date::TEXT, ms.start_time::DATE::TEXT),
        'time', COALESCE(ms.time::TEXT, ms.start_time::TIME::TEXT),
        'status', ms.status,
        'zoom_link', COALESCE(ms.zoom_link, ms.zoom_meeting_link),
        'start_time', ms.start_time,
        'end_time', ms.end_time,
        'mentor', json_build_object(
          'id', m.id,
          'name', mp.name,
          'avatar_url', mp.avatar_url
        ),
        'created_at', ms.created_at
      )
      FROM mentorship_sessions ms
      JOIN mentors m ON ms.mentor_id = m.id
      JOIN profiles mp ON m.user_id = mp.id
      WHERE ms.student_id = v_student_id
      ORDER BY 
        CASE WHEN ms.status = 'SCHEDULED' THEN 0 ELSE 1 END,
        COALESCE(ms.date, ms.start_time::DATE) DESC,
        COALESCE(ms.time, ms.start_time::TIME) DESC;
    END IF;
    
  ELSIF p_role = 'MENTOR' THEN
    SELECT id INTO v_mentor_id FROM mentors WHERE user_id = p_user_id;
    
    -- For mentors, return student sessions
    IF v_mentor_id IS NOT NULL THEN
      RETURN QUERY
      SELECT json_build_object(
        'id', ms.id,
        'title', ms.title,
        'description', ms.description,
        'date', COALESCE(ms.date::TEXT, ms.start_time::DATE::TEXT),
        'time', COALESCE(ms.time::TEXT, ms.start_time::TIME::TEXT),
        'status', ms.status,
        'zoom_link', COALESCE(ms.zoom_link, ms.zoom_meeting_link),
        'start_time', ms.start_time,
        'end_time', ms.end_time,
        'student', json_build_object(
          'id', s.id,
          'name', sp.name,
          'avatar_url', sp.avatar_url
        ),
        'created_at', ms.created_at
      )
      FROM mentorship_sessions ms
      JOIN students s ON ms.student_id = s.id
      JOIN profiles sp ON s.user_id = sp.id
      WHERE ms.mentor_id = v_mentor_id
      ORDER BY 
        CASE WHEN ms.status = 'SCHEDULED' THEN 0 ELSE 1 END,
        COALESCE(ms.date, ms.start_time::DATE) DESC,
        COALESCE(ms.time, ms.start_time::TIME) DESC;
    END IF;
    
  ELSIF p_role = 'EMPLOYER' THEN
    SELECT id INTO v_employer_id FROM employers WHERE user_id = p_user_id;
    
    -- For employers, we could show related sessions (this is a placeholder)
    -- In a real system, employers might see sessions related to their projects
    IF v_employer_id IS NOT NULL THEN
      RETURN QUERY
      SELECT json_build_object(
        'id', ms.id,
        'title', ms.title,
        'description', ms.description,
        'date', COALESCE(ms.date::TEXT, ms.start_time::DATE::TEXT),
        'time', COALESCE(ms.time::TEXT, ms.start_time::TIME::TEXT),
        'status', ms.status,
        'zoom_link', COALESCE(ms.zoom_link, ms.zoom_meeting_link),
        'start_time', ms.start_time,
        'end_time', ms.end_time,
        'student', json_build_object(
          'id', s.id,
          'name', sp.name,
          'avatar_url', sp.avatar_url
        ),
        'mentor', json_build_object(
          'id', m.id,
          'name', mp.name,
          'avatar_url', mp.avatar_url
        ),
        'created_at', ms.created_at
      )
      FROM mentorship_sessions ms
      JOIN students s ON ms.student_id = s.id
      JOIN profiles sp ON s.user_id = sp.id
      JOIN mentors m ON ms.mentor_id = m.id
      JOIN profiles mp ON m.user_id = mp.id
      -- In a real system, you'd filter for employer-related sessions
      -- This is just returning all sessions for demo purposes
      ORDER BY 
        CASE WHEN ms.status = 'SCHEDULED' THEN 0 ELSE 1 END,
        COALESCE(ms.date, ms.start_time::DATE) DESC,
        COALESCE(ms.time, ms.start_time::TIME) DESC
      LIMIT 20;
    END IF;
    
  ELSIF p_role = 'ADMIN' THEN
    -- Admins see all sessions
    RETURN QUERY
    SELECT json_build_object(
      'id', ms.id,
      'title', ms.title,
      'description', ms.description,
      'date', COALESCE(ms.date::TEXT, ms.start_time::DATE::TEXT),
      'time', COALESCE(ms.time::TEXT, ms.start_time::TIME::TEXT),
      'status', ms.status,
      'zoom_link', COALESCE(ms.zoom_link, ms.zoom_meeting_link),
      'start_time', ms.start_time,
      'end_time', ms.end_time,
      'student', json_build_object(
        'id', s.id,
        'name', sp.name,
        'avatar_url', sp.avatar_url
      ),
      'mentor', json_build_object(
        'id', m.id,
        'name', mp.name,
        'avatar_url', mp.avatar_url
      ),
      'created_at', ms.created_at
    )
    FROM mentorship_sessions ms
    JOIN students s ON ms.student_id = s.id
    JOIN profiles sp ON s.user_id = sp.id
    JOIN mentors m ON ms.mentor_id = m.id
    JOIN profiles mp ON m.user_id = mp.id
    ORDER BY 
      CASE WHEN ms.status = 'SCHEDULED' THEN 0 ELSE 1 END,
      COALESCE(ms.date, ms.start_time::DATE) DESC,
      COALESCE(ms.time, ms.start_time::TIME) DESC
    LIMIT 100;
  END IF;
  
  -- Return empty if no applicable role
  RETURN;
END;
$$ LANGUAGE plpgsql;

-- 2. Create a function for booking/creating sessions with flexible field handling
CREATE OR REPLACE FUNCTION create_mentorship_session(
  p_role TEXT,
  p_creator_id UUID,
  p_mentor_id UUID,
  p_student_id UUID,
  p_title TEXT,
  p_description TEXT DEFAULT NULL,
  p_date DATE,
  p_time TIME,
  p_zoom_link TEXT DEFAULT NULL
)
RETURNS json AS $$
DECLARE
  v_session_id UUID;
  v_start_time TIMESTAMP WITH TIME ZONE;
  v_end_time TIMESTAMP WITH TIME ZONE;
  v_result json;
BEGIN
  -- Calculate start and end time (1-hour session by default)
  v_start_time := (p_date || ' ' || p_time)::TIMESTAMP;
  v_end_time := v_start_time + INTERVAL '1 hour';

  -- Insert the new session with all possible field variations to ensure API compatibility
  INSERT INTO mentorship_sessions (
    id,
    mentor_id,
    student_id,
    title,
    description,
    date,
    time,
    start_time,
    end_time,
    status,
    zoom_link,
    zoom_meeting_link
  ) VALUES (
    uuid_generate_v4(),
    p_mentor_id,
    p_student_id,
    p_title,
    p_description,
    p_date,
    p_time,
    v_start_time,
    v_end_time,
    'SCHEDULED',
    p_zoom_link,
    p_zoom_link
  )
  RETURNING id INTO v_session_id;

  -- Return the created session with all needed fields for the client
  IF p_role = 'STUDENT' THEN
    SELECT json_build_object(
      'id', ms.id,
      'title', ms.title,
      'description', ms.description,
      'date', COALESCE(ms.date::TEXT, ms.start_time::DATE::TEXT),
      'time', COALESCE(ms.time::TEXT, ms.start_time::TIME::TEXT),
      'status', ms.status,
      'zoom_link', COALESCE(ms.zoom_link, ms.zoom_meeting_link),
      'start_time', ms.start_time,
      'end_time', ms.end_time,
      'mentor', json_build_object(
        'id', m.id,
        'name', mp.name,
        'avatar_url', mp.avatar_url
      ),
      'created_at', ms.created_at
    ) INTO v_result
    FROM mentorship_sessions ms
    JOIN mentors m ON ms.mentor_id = m.id
    JOIN profiles mp ON m.user_id = mp.id
    WHERE ms.id = v_session_id;
  ELSIF p_role = 'MENTOR' THEN
    SELECT json_build_object(
      'id', ms.id,
      'title', ms.title,
      'description', ms.description,
      'date', COALESCE(ms.date::TEXT, ms.start_time::DATE::TEXT),
      'time', COALESCE(ms.time::TEXT, ms.start_time::TIME::TEXT),
      'status', ms.status,
      'zoom_link', COALESCE(ms.zoom_link, ms.zoom_meeting_link),
      'start_time', ms.start_time,
      'end_time', ms.end_time,
      'student', json_build_object(
        'id', s.id,
        'name', sp.name,
        'avatar_url', sp.avatar_url
      ),
      'created_at', ms.created_at
    ) INTO v_result
    FROM mentorship_sessions ms
    JOIN students s ON ms.student_id = s.id
    JOIN profiles sp ON s.user_id = sp.id
    WHERE ms.id = v_session_id;
  ELSE
    SELECT json_build_object(
      'id', ms.id,
      'title', ms.title,
      'description', ms.description,
      'date', COALESCE(ms.date::TEXT, ms.start_time::DATE::TEXT),
      'time', COALESCE(ms.time::TEXT, ms.start_time::TIME::TEXT),
      'status', ms.status,
      'zoom_link', COALESCE(ms.zoom_link, ms.zoom_meeting_link),
      'start_time', ms.start_time,
      'end_time', ms.end_time,
      'student', json_build_object(
        'id', s.id,
        'name', sp.name,
        'avatar_url', sp.avatar_url
      ),
      'mentor', json_build_object(
        'id', m.id,
        'name', mp.name,
        'avatar_url', mp.avatar_url
      ),
      'created_at', ms.created_at
    ) INTO v_result
    FROM mentorship_sessions ms
    JOIN students s ON ms.student_id = s.id
    JOIN profiles sp ON s.user_id = sp.id
    JOIN mentors m ON ms.mentor_id = m.id
    JOIN profiles mp ON m.user_id = mp.id
    WHERE ms.id = v_session_id;
  END IF;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- 3. Create a function for updating sessions
CREATE OR REPLACE FUNCTION update_mentorship_session(
  p_session_id UUID,
  p_role TEXT,
  p_title TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_date DATE DEFAULT NULL,
  p_time TIME DEFAULT NULL,
  p_status TEXT DEFAULT NULL,
  p_zoom_link TEXT DEFAULT NULL
)
RETURNS json AS $$
DECLARE
  v_start_time TIMESTAMP WITH TIME ZONE;
  v_end_time TIMESTAMP WITH TIME ZONE;
  v_result json;
BEGIN
  -- Begin constructing the update parameters
  -- Use dynamic SQL to only update fields that are provided
  IF p_date IS NOT NULL AND p_time IS NOT NULL THEN
    v_start_time := (p_date || ' ' || p_time)::TIMESTAMP;
    v_end_time := v_start_time + INTERVAL '1 hour';
    
    UPDATE mentorship_sessions
    SET 
      date = p_date,
      time = p_time,
      start_time = v_start_time,
      end_time = v_end_time
    WHERE id = p_session_id;
  ELSIF p_date IS NOT NULL THEN
    UPDATE mentorship_sessions
    SET date = p_date
    WHERE id = p_session_id;
  ELSIF p_time IS NOT NULL THEN
    UPDATE mentorship_sessions
    SET time = p_time
    WHERE id = p_session_id;
  END IF;
  
  -- Update other fields if provided
  IF p_title IS NOT NULL THEN
    UPDATE mentorship_sessions
    SET title = p_title
    WHERE id = p_session_id;
  END IF;
  
  IF p_description IS NOT NULL THEN
    UPDATE mentorship_sessions
    SET description = p_description
    WHERE id = p_session_id;
  END IF;
  
  IF p_status IS NOT NULL THEN
    UPDATE mentorship_sessions
    SET status = p_status
    WHERE id = p_session_id;
  END IF;
  
  IF p_zoom_link IS NOT NULL THEN
    UPDATE mentorship_sessions
    SET 
      zoom_link = p_zoom_link,
      zoom_meeting_link = p_zoom_link
    WHERE id = p_session_id;
  END IF;

  -- Return the updated session with all needed fields for the client
  IF p_role = 'STUDENT' THEN
    SELECT json_build_object(
      'id', ms.id,
      'title', ms.title,
      'description', ms.description,
      'date', COALESCE(ms.date::TEXT, ms.start_time::DATE::TEXT),
      'time', COALESCE(ms.time::TEXT, ms.start_time::TIME::TEXT),
      'status', ms.status,
      'zoom_link', COALESCE(ms.zoom_link, ms.zoom_meeting_link),
      'start_time', ms.start_time,
      'end_time', ms.end_time,
      'mentor', json_build_object(
        'id', m.id,
        'name', mp.name,
        'avatar_url', mp.avatar_url
      ),
      'created_at', ms.created_at
    ) INTO v_result
    FROM mentorship_sessions ms
    JOIN mentors m ON ms.mentor_id = m.id
    JOIN profiles mp ON m.user_id = mp.id
    WHERE ms.id = p_session_id;
  ELSIF p_role = 'MENTOR' THEN
    SELECT json_build_object(
      'id', ms.id,
      'title', ms.title,
      'description', ms.description,
      'date', COALESCE(ms.date::TEXT, ms.start_time::DATE::TEXT),
      'time', COALESCE(ms.time::TEXT, ms.start_time::TIME::TEXT),
      'status', ms.status,
      'zoom_link', COALESCE(ms.zoom_link, ms.zoom_meeting_link),
      'start_time', ms.start_time,
      'end_time', ms.end_time,
      'student', json_build_object(
        'id', s.id,
        'name', sp.name,
        'avatar_url', sp.avatar_url
      ),
      'created_at', ms.created_at
    ) INTO v_result
    FROM mentorship_sessions ms
    JOIN students s ON ms.student_id = s.id
    JOIN profiles sp ON s.user_id = sp.id
    WHERE ms.id = p_session_id;
  ELSE
    SELECT json_build_object(
      'id', ms.id,
      'title', ms.title,
      'description', ms.description,
      'date', COALESCE(ms.date::TEXT, ms.start_time::DATE::TEXT),
      'time', COALESCE(ms.time::TEXT, ms.start_time::TIME::TEXT),
      'status', ms.status,
      'zoom_link', COALESCE(ms.zoom_link, ms.zoom_meeting_link),
      'start_time', ms.start_time,
      'end_time', ms.end_time,
      'student', json_build_object(
        'id', s.id,
        'name', sp.name,
        'avatar_url', sp.avatar_url
      ),
      'mentor', json_build_object(
        'id', m.id,
        'name', mp.name,
        'avatar_url', mp.avatar_url
      ),
      'created_at', ms.created_at
    ) INTO v_result
    FROM mentorship_sessions ms
    JOIN students s ON ms.student_id = s.id
    JOIN profiles sp ON s.user_id = sp.id
    JOIN mentors m ON ms.mentor_id = m.id
    JOIN profiles mp ON m.user_id = mp.id
    WHERE ms.id = p_session_id;
  END IF;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- 4. Grant the necessary permissions
GRANT EXECUTE ON FUNCTION get_dashboard_sessions(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION create_mentorship_session(TEXT, UUID, UUID, UUID, TEXT, TEXT, DATE, TIME, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_mentorship_session(UUID, TEXT, TEXT, TEXT, DATE, TIME, TEXT, TEXT) TO authenticated; 