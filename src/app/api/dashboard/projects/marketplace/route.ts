import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import * as projectUtils from '@/lib/projects';

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters for filtering
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const category = url.searchParams.get('category');
    const skill = url.searchParams.get('skill');
    const paid = url.searchParams.get('paid');
    const studentId = url.searchParams.get('studentId');
    
    // Fetch available projects
    const availableProjects = await projectUtils.getAvailableProjects();
    
    if (!availableProjects || availableProjects.length === 0) {
      return NextResponse.json({ projects: [] });
    }
    
    // Filter projects based on query parameters
    let filteredProjects = availableProjects;
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredProjects = filteredProjects.filter(project => 
        project.title?.toLowerCase().includes(searchLower) || 
        project.description?.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply category filter (assuming category is stored in technologies)
    if (category) {
      filteredProjects = filteredProjects.filter(project => 
        project.technologies?.some((tech: string) => tech.toLowerCase() === category.toLowerCase())
      );
    }
    
    // Apply skill filter
    if (skill) {
      // Assuming we have a separate project_skills table, we'd need to fetch this data
      // For now, we'll just filter by technologies which should contain skills
      filteredProjects = filteredProjects.filter(project => 
        project.technologies?.some((tech: string) => tech.toLowerCase() === skill.toLowerCase())
      );
    }
    
    // Apply paid filter
    if (paid !== null && paid !== undefined) {
      const isPaid = paid === 'true';
      filteredProjects = filteredProjects.filter(project => project.is_paid === isPaid);
    }
    
    // Check if student has already applied to projects
    if (studentId) {
      try {
        const { data: applications, error } = await supabase
          .from('project_applicants')
          .select('project_id')
          .eq('student_id', studentId);
        
        if (!error && applications) {
          const appliedProjectIds = applications.map(app => app.project_id);
          
          // Add an 'applied' flag to projects
          filteredProjects = filteredProjects.map(project => ({
            ...project,
            applied: appliedProjectIds.includes(project.id)
          }));
        }
      } catch (error) {
        console.error('Error fetching student applications:', error);
      }
    }
    
    return NextResponse.json({ projects: filteredProjects });
  } catch (error) {
    console.error('Error fetching marketplace projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
} 