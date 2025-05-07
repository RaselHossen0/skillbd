-- Create project-related tables for SkillBD

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employer_id UUID NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  is_paid BOOLEAN DEFAULT FALSE,
  budget DECIMAL(10, 2),
  deadline TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL CHECK (status IN ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')) DEFAULT 'OPEN',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create skills table
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create project_skills table (for many-to-many relationship)
CREATE TABLE IF NOT EXISTS project_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  UNIQUE(project_id, skill_id)
);

-- Create student_skills table (for many-to-many relationship)
CREATE TABLE IF NOT EXISTS student_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  level INTEGER NOT NULL CHECK (level >= 1 AND level <= 5),
  verified BOOLEAN DEFAULT FALSE,
  UNIQUE(student_id, skill_id)
);

-- Create mentor_expertise table (for many-to-many relationship)
CREATE TABLE IF NOT EXISTS mentor_expertise (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id UUID NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  level INTEGER NOT NULL CHECK (level >= 1 AND level <= 5),
  UNIQUE(mentor_id, skill_id)
);

-- Create project_applicants table
CREATE TABLE IF NOT EXISTS project_applicants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  cover_letter TEXT,
  status TEXT NOT NULL CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED')) DEFAULT 'PENDING',
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, student_id)
);

-- Create completed_projects table
CREATE TABLE IF NOT EXISTS completed_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  submission_url TEXT,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, student_id)
);

-- Create project_reviews table
CREATE TABLE IF NOT EXISTS project_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  completed_project_id UUID NOT NULL REFERENCES completed_projects(id) ON DELETE CASCADE,
  mentor_id UUID REFERENCES mentors(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security for all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_expertise ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE completed_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_reviews ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS projects_employer_id_idx ON projects(employer_id);
CREATE INDEX IF NOT EXISTS projects_status_idx ON projects(status);
CREATE INDEX IF NOT EXISTS project_skills_project_id_idx ON project_skills(project_id);
CREATE INDEX IF NOT EXISTS student_skills_student_id_idx ON student_skills(student_id);
CREATE INDEX IF NOT EXISTS mentor_expertise_mentor_id_idx ON mentor_expertise(mentor_id);
CREATE INDEX IF NOT EXISTS project_applicants_project_id_idx ON project_applicants(project_id);
CREATE INDEX IF NOT EXISTS project_applicants_student_id_idx ON project_applicants(student_id);
CREATE INDEX IF NOT EXISTS completed_projects_project_id_idx ON completed_projects(project_id);
CREATE INDEX IF NOT EXISTS completed_projects_student_id_idx ON completed_projects(student_id);
CREATE INDEX IF NOT EXISTS project_reviews_completed_project_id_idx ON project_reviews(completed_project_id);

-- Add triggers for updating timestamps
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies for each table (examples for projects)
CREATE POLICY "Projects are viewable by everyone" 
  ON projects FOR SELECT 
  USING (true);

CREATE POLICY "Employers can create their own projects" 
  ON projects FOR INSERT 
  WITH CHECK (
    auth.uid() = (SELECT user_id FROM employers WHERE id = employer_id)
  );

CREATE POLICY "Employers can update their own projects" 
  ON projects FOR UPDATE 
  USING (
    auth.uid() = (SELECT user_id FROM employers WHERE id = employer_id)
  );

CREATE POLICY "Employers can delete their own projects" 
  ON projects FOR DELETE 
  USING (
    auth.uid() = (SELECT user_id FROM employers WHERE id = employer_id)
  );

CREATE POLICY "Service role can manage all projects" 
  ON projects FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true); 