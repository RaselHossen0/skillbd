-- Create jobs table for employers
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employer_id UUID NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  location TEXT,
  salary_range TEXT,
  deadline TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'DRAFT', 'CLOSED', 'ARCHIVED')) DEFAULT 'ACTIVE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create job_applications table
CREATE TABLE IF NOT EXISTS job_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  cover_letter TEXT,
  status TEXT NOT NULL CHECK (status IN ('PENDING', 'REVIEWED', 'SHORTLISTED', 'REJECTED', 'HIRED')) DEFAULT 'PENDING',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(job_id, student_id)
);

-- Create job_skills table for many-to-many relationship
CREATE TABLE IF NOT EXISTS job_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  UNIQUE(job_id, skill_id)
);

-- Enable RLS on tables
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_skills ENABLE ROW LEVEL SECURITY;

-- RLS Policies for jobs
CREATE POLICY "Jobs are viewable by everyone" 
  ON jobs FOR SELECT 
  USING (true);

CREATE POLICY "Employers can insert their own jobs" 
  ON jobs FOR INSERT 
  WITH CHECK (employer_id IN (
    SELECT e.id FROM employers e
    JOIN profiles p ON e.user_id = p.id
    WHERE p.id = auth.uid()
  ));

CREATE POLICY "Employers can update their own jobs" 
  ON jobs FOR UPDATE 
  USING (employer_id IN (
    SELECT e.id FROM employers e
    JOIN profiles p ON e.user_id = p.id
    WHERE p.id = auth.uid()
  ));

CREATE POLICY "Employers can delete their own jobs" 
  ON jobs FOR DELETE 
  USING (employer_id IN (
    SELECT e.id FROM employers e
    JOIN profiles p ON e.user_id = p.id
    WHERE p.id = auth.uid()
  ));

-- RLS Policies for job_applications
CREATE POLICY "Job applications are viewable by the job owner" 
  ON job_applications FOR SELECT 
  USING (job_id IN (
    SELECT j.id FROM jobs j
    WHERE j.employer_id IN (
      SELECT e.id FROM employers e
      JOIN profiles p ON e.user_id = p.id
      WHERE p.id = auth.uid()
    )
  ));

CREATE POLICY "Job applications are viewable by the applicant" 
  ON job_applications FOR SELECT 
  USING (student_id IN (
    SELECT s.id FROM students s
    JOIN profiles p ON s.user_id = p.id
    WHERE p.id = auth.uid()
  ));

CREATE POLICY "Students can apply to jobs" 
  ON job_applications FOR INSERT 
  WITH CHECK (student_id IN (
    SELECT s.id FROM students s
    JOIN profiles p ON s.user_id = p.id
    WHERE p.id = auth.uid()
  ));

CREATE POLICY "Students can update their own applications" 
  ON job_applications FOR UPDATE 
  USING (student_id IN (
    SELECT s.id FROM students s
    JOIN profiles p ON s.user_id = p.id
    WHERE p.id = auth.uid()
  ));

CREATE POLICY "Employers can update applications for their jobs" 
  ON job_applications FOR UPDATE 
  USING (job_id IN (
    SELECT j.id FROM jobs j
    WHERE j.employer_id IN (
      SELECT e.id FROM employers e
      JOIN profiles p ON e.user_id = p.id
      WHERE p.id = auth.uid()
    )
  ));

-- Add triggers for updating timestamps
CREATE TRIGGER update_jobs_updated_at
BEFORE UPDATE ON jobs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_applications_updated_at
BEFORE UPDATE ON job_applications
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();