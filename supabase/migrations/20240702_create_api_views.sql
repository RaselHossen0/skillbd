-- Create API-friendly views to support existing API endpoints

-- Create a view specifically for the /api/users/mentors endpoint
CREATE OR REPLACE VIEW api_mentors AS
SELECT 
  m.id,
  m.user_id,
  p.name,
  p.email,
  p.avatar_url,
  m.expertise,
  m.years_of_experience,
  m.hourly_rate,
  COALESCE(
    (SELECT json_agg(json_build_object(
      'id', s.id,
      'name', s.name,
      'category', s.category
    ))
    FROM skills s
    JOIN mentor_expertise me ON s.id = me.skill_id
    WHERE me.mentor_id = m.id),
    '[]'::json
  ) AS skills,
  m.created_at,
  m.updated_at
FROM 
  mentors m
JOIN 
  profiles p ON m.user_id = p.id;

-- Create view for students with skills (if skills table exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'skills' AND table_name = 'student_skills'
  ) THEN
    EXECUTE '
      CREATE OR REPLACE VIEW api_students AS
      SELECT 
        s.id,
        s.user_id,
        p.name,
        p.email,
        p.avatar_url,
        s.education,
        COALESCE(
          (SELECT json_agg(json_build_object(
            ''id'', sk.id,
            ''name'', sk.name,
            ''category'', sk.category,
            ''level'', ss.level,
            ''verified'', ss.verified
          ))
          FROM skills sk
          JOIN student_skills ss ON sk.id = ss.skill_id
          WHERE ss.student_id = s.id),
          ''[]''::json
        ) AS skills,
        s.interests,
        s.created_at,
        s.updated_at
      FROM 
        students s
      JOIN 
        profiles p ON s.user_id = p.id
    ';
  ELSE
    -- Simplified version without skills
    EXECUTE '
      CREATE OR REPLACE VIEW api_students AS
      SELECT 
        s.id,
        s.user_id,
        p.name,
        p.email,
        p.avatar_url,
        s.education,
        ''[]''::json AS skills,
        s.interests,
        s.created_at,
        s.updated_at
      FROM 
        students s
      JOIN 
        profiles p ON s.user_id = p.id
    ';
  END IF;
END $$;

-- Create view for employers with projects
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'projects'
  ) THEN
    EXECUTE '
      CREATE OR REPLACE VIEW api_employers AS
      SELECT 
        e.id,
        e.user_id,
        p.name,
        p.email,
        p.avatar_url,
        e.company_name,
        e.industry,
        e.company_size,
        e.website,
        COALESCE(
          (SELECT json_agg(json_build_object(
            ''id'', pr.id,
            ''title'', pr.title,
            ''status'', pr.status
          ))
          FROM projects pr
          WHERE pr.employer_id = e.id),
          ''[]''::json
        ) AS projects,
        e.created_at,
        e.updated_at
      FROM 
        employers e
      JOIN 
        profiles p ON e.user_id = p.id
    ';
  ELSE
    -- Simplified version without projects
    EXECUTE '
      CREATE OR REPLACE VIEW api_employers AS
      SELECT 
        e.id,
        e.user_id,
        p.name,
        p.email,
        p.avatar_url,
        e.company_name,
        e.industry,
        e.company_size,
        e.website,
        ''[]''::json AS projects,
        e.created_at,
        e.updated_at
      FROM 
        employers e
      JOIN 
        profiles p ON e.user_id = p.id
    ';
  END IF;
END $$;

-- Create view for projects with related information
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'projects' AND table_name = 'skills' AND table_name = 'project_skills'
  ) THEN
    EXECUTE '
      CREATE OR REPLACE VIEW api_projects AS
      SELECT 
        p.id,
        p.employer_id,
        e.company_name,
        p.title,
        p.description,
        p.is_paid,
        p.budget,
        p.deadline,
        p.status,
        COALESCE(
          (SELECT json_agg(json_build_object(
            ''id'', s.id,
            ''name'', s.name,
            ''category'', s.category
          ))
          FROM skills s
          JOIN project_skills ps ON s.id = ps.skill_id
          WHERE ps.project_id = p.id),
          ''[]''::json
        ) AS skills,
        (SELECT COUNT(*) FROM project_applicants pa WHERE pa.project_id = p.id) AS applicants_count,
        p.created_at,
        p.updated_at
      FROM 
        projects p
      JOIN 
        employers e ON p.employer_id = e.id
    ';
  END IF;
END $$;

-- Check if the date column exists in mentorship_sessions before creating the view
-- Create view for mentorship sessions with full details
DO $$
DECLARE
  date_column_exists BOOLEAN;
BEGIN
  -- Check if the date column exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mentorship_sessions' AND column_name = 'date'
  ) INTO date_column_exists;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'mentorship_sessions'
  ) THEN
    -- Create view with or without date column based on its existence
    IF date_column_exists THEN
      EXECUTE '
        CREATE OR REPLACE VIEW api_mentorship_sessions AS
        SELECT 
          ms.id,
          ms.mentor_id,
          m.user_id AS mentor_user_id,
          mp.name AS mentor_name,
          mp.avatar_url AS mentor_avatar,
          ms.student_id,
          s.user_id AS student_user_id,
          sp.name AS student_name,
          sp.avatar_url AS student_avatar,
          ms.title,
          ms.description,
          ms.status,
          ms.start_time,
          ms.end_time,
          ms.date,
          ms.zoom_meeting_link,
          ms.notes,
          ms.feedback,
          ms.rating,
          ms.created_at,
          ms.updated_at
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
      ';
    ELSE
      EXECUTE '
        CREATE OR REPLACE VIEW api_mentorship_sessions AS
        SELECT 
          ms.id,
          ms.mentor_id,
          m.user_id AS mentor_user_id,
          mp.name AS mentor_name,
          mp.avatar_url AS mentor_avatar,
          ms.student_id,
          s.user_id AS student_user_id,
          sp.name AS student_name,
          sp.avatar_url AS student_avatar,
          ms.title,
          ms.description,
          ms.status,
          ms.start_time,
          ms.end_time,
          ms.start_time AS date, -- Use start_time as fallback for date
          ms.zoom_meeting_link,
          ms.notes,
          ms.feedback,
          ms.rating,
          ms.created_at,
          ms.updated_at
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
      ';
    END IF;
  END IF;
END $$;

-- Grant access to the views
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_views WHERE viewname = 'api_mentors'
  ) THEN
    EXECUTE 'GRANT SELECT ON api_mentors TO authenticated';
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM pg_views WHERE viewname = 'api_students'
  ) THEN
    EXECUTE 'GRANT SELECT ON api_students TO authenticated';
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM pg_views WHERE viewname = 'api_employers'
  ) THEN
    EXECUTE 'GRANT SELECT ON api_employers TO authenticated';
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM pg_views WHERE viewname = 'api_projects'
  ) THEN
    EXECUTE 'GRANT SELECT ON api_projects TO authenticated';
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM pg_views WHERE viewname = 'api_mentorship_sessions'
  ) THEN
    EXECUTE 'GRANT SELECT ON api_mentorship_sessions TO authenticated';
  END IF;
END $$; 