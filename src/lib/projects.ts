import { supabase } from './supabase';

// Types for project related operations
export interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  is_paid: boolean;
  budget?: number;
  deadline?: string;
  created_at: string;
  updated_at: string;
  technologies?: string[];
  employer_id?: string;
  mentor_id?: string;
  student_id?: string;
}

export interface ProjectApplication {
  id: string;
  project_id: string;
  student_id: string;
  cover_letter?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  applied_at: string;
}

export interface ProjectSubmission {
  id: string;
  project_id: string;
  student_id: string;
  submission_url: string;
  feedback?: string;
  completed_at: string;
}

export interface ProjectReview {
  id: string;
  completed_project_id: string;
  mentor_id?: string;
  employer_id?: string;
  rating: number;
  feedback: string;
  created_at: string;
}

// EMPLOYER OPERATIONS

// Create a new project (for employers)
export async function createEmployerProject(data: {
  employer_id: string;
  title: string;
  description: string;
  is_paid?: boolean;
  budget?: number;
  deadline?: string;
  technologies?: string[];
}) {
  try {
    const projectData = {
      employer_id: data.employer_id,
      title: data.title,
      description: data.description,
      is_paid: data.is_paid || false,
      budget: data.budget,
      deadline: data.deadline,
      status: 'OPEN',
      technologies: data.technologies || []
    };

    const { data: project, error } = await supabase
      .from('projects')
      .insert(projectData)
      .select()
      .single();

    if (error) throw error;
    return project;
  } catch (error) {
    console.error('Error creating employer project:', error);
    throw error;
  }
}

