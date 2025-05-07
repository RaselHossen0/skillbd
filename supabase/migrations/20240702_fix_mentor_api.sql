-- Special fixes for the /api/users/mentors endpoint
-- This addresses the error: "Could not find a relationship between 'users' and 'mentors'"

-- First, let's make sure we have a direct view from users to mentors
CREATE OR REPLACE VIEW users_to_mentors AS
SELECT 
  p.id AS user_id,
  m.id AS mentor_id,
  p.name,
  p.email,
  p.avatar_url,
  p.role,
  m.expertise,
  m.years_of_experience,
  m.hourly_rate,
  m.created_at,
  m.updated_at
FROM 
  profiles p
JOIN 
  mentors m ON p.id = m.user_id;

-- Create a function to handle the GET /api/users/mentors endpoint
CREATE OR REPLACE FUNCTION get_mentors()
RETURNS SETOF json AS $$
BEGIN
  RETURN QUERY
  SELECT 
    json_build_object(
      'id', m.id,
      'user_id', m.user_id,
      'name', p.name,
      'email', p.email,
      'avatar_url', p.avatar_url,
      'expertise', m.expertise,
      'years_of_experience', m.years_of_experience,
      'hourly_rate', m.hourly_rate,
      'skills', COALESCE(
        (SELECT json_agg(json_build_object(
          'id', s.id,
          'name', s.name,
          'category', s.category
        ))
        FROM skills s
        JOIN mentor_expertise me ON s.id = me.skill_id
        WHERE me.mentor_id = m.id),
        '[]'::json
      ),
      'created_at', m.created_at,
      'updated_at', m.updated_at
    )
  FROM 
    mentors m
  JOIN 
    profiles p ON m.user_id = p.id;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the users_mentors view that joins data as expected by the API
CREATE OR REPLACE VIEW users_mentors AS
SELECT
  m.id,
  p.id AS user_id,
  p.name,
  p.email,
  p.avatar_url,
  m.expertise,
  m.years_of_experience,
  m.hourly_rate,
  m.created_at,
  m.updated_at
FROM
  mentors m
JOIN
  profiles p ON m.user_id = p.id;

-- Grant appropriate permissions
GRANT SELECT ON users_to_mentors TO authenticated;
GRANT EXECUTE ON FUNCTION get_mentors() TO authenticated;
GRANT SELECT ON users_mentors TO authenticated;

-- Create specific endpoint for the API
BEGIN;
DROP FUNCTION IF EXISTS http_api_get_mentors();

CREATE OR REPLACE FUNCTION http_api_get_mentors()
RETURNS json AS $$
BEGIN
  RETURN (
    SELECT json_agg(mentor)
    FROM get_mentors() AS mentor
  );
END;
$$ LANGUAGE plpgsql;

COMMIT;

-- RLS Policy for the views
ALTER VIEW users_to_mentors SECURITY INVOKER;
ALTER VIEW users_mentors SECURITY INVOKER; 