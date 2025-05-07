-- Add seed data for SkillBD platform
-- This helps with initial testing and development

-- Add skills by category
INSERT INTO skills (id, name, category) 
VALUES 
  -- Programming Languages
  (uuid_generate_v4(), 'JavaScript', 'Programming'),
  (uuid_generate_v4(), 'Python', 'Programming'),
  (uuid_generate_v4(), 'Java', 'Programming'),
  (uuid_generate_v4(), 'TypeScript', 'Programming'),
  (uuid_generate_v4(), 'C#', 'Programming'),
  
  -- Frameworks
  (uuid_generate_v4(), 'React', 'Framework'),
  (uuid_generate_v4(), 'Next.js', 'Framework'),
  (uuid_generate_v4(), 'Angular', 'Framework'),
  (uuid_generate_v4(), 'Vue.js', 'Framework'),
  (uuid_generate_v4(), 'Django', 'Framework'),
  (uuid_generate_v4(), 'Express.js', 'Framework'),
  
  -- Databases
  (uuid_generate_v4(), 'PostgreSQL', 'Database'),
  (uuid_generate_v4(), 'MySQL', 'Database'),
  (uuid_generate_v4(), 'MongoDB', 'Database'),
  (uuid_generate_v4(), 'Supabase', 'Database'),
  (uuid_generate_v4(), 'Firebase', 'Database'),
  
  -- DevOps
  (uuid_generate_v4(), 'Docker', 'DevOps'),
  (uuid_generate_v4(), 'Kubernetes', 'DevOps'),
  (uuid_generate_v4(), 'AWS', 'DevOps'),
  (uuid_generate_v4(), 'CI/CD', 'DevOps'),
  
  -- Design
  (uuid_generate_v4(), 'UI Design', 'Design'),
  (uuid_generate_v4(), 'UX Design', 'Design'),
  (uuid_generate_v4(), 'Figma', 'Design'),
  (uuid_generate_v4(), 'Adobe XD', 'Design'),
  
  -- Soft Skills
  (uuid_generate_v4(), 'Project Management', 'Soft Skills'),
  (uuid_generate_v4(), 'Communication', 'Soft Skills'),
  (uuid_generate_v4(), 'Team Leadership', 'Soft Skills'),
  (uuid_generate_v4(), 'Problem Solving', 'Soft Skills')
ON CONFLICT (name) DO NOTHING;

-- Create a function to add sample project data
CREATE OR REPLACE FUNCTION add_sample_projects()
RETURNS void AS $$
DECLARE
  employer_id UUID;
  project_id UUID;
  skill_id_1 UUID;
  skill_id_2 UUID;
BEGIN
  -- Get first employer ID (if exists)
  SELECT id INTO employer_id FROM employers LIMIT 1;
  
  -- Only proceed if we have an employer
  IF employer_id IS NOT NULL THEN
    -- Get two random skill IDs
    SELECT id INTO skill_id_1 FROM skills WHERE category = 'Programming' ORDER BY RANDOM() LIMIT 1;
    SELECT id INTO skill_id_2 FROM skills WHERE category = 'Framework' ORDER BY RANDOM() LIMIT 1;
    
    -- Add a sample project
    INSERT INTO projects 
      (id, employer_id, title, description, is_paid, budget, deadline, status)
    VALUES
      (
        uuid_generate_v4(), 
        employer_id, 
        'E-commerce Website Development', 
        'We need to develop a responsive e-commerce website with user authentication, product catalog, shopping cart, and payment integration.', 
        TRUE, 
        2500.00, 
        NOW() + INTERVAL '30 days', 
        'OPEN'
      )
    RETURNING id INTO project_id;
    
    -- Link skills to project
    IF skill_id_1 IS NOT NULL THEN
      INSERT INTO project_skills (id, project_id, skill_id)
      VALUES (uuid_generate_v4(), project_id, skill_id_1);
    END IF;
    
    IF skill_id_2 IS NOT NULL THEN
      INSERT INTO project_skills (id, project_id, skill_id)
      VALUES (uuid_generate_v4(), project_id, skill_id_2);
    END IF;
    
    -- Add another sample project
    INSERT INTO projects 
      (id, employer_id, title, description, is_paid, budget, deadline, status)
    VALUES
      (
        uuid_generate_v4(), 
        employer_id, 
        'Mobile App Development', 
        'Looking for developers to create a cross-platform mobile app for both Android and iOS. The app will be a social networking platform for local communities.', 
        TRUE, 
        3000.00, 
        NOW() + INTERVAL '45 days', 
        'OPEN'
      )
    RETURNING id INTO project_id;
    
    -- Link skills to project
    SELECT id INTO skill_id_1 FROM skills WHERE name = 'React' LIMIT 1;
    SELECT id INTO skill_id_2 FROM skills WHERE name = 'JavaScript' LIMIT 1;
    
    IF skill_id_1 IS NOT NULL THEN
      INSERT INTO project_skills (id, project_id, skill_id)
      VALUES (uuid_generate_v4(), project_id, skill_id_1);
    END IF;
    
    IF skill_id_2 IS NOT NULL THEN
      INSERT INTO project_skills (id, project_id, skill_id)
      VALUES (uuid_generate_v4(), project_id, skill_id_2);
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create a function to add sample courses
CREATE OR REPLACE FUNCTION add_sample_courses()
RETURNS void AS $$
DECLARE
  mentor_id UUID;
  course_id UUID;
BEGIN
  -- Get first mentor ID (if exists)
  SELECT id INTO mentor_id FROM mentors LIMIT 1;
  
  -- Only proceed if we have a mentor
  IF mentor_id IS NOT NULL THEN
    -- Add a sample course
    INSERT INTO courses 
      (id, mentor_id, title, description, level, duration, price, image_url)
    VALUES
      (
        uuid_generate_v4(), 
        mentor_id, 
        'Web Development with React and Next.js', 
        'Learn how to build modern web applications using React and Next.js. This course covers everything from the basics to advanced concepts.', 
        'INTERMEDIATE', 
        24, 
        79.99,
        'https://example.com/course-images/web-dev.jpg'
      )
    RETURNING id INTO course_id;
    
    -- Add modules to the course
    INSERT INTO course_modules 
      (id, course_id, title, description, module_order, video_url)
    VALUES
      (
        uuid_generate_v4(),
        course_id,
        'Introduction to React',
        'Learn the basics of React, including components, props, and state management.',
        1,
        'https://example.com/videos/intro-to-react.mp4'
      ),
      (
        uuid_generate_v4(),
        course_id,
        'Working with Next.js',
        'Understand how Next.js builds upon React to provide server-side rendering and more.',
        2,
        'https://example.com/videos/next-js-basics.mp4'
      ),
      (
        uuid_generate_v4(),
        course_id,
        'Building a Full Stack Application',
        'Put it all together by building a complete application with authentication and database integration.',
        3,
        'https://example.com/videos/full-stack-app.mp4'
      );
    
    -- Add another sample course
    INSERT INTO courses 
      (id, mentor_id, title, description, level, duration, price, image_url)
    VALUES
      (
        uuid_generate_v4(), 
        mentor_id, 
        'Data Science Fundamentals with Python', 
        'Master the basics of data science using Python. Learn data manipulation, visualization, and basic machine learning.', 
        'BEGINNER', 
        20, 
        69.99,
        'https://example.com/course-images/data-science.jpg'
      );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Execute the functions to add sample data
SELECT add_sample_projects();
SELECT add_sample_courses();

-- Drop the temporary functions
DROP FUNCTION IF EXISTS add_sample_projects();
DROP FUNCTION IF EXISTS add_sample_courses(); 