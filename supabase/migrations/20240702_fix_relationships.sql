-- Fix relationships between tables to match API expectations

-- Issue 1: "Could not find a relationship between 'users' and 'mentors'"
-- This happens because in our schema we're using 'profiles' but the API is looking for 'users'

-- First, let's create a view that makes 'profiles' accessible as 'users'
CREATE OR REPLACE VIEW users AS
SELECT * FROM profiles;

-- Issue 2: "Could not find the 'date' column of 'mentorship_sessions'"
-- The API is trying to use a 'date' column but we named it 'start_time'

-- Add column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mentorship_sessions' AND column_name = 'date'
  ) THEN
    -- Add the date column
    ALTER TABLE mentorship_sessions ADD COLUMN date TIMESTAMP WITH TIME ZONE;
    
    -- Update existing records to set date equal to start_time
    UPDATE mentorship_sessions SET date = start_time;
  END IF;
END $$;

-- Create a trigger function to keep start_time and date in sync
CREATE OR REPLACE FUNCTION sync_session_dates()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.date := NEW.start_time;
    NEW.start_time := NEW.date;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.start_time <> OLD.start_time THEN
      NEW.date := NEW.start_time;
    END IF;
    
    IF NEW.date <> OLD.date THEN
      NEW.start_time := NEW.date;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger (only if the function exists and the table exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'sync_session_dates'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name = 'mentorship_sessions'
  ) THEN
    -- Drop the trigger if it already exists
    DROP TRIGGER IF EXISTS sync_session_dates_trigger ON mentorship_sessions;
    
    -- Create the trigger
    CREATE TRIGGER sync_session_dates_trigger
    BEFORE INSERT OR UPDATE ON mentorship_sessions
    FOR EACH ROW
    EXECUTE FUNCTION sync_session_dates();
  END IF;
END $$;

-- Issue 3: Relationship between mentors and users
-- Create a view that exposes mentors with user details directly
CREATE OR REPLACE VIEW mentors_with_users AS
SELECT 
  m.id,
  m.user_id,
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
  mentors m
JOIN 
  profiles p ON m.user_id = p.id;

-- Grant access to the views
GRANT SELECT ON users TO authenticated;
GRANT SELECT ON mentors_with_users TO authenticated;

-- Make sure we have a proper foreign key from mentors to profiles
ALTER TABLE mentors DROP CONSTRAINT IF EXISTS mentors_user_id_fkey;
ALTER TABLE mentors ADD CONSTRAINT mentors_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Similarly for students
ALTER TABLE students DROP CONSTRAINT IF EXISTS students_user_id_fkey;
ALTER TABLE students ADD CONSTRAINT students_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Create a comprehensive view for mentorship sessions that includes all related data
CREATE OR REPLACE VIEW complete_mentorship_sessions AS
SELECT 
  ms.id,
  ms.mentor_id,
  ms.student_id,
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
  m.user_id AS mentor_user_id,
  mp.name AS mentor_name,
  mp.avatar_url AS mentor_avatar,
  s.user_id AS student_user_id,
  sp.name AS student_name,
  sp.avatar_url AS student_avatar,
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
  profiles sp ON s.user_id = sp.id;

-- Grant access to the complete view
GRANT SELECT ON complete_mentorship_sessions TO authenticated; 