// Get all projects created by an employer
export async function getEmployerProjects(employerId: string) {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        project_applicants (
          id,
          student_id,
          status,
          applied_at,
          students (
            id,
            user_id,
            users (
              name,
              avatar_url
            )
          )
        )
      `)
      .eq('employer_id', employerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching employer projects:', error);
    throw error;
  }
}

// Update an employer project
export async function updateEmployerProject(
  projectId: string,
  data: {
    title?: string;
    description?: string;
    is_paid?: boolean;
    budget?: number;
    deadline?: string;
    status?: string;
    technologies?: string[];
  }
) {
  try {
    const { data: project, error } = await supabase
      .from('projects')
      .update(data)
      .eq('id', projectId)
      .select()
      .single();

    if (error) throw error;
    return project;
  } catch (error) {
    console.error('Error updating employer project:', error);
    throw error;
  }
}

// Delete an employer project
export async function deleteEmployerProject(projectId: string) {
  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting employer project:', error);
    throw error;
  }
}

// Review a student's project submission
export async function reviewProjectSubmission(data: {
  completed_project_id: string;
  employer_id: string;
  rating: number;
  feedback: string;
}) {
  try {
    const reviewData = {
      completed_project_id: data.completed_project_id,
      employer_id: data.employer_id,
      rating: data.rating,
      feedback: data.feedback
    };

    const { data: review, error } = await supabase
      .from('project_reviews')
      .insert(reviewData)
      .select()
      .single();

    if (error) throw error;
    return review;
  } catch (error) {
    console.error('Error reviewing project submission:', error);
    throw error;
  }
}

// MENTOR OPERATIONS

// Create a mentor project task/challenge
export async function createMentorProject(data: {
  mentor_id: string;
  title: string;
  description: string;
  deadline?: string;
  technologies?: string[];
  student_id?: string;
}) {
  try {
    // For mentors, we create a special type of project
    const projectData = {
      mentor_id: data.mentor_id,
      title: data.title,
      description: data.description,
      deadline: data.deadline,
      status: 'IN_PROGRESS',
      is_paid: false,
      technologies: data.technologies || [],
      student_id: data.student_id // Can be assigned directly to a student
    };

    const { data: project, error } = await supabase
      .from('mentor_challenges')
      .insert(projectData)
      .select()
      .single();

    if (error) throw error;
    return project;
  } catch (error) {
    console.error('Error creating mentor project:', error);
    throw error;
  }
}

// Get all projects/challenges created by a mentor
export async function getMentorProjects(mentorId: string) {
  try {
    const { data, error } = await supabase
      .from('mentor_challenges')
      .select(`
        *,
        students (
          id,
          user_id,
          users (
            name,
            avatar_url
          )
        )
      `)
      .eq('mentor_id', mentorId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching mentor projects:', error);
    throw error;
  }
}

// Update a mentor project/challenge
export async function updateMentorProject(
  projectId: string,
  data: {
    title?: string;
    description?: string;
    deadline?: string;
    status?: string;
    technologies?: string[];
    student_id?: string;
  }
) {
  try {
    const { data: project, error } = await supabase
      .from('mentor_challenges')
      .update(data)
      .eq('id', projectId)
      .select()
      .single();

    if (error) throw error;
    return project;
  } catch (error) {
    console.error('Error updating mentor project:', error);
    throw error;
  }
}

// Delete a mentor project/challenge
export async function deleteMentorProject(projectId: string) {
  try {
    const { error } = await supabase
      .from('mentor_challenges')
      .delete()
      .eq('id', projectId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting mentor project:', error);
    throw error;
  }
}

// Review a student's challenge submission
export async function reviewStudentChallenge(
  projectId: string,
  data: {
    mentor_id: string;
    rating: number;
    feedback: string;
    status: string;
  }
) {
  try {
    // First update the challenge status
    const { error: updateError } = await supabase
      .from('mentor_challenges')
      .update({ status: data.status })
      .eq('id', projectId);

    if (updateError) throw updateError;

    // Then add a review
    const reviewData = {
      challenge_id: projectId,
      mentor_id: data.mentor_id,
      rating: data.rating,
      feedback: data.feedback
    };

    const { data: review, error } = await supabase
      .from('challenge_reviews')
      .insert(reviewData)
      .select()
      .single();

    if (error) throw error;
    return review;
  } catch (error) {
    console.error('Error reviewing student challenge:', error);
    throw error;
  }
}

// STUDENT OPERATIONS

// Get all available projects for students
export async function getAvailableProjects() {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        employers (
          id,
          company_name
        )
      `)
      .eq('status', 'OPEN')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Projects now have technologies directly in the technologies column
    // Return the data as is, or transform it if needed
    return data.map((project: any) => {
      // Ensure technologies is an array even if it's null/undefined
      const technologies = project.technologies || [];
      
      return {
        ...project,
        technologies
      };
    });
  } catch (error) {
    console.error('Error fetching available projects:', error);
    throw error;
  }
}

// Get projects assigned to or applied by a student
export async function getStudentProjects(studentId: string) {
  try {
    // First get projects the student has applied to
    const { data: applications, error: appError } = await supabase
      .from('project_applicants')
      .select(`
        id,
        status,
        applied_at,
        project_id,
        projects (
          *,
          employers (
            id,
            company_name
          )
        )
      `)
      .eq('student_id', studentId);

    if (appError) throw appError;

    // Get assigned projects
    const { data: assignedProjects, error: assignedError } = await supabase
      .from('projects')
      .select(`
        id,
        title,
        description,
        is_paid,
        budget,
        deadline,
        status,
        created_at,
        employer_id,
        employers (
          id,
          company_name
        )
      `)
      .eq('status', 'IN_PROGRESS')
      .contains('assigned_students', [studentId]);

    if (assignedError) {
      console.error('Error fetching assigned projects:', assignedError);
    }

    // Combine both types of projects
    return {
      applications: applications || [],
      assignedProjects: assignedProjects || []
    };
  } catch (error) {
    console.error('Error fetching student projects:', error);
    throw error;
  }
}

