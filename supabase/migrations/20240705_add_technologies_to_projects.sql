-- Add technologies column to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS technologies JSONB DEFAULT '[]'::jsonb;

-- Add student_assignments column to track assigned students
ALTER TABLE projects ADD COLUMN IF NOT EXISTS assigned_students JSONB DEFAULT '[]'::jsonb;

-- Create function to get available projects with technologies
CREATE OR REPLACE FUNCTION get_available_projects()
RETURNS SETOF projects
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT p.* 
  FROM projects p
  WHERE p.status = 'OPEN'
  ORDER BY p.created_at DESC;
$$;

-- Update project creation function to handle technologies
CREATE OR REPLACE FUNCTION create_project(
  employer_id UUID,
  title TEXT,
  description TEXT,
  is_paid BOOLEAN DEFAULT FALSE,
  budget DECIMAL(10, 2) DEFAULT NULL,
  deadline TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  technologies JSONB DEFAULT '[]'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  project_id UUID;
BEGIN
  -- Create project
  INSERT INTO projects (
    employer_id,
    title,
    description,
    is_paid,
    budget,
    deadline,
    technologies
  ) VALUES (
    employer_id,
    title,
    description,
    is_paid,
    budget,
    deadline,
    technologies
  )
  RETURNING id INTO project_id;
  
  RETURN project_id;
END;
$$;

-- Add comments to describe the new columns
COMMENT ON COLUMN projects.technologies IS 'Array of technology/skill names required for the project';
COMMENT ON COLUMN projects.assigned_students IS 'Array of student IDs assigned to the project'; 