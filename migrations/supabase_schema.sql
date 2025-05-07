-- SkillBD Database Schema
-- This schema sets up tables and Row Level Security (RLS) policies for the SkillBD application

-- IMPORTANT NOTES ON ROW LEVEL SECURITY:
-- 1. By default, tables with RLS enabled DENY all operations unless explicitly allowed by a policy
-- 2. We need INSERT policies to allow profile creation during signup
-- 3. The service_role user bypasses RLS, which is needed for admin operations
-- 4. The application uses the service role key in the API routes for operations that require bypassing RLS
-- 5. Regular client-side code uses the anon key which does respect RLS policies

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('STUDENT', 'MENTOR', 'EMPLOYER', 'ADMIN')),
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  education TEXT,
  skills TEXT[],
  interests TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mentors table
CREATE TABLE IF NOT EXISTS mentors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  expertise TEXT[],
  years_of_experience INTEGER,
  hourly_rate DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create employers table
CREATE TABLE IF NOT EXISTS employers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  industry TEXT,
  company_size TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE employers ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Profiles are viewable by everyone" 
  ON profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Service role can insert any profile" 
  ON profiles FOR INSERT 
  TO service_role
  WITH CHECK (true);

-- Policies for students
CREATE POLICY "Students are viewable by everyone" 
  ON students FOR SELECT 
  USING (true);

CREATE POLICY "Students can update their own record" 
  ON students FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Students can insert their own record" 
  ON students FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can insert any student record" 
  ON students FOR INSERT 
  TO service_role
  WITH CHECK (true);

-- Policies for mentors
CREATE POLICY "Mentors are viewable by everyone" 
  ON mentors FOR SELECT 
  USING (true);

CREATE POLICY "Mentors can update their own record" 
  ON mentors FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Mentors can insert their own record" 
  ON mentors FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can insert any mentor record" 
  ON mentors FOR INSERT 
  TO service_role
  WITH CHECK (true);

-- Policies for employers
CREATE POLICY "Employers are viewable by everyone" 
  ON employers FOR SELECT 
  USING (true);

CREATE POLICY "Employers can update their own record" 
  ON employers FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Employers can insert their own record" 
  ON employers FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can insert any employer record" 
  ON employers FOR INSERT 
  TO service_role
  WITH CHECK (true);

-- Create functions and triggers for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updating timestamps
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at
BEFORE UPDATE ON students
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mentors_updated_at
BEFORE UPDATE ON mentors
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employers_updated_at
BEFORE UPDATE ON employers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); 