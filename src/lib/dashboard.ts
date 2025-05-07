import { supabase } from './supabase';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY } from './env';
import { DashboardStats } from '@/types';

// Create admin client with service role key for operations that need to bypass RLS
// If the service key is missing, fall back to the regular supabase client
let supabaseAdmin: SupabaseClient;

// Check if service key is available
if (SUPABASE_SERVICE_KEY) {
  supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  console.log('Using admin client with service role key');
} else {
  console.warn('SUPABASE_SERVICE_ROLE_KEY not found in environment. Falling back to regular client.');
  // Fall back to regular supabase client
  supabaseAdmin = supabase;
}

export async function getDashboardStats(userId: string, userRole: string): Promise<DashboardStats> {
  try {
    let skillsCount = 0;
    let projectsCount = 0;
    let coursesCount = 0;
    let sessionsCount = 0;

    if (userRole === 'STUDENT') {
      // Get student profile
      const { data: student } = await supabaseAdmin
        .from('students')
        .select('id, skills')
        .eq('user_id', userId)
        .single();

      if (student) {
        // For now, return static data since we haven't migrated all tables
        skillsCount = Array.isArray(student.skills) ? student.skills.length : 0;
        projectsCount = 0;
        coursesCount = 0;
        sessionsCount = 0;
      }
    } else if (userRole === 'MENTOR') {
      // Get mentor profile
      const { data: mentor } = await supabaseAdmin
        .from('mentors')
        .select('id, expertise')
        .eq('user_id', userId)
        .single();

      if (mentor) {
        // For now, return static data or available data
        skillsCount = Array.isArray(mentor.expertise) ? mentor.expertise.length : 0;
        projectsCount = 0;
        coursesCount = 0;
        sessionsCount = 0;
      }
    } else if (userRole === 'EMPLOYER') {
      // Get employer profile
      const { data: employer } = await supabaseAdmin
        .from('employers')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (employer) {
        // For now, return static data
        projectsCount = 0;
        skillsCount = 0;
        coursesCount = 0;
        sessionsCount = 0;
      }
    }

    return {
      skills_count: skillsCount,
      projects_count: projectsCount,
      courses_count: coursesCount,
      sessions_count: sessionsCount
    };
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    return {
      skills_count: 0,
      projects_count: 0,
      courses_count: 0,
      sessions_count: 0
    };
  }
}

// Interface for skill objects returned by getStudentSkills
interface SkillObject {
  id: string;
  skill: {
    id: string;
    name: string;
    category: string;
  };
  level: number;
  verified: boolean;
}

export async function getStudentSkills(studentId: string): Promise<SkillObject[]> {
  try {
    // Get student with skills
    const { data: student, error } = await supabaseAdmin
      .from('students')
      .select('skills')
      .eq('id', studentId)
      .single();
    
    if (error || !student || !student.skills) {
      return [];
    }
    
    // Transform skills array into objects with level, etc.
    const skillObjects = student.skills.map((skillName: string, index: number) => ({
      id: `skill-${index}`,
      skill: {
        id: `skill-type-${index}`,
        name: skillName,
        category: 'General'
      },
      level: 3, // Default level
      verified: false
    }));
    
    return skillObjects;
  } catch (error) {
    console.error('Error fetching student skills:', error);
    return [];
  }
}

export async function getRecommendedProjects(studentId: string): Promise<any[]> {
  try {
    // For now, return empty array since we don't have projects table yet
    return [];
  } catch (error) {
    console.error('Error fetching recommended projects:', error);
    return [];
  }
}

export async function getEnrolledCourses(studentId: string): Promise<any[]> {
  try {
    // For now, return empty array since we don't have courses table yet
    return [];
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    return [];
  }
}

export async function getUpcomingMentorshipSessions(userId: string, userRole: string): Promise<any[]> {
  try {
    // For now, return empty array since we don't have mentorship_sessions table yet
    return [];
  } catch (error) {
    console.error('Error fetching upcoming mentorship sessions:', error);
    return [];
  }
}

interface Activity {
  id: string;
  type: string;
  title: string;
  date: Date;
  status?: string;
  progress?: number;
}

export async function getRecentActivities(userId: string): Promise<Activity[]> {
  try {
    // For now, return empty array since we don't have activities table yet
    return [];
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    return [];
  }
} 