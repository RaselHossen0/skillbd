-- Create assessment_questions table for employer-created assessments

CREATE TABLE IF NOT EXISTS assessment_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employer_id UUID NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options TEXT[] NOT NULL,
  correct_option INTEGER NOT NULL CHECK (correct_option >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE assessment_questions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Employers can view their own questions"
  ON assessment_questions FOR SELECT
  USING (auth.uid() = employer_id);

CREATE POLICY "Employers can insert their own questions"
  ON assessment_questions FOR INSERT
  WITH CHECK (auth.uid() = employer_id);

CREATE POLICY "Employers can update their own questions"
  ON assessment_questions FOR UPDATE
  USING (auth.uid() = employer_id);

CREATE POLICY "Employers can delete their own questions"
  ON assessment_questions FOR DELETE
  USING (auth.uid() = employer_id);

-- Service role can do anything
CREATE POLICY "Service role can manage all questions"
  ON assessment_questions
  TO service_role
  USING (true)
  WITH CHECK (true); 