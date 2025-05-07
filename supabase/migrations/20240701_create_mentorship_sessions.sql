-- Create mentorship sessions table with proper schema and relationships

-- Create mentorship_sessions table if it doesn't exist
CREATE TABLE IF NOT EXISTS mentorship_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id UUID NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('SCHEDULED', 'COMPLETED', 'CANCELLED')) DEFAULT 'SCHEDULED',
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  zoom_meeting_link TEXT,
  notes TEXT,
  feedback TEXT,
  rating INTEGER CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS mentorship_sessions_mentor_id_idx ON mentorship_sessions(mentor_id);
CREATE INDEX IF NOT EXISTS mentorship_sessions_student_id_idx ON mentorship_sessions(student_id);
CREATE INDEX IF NOT EXISTS mentorship_sessions_status_idx ON mentorship_sessions(status);
CREATE INDEX IF NOT EXISTS mentorship_sessions_start_time_idx ON mentorship_sessions(start_time);

-- Enable Row Level Security
ALTER TABLE mentorship_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Mentorship sessions are viewable by involved parties"
  ON mentorship_sessions FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM mentors WHERE id = mentor_id
      UNION
      SELECT user_id FROM students WHERE id = student_id
    )
  );

CREATE POLICY "Mentors can create sessions with students"
  ON mentorship_sessions FOR INSERT
  WITH CHECK (
    auth.uid() = (SELECT user_id FROM mentors WHERE id = mentor_id)
  );

CREATE POLICY "Students can create sessions with mentors"
  ON mentorship_sessions FOR INSERT
  WITH CHECK (
    auth.uid() = (SELECT user_id FROM students WHERE id = student_id)
  );

CREATE POLICY "Mentors can update their sessions"
  ON mentorship_sessions FOR UPDATE
  USING (
    auth.uid() = (SELECT user_id FROM mentors WHERE id = mentor_id)
  );

CREATE POLICY "Students can update their sessions"
  ON mentorship_sessions FOR UPDATE
  USING (
    auth.uid() = (SELECT user_id FROM students WHERE id = student_id)
  );

CREATE POLICY "Service role can manage all mentorship sessions"
  ON mentorship_sessions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create trigger for updating timestamp
CREATE TRIGGER update_mentorship_sessions_updated_at
BEFORE UPDATE ON mentorship_sessions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); 