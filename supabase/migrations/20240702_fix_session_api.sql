-- Special fixes for the mentorship session API endpoints
-- This addresses errors related to session creation and retrieval

-- Create function for creating mentorship sessions
CREATE OR REPLACE FUNCTION create_mentorship_session(
  mentor_id UUID,
  student_id UUID,
  title TEXT,
  description TEXT,
  date TIMESTAMP WITH TIME ZONE,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  zoom_meeting_link TEXT DEFAULT NULL
)
RETURNS json AS $$
DECLARE
  new_session_id UUID;
  session_data json;
BEGIN
  -- Insert the new session
  INSERT INTO mentorship_sessions (
    id,
    mentor_id,
    student_id,
    title,
    description,
    date,
    start_time,
    end_time,
    zoom_meeting_link,
    status
  ) VALUES (
    uuid_generate_v4(),
    mentor_id,
    student_id,
    title,
    description,
    date,
    start_time,
    end_time,
    zoom_meeting_link,
    'SCHEDULED'
  ) RETURNING id INTO new_session_id;
  
  -- Get the complete session data
  SELECT json_build_object(
    'id', ms.id,
    'mentor_id', ms.mentor_id,
    'student_id', ms.student_id,
    'title', ms.title,
    'description', ms.description,
    'date', ms.date,
    'start_time', ms.start_time,
    'end_time', ms.end_time,
    'status', ms.status,
    'zoom_meeting_link', ms.zoom_meeting_link,
    'created_at', ms.created_at,
    'mentor', json_build_object(
      'id', m.id,
      'name', mp.name,
      'avatar_url', mp.avatar_url
    ),
    'student', json_build_object(
      'id', s.id,
      'name', sp.name,
      'avatar_url', sp.avatar_url
    )
  ) INTO session_data
  FROM 
    mentorship_sessions ms
  JOIN
    mentors m ON ms.mentor_id = m.id
  JOIN
    profiles mp ON m.user_id = mp.id
  JOIN
    students s ON ms.student_id = s.id
  JOIN
    profiles sp ON s.user_id = sp.id
  WHERE 
    ms.id = new_session_id;
  
  RETURN session_data;
END;
$$ LANGUAGE plpgsql;

-- Create function to get user sessions
CREATE OR REPLACE FUNCTION get_user_sessions(
  user_id UUID,
  user_role TEXT
)
RETURNS SETOF json AS $$
BEGIN
  IF user_role = 'MENTOR' THEN
    RETURN QUERY
    SELECT json_build_object(
      'id', ms.id,
      'mentor_id', ms.mentor_id,
      'student_id', ms.student_id,
      'title', ms.title,
      'description', ms.description,
      'date', ms.date,
      'start_time', ms.start_time,
      'end_time', ms.end_time,
      'status', ms.status,
      'zoom_meeting_link', ms.zoom_meeting_link,
      'created_at', ms.created_at,
      'student', json_build_object(
        'id', s.id,
        'name', sp.name,
        'avatar_url', sp.avatar_url
      )
    )
    FROM 
      mentorship_sessions ms
    JOIN
      mentors m ON ms.mentor_id = m.id
    JOIN
      students s ON ms.student_id = s.id
    JOIN
      profiles sp ON s.user_id = sp.id
    WHERE 
      m.user_id = user_id
    ORDER BY
      ms.date DESC;
  ELSIF user_role = 'STUDENT' THEN
    RETURN QUERY
    SELECT json_build_object(
      'id', ms.id,
      'mentor_id', ms.mentor_id,
      'student_id', ms.student_id,
      'title', ms.title,
      'description', ms.description,
      'date', ms.date,
      'start_time', ms.start_time,
      'end_time', ms.end_time,
      'status', ms.status,
      'zoom_meeting_link', ms.zoom_meeting_link,
      'created_at', ms.created_at,
      'mentor', json_build_object(
        'id', m.id,
        'name', mp.name,
        'avatar_url', mp.avatar_url
      )
    )
    FROM 
      mentorship_sessions ms
    JOIN
      mentors m ON ms.mentor_id = m.id
    JOIN
      profiles mp ON m.user_id = mp.id
    JOIN
      students s ON ms.student_id = s.id
    WHERE 
      s.user_id = user_id
    ORDER BY
      ms.date DESC;
  ELSE
    -- For any other role, return empty set
    RETURN;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Grant appropriate permissions
GRANT EXECUTE ON FUNCTION create_mentorship_session(UUID, UUID, TEXT, TEXT, TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_sessions(UUID, TEXT) TO authenticated; 