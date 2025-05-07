// User Roles
export type UserRole = 'STUDENT' | 'MENTOR' | 'EMPLOYER';

// User Type
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  bio?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  // Relationship fields
  students?: Student[];
  mentors?: Mentor[];
  employers?: Employer[];
  // Additional supabase auth fields
  aud?: string;
  email_confirmed_at?: string;
}

// Student Type
export interface Student {
  id: string;
  user_id: string;
  education?: string;
  skills?: string[];
  interests?: string[];
  created_at: string;
  updated_at: string;
}

// Employee Type
export interface Employee {
  id: string;
  user_id: string;
  skills?: string[];
  experience?: string;
  certifications?: string[];
  created_at: string;
  updated_at: string;
}

// Mentor Type
export interface Mentor {
  id: string;
  user_id: string;
  expertise?: string[];
  years_of_experience?: number;
  hourly_rate?: number;
  created_at: string;
  updated_at: string;
}

// Employer Type
export interface Employer {
  id: string;
  user_id: string;
  company_name: string;
  industry?: string;
  company_size?: string;
  website?: string;
  created_at: string;
  updated_at: string;
}

// Skill Type
export interface Skill {
  id: string;
  name: string;
  category: string;
  created_at: string;
  updated_at: string;
}

// Project Type
export interface Project {
  id: string;
  employer_id: string;
  title: string;
  description: string;
  is_paid: boolean;
  budget?: number;
  deadline?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  created_at: string;
  updated_at: string;
  required_skills?: string[];
}

// Course Type
export interface Course {
  id: string;
  mentor_id?: string;
  title: string;
  description: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  duration: number;
  price?: number;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

// CourseModule Type
export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  order: number;
  video_url?: string;
  created_at: string;
  updated_at: string;
}

// CourseEnrollment Type
export interface CourseEnrollment {
  id: string;
  course_id: string;
  student_id: string;
  progress: number;
  started_at: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

// MentorshipSession Type
export interface MentorshipSession {
  id: string;
  mentor_id: string;
  student_id: string;
  title?: string;
  description?: string;
  start_time: string;
  end_time: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  zoom_meet_link?: string;
  created_at: string;
  updated_at: string;
}

// Dashboard Stats Type
export interface DashboardStats {
  skills_count: number;
  projects_count: number;
  courses_count: number;
  sessions_count: number;
} 