// Apply to a project
export async function applyToProject(data: {
  project_id: string;
  student_id: string;
  cover_letter?: string;
}) {
  try {
    const { data: application, error } = await supabase
      .from('project_applicants')
      .insert({
        project_id: data.project_id,
        student_id: data.student_id,
        cover_letter: data.cover_letter,
        status: 'PENDING'
      })
      .select()
      .single();

    if (error) throw error;
    return application;
  } catch (error) {
    console.error('Error applying to project:', error);
    throw error;
  }
}

// Update a project application
export async function updateProjectApplication(
  applicationId: string,
  data: {
    cover_letter?: string;
  }
) {
  try {
    const { data: application, error } = await supabase
      .from('project_applicants')
      .update(data)
      .eq('id', applicationId)
      .select()
      .single();

    if (error) throw error;
    return application;
  } catch (error) {
    console.error('Error updating project application:', error);
    throw error;
  }
}

// Withdraw a project application
export async function withdrawProjectApplication(applicationId: string) {
  try {
    const { error } = await supabase
      .from('project_applicants')
      .delete()
      .eq('id', applicationId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error withdrawing project application:', error);
    throw error;
  }
}

// Submit a completed project
export async function submitCompletedProject(data: {
  project_id: string;
  student_id: string;
  submission_url: string;
}) {
  try {
    // Create a completed project record
    const { data: submission, error } = await supabase
      .from('completed_projects')
      .insert({
        project_id: data.project_id,
        student_id: data.student_id,
        submission_url: data.submission_url
      })
      .select()
      .single();

    if (error) throw error;

    // Update the project status
    const { error: updateError } = await supabase
      .from('projects')
      .update({ status: 'COMPLETED' })
      .eq('id', data.project_id);

    if (updateError) throw updateError;

    return submission;
  } catch (error) {
    console.error('Error submitting completed project:', error);
    throw error;
  }
}

// Submit a challenge response to mentor
export async function submitChallengeResponse(
  challengeId: string,
  data: {
    student_id: string;
    submission_url: string;
    notes?: string;
  }
) {
  try {
    // Update the challenge with submission data
    const { data: challenge, error } = await supabase
      .from('mentor_challenges')
      .update({
        submission_url: data.submission_url,
        student_notes: data.notes,
        status: 'PENDING_REVIEW',
        updated_at: new Date().toISOString()
      })
      .eq('id', challengeId)
      .eq('student_id', data.student_id)
      .select()
      .single();

    if (error) throw error;
    return challenge;
  } catch (error) {
    console.error('Error submitting challenge response:', error);
    throw error;
  }
}

// Get project details by ID (for any role)
export async function getProjectById(projectId: string) {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        id,
        title,
        description,
        is_paid,
        budget,
        deadline,
        status,
        created_at,
        updated_at,
        employer_id,
        employers (
          id,
          company_name
        ),
        project_skills (
          skill_id,
          skills (
            id,
            name
          )
        ),
        project_applicants (
          id,
          student_id,
          status,
          cover_letter,
          applied_at,
          students (
            id,
            user_id,
            users (
              name,
              avatar_url
            )
          )
        )
      `)
      .eq('id', projectId)
      .single();

    if (error) throw error;
    
    // Process the data
    if (data) {
      // Extract technologies/skills
      const technologies = data.project_skills
        ?.map((ps: any) => ps.skills?.name)
        .filter(Boolean) || [];
      
      // Format the result
      return {
        ...data,
        technologies
      };
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching project details:', error);
    throw error;
  }
}

// Get mentor expertise/challenge details by ID
export async function getMentorChallengeById(challengeId: string) {
  try {
    const { data, error } = await supabase
      .from('mentor_expertise')
      .select(`
        id,
        title,
        description,
        mentor_id,
        student_id,
        status,
        created_at,
        updated_at,
        deadline,
        submission_url,
        mentors (
          id,
          user_id,
          users (
            name,
            avatar_url
          )
        ),
        students (
          id,
          user_id,
          users (
            name,
            avatar_url
          )
        )
      `)
      .eq('id', challengeId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching mentor expertise details:', error);
    throw error;
  }
} 