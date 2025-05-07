-- Create course-related tables for SkillBD

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id UUID REFERENCES mentors(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')),
  duration INTEGER NOT NULL, -- in hours
  price DECIMAL(10, 2),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create course_modules table
CREATE TABLE IF NOT EXISTS course_modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  module_order INTEGER NOT NULL,
  video_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create course_enrollments table
CREATE TABLE IF NOT EXISTS course_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(course_id, student_id)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  type TEXT NOT NULL, -- PROJECT_APPLIED, MENTORSHIP_BOOKED, etc.
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security for all tables
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS courses_mentor_id_idx ON courses(mentor_id);
CREATE INDEX IF NOT EXISTS courses_level_idx ON courses(level);
CREATE INDEX IF NOT EXISTS course_modules_course_id_idx ON course_modules(course_id);
CREATE INDEX IF NOT EXISTS course_modules_module_order_idx ON course_modules(module_order);
CREATE INDEX IF NOT EXISTS course_enrollments_course_id_idx ON course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS course_enrollments_student_id_idx ON course_enrollments(student_id);
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_read_idx ON notifications(read);
CREATE INDEX IF NOT EXISTS messages_sender_id_idx ON messages(sender_id);
CREATE INDEX IF NOT EXISTS messages_receiver_id_idx ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS messages_read_idx ON messages(read);

-- Add triggers for updating timestamps
CREATE TRIGGER update_courses_updated_at
BEFORE UPDATE ON courses
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_modules_updated_at
BEFORE UPDATE ON course_modules
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies for courses
CREATE POLICY "Courses are viewable by everyone" 
  ON courses FOR SELECT 
  USING (true);

CREATE POLICY "Mentors can create their own courses" 
  ON courses FOR INSERT 
  WITH CHECK (
    auth.uid() = (SELECT user_id FROM mentors WHERE id = mentor_id)
  );

CREATE POLICY "Mentors can update their own courses" 
  ON courses FOR UPDATE 
  USING (
    auth.uid() = (SELECT user_id FROM mentors WHERE id = mentor_id)
  );

-- Add RLS policies for course enrollments
CREATE POLICY "Course enrollments are viewable by the enrolled student or course mentor" 
  ON course_enrollments FOR SELECT 
  USING (
    auth.uid() IN (
      SELECT user_id FROM students WHERE id = student_id
      UNION
      SELECT m.user_id FROM mentors m JOIN courses c ON m.id = c.mentor_id WHERE c.id = course_id
    )
  );

CREATE POLICY "Students can enroll in courses" 
  ON course_enrollments FOR INSERT 
  WITH CHECK (
    auth.uid() = (SELECT user_id FROM students WHERE id = student_id)
  );

-- Add RLS policies for notifications
CREATE POLICY "Users can view their own notifications" 
  ON notifications FOR SELECT 
  USING (auth.uid() = user_id);

-- Add RLS policies for messages
CREATE POLICY "Users can view messages they sent or received" 
  ON messages FOR SELECT 
  USING (auth.uid() IN (sender_id, receiver_id));

CREATE POLICY "Users can send messages" 
  ON messages FOR INSERT 
  WITH CHECK (auth.uid() = sender_id);

-- Service role policies
CREATE POLICY "Service role can manage all course-related tables" 
  ON courses FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true); 