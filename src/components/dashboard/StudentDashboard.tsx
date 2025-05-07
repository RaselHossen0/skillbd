"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User } from "@/types";

interface DashboardStats {
  skills_count: number;
  projects_count: number;
  courses_count: number;
  sessions_count: number;
}

interface Skill {
  id: string;
  skill: {
    id: string;
    name: string;
    category: string;
  };
  level: number;
  verified: boolean;
}

interface Project {
  id: string | number;
  title: string;
  company: string;
  employer?: { company_name?: string };
  budget: string | number;
  deadline: string;
  skills: string[] | any[];
}

interface Activity {
  id: number | string;
  title: string;
  date: string;
  type: string;
  status?: string;
  progress?: number;
}

interface StudentDashboardProps {
  user: User;
}

export default function StudentDashboard({ user }: StudentDashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    skills_count: 0,
    projects_count: 0,
    courses_count: 0,
    sessions_count: 0
  });
  const [skills, setSkills] = useState<Skill[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch stats
        const statsResponse = await fetch(`/api/dashboard/stats?userId=${user.id}&userRole=${user.role}`);
        if (!statsResponse.ok) throw new Error('Failed to fetch stats');
        const statsData = await statsResponse.json();
        
        // Fetch activities
        const activitiesResponse = await fetch(`/api/dashboard/activities?userId=${user.id}`);
        if (!activitiesResponse.ok) throw new Error('Failed to fetch activities');
        const activitiesData = await activitiesResponse.json();
        
        // Set initial data
        setStats(statsData);
        setActivities(activitiesData.activities || []);
        
        // Fetch student-specific data if we have a student record
        if (user.students && user.students.length > 0) {
          const studentId = user.students[0].id;
          
          // Fetch skills
          const skillsResponse = await fetch(`/api/dashboard/skills?studentId=${studentId}`);
          if (!skillsResponse.ok) throw new Error('Failed to fetch skills');
          const skillsData = await skillsResponse.json();
          
          // Fetch recommended projects
          const projectsResponse = await fetch(`/api/dashboard/projects?studentId=${studentId}`);
          if (!projectsResponse.ok) throw new Error('Failed to fetch projects');
          const projectsData = await projectsResponse.json();
          
          setSkills(skillsData.skills || []);
          setProjects(projectsData.projects || []);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [user]);
  
  // Render a skill item
  const renderSkill = (skill: Skill, index: number) => {
    const skillName = skill.skill?.name || `Skill ${index + 1}`;
    const category = skill.skill?.category || 'General';
    const level = skill.level || 1;
    
    return (
      <div key={skill.id || index} className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium leading-none">
            {skillName}
            <Badge variant="outline" className="ml-2">
              {category}
            </Badge>
          </p>
          <p className="text-sm text-muted-foreground">
            Level {level}/5
          </p>
        </div>
        <div className="flex items-center">
          {Array(5)
            .fill(null)
            .map((_, i) => (
              <svg
                key={i}
                className={`h-4 w-4 ${
                  i < level ? "fill-primary" : "fill-muted"
                }`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            ))}
        </div>
      </div>
    );
  };
  
  // Render a project card
  const renderProject = (project: Project) => {
    const companyName = project.employer?.company_name || project.company || 'Unknown Company';
    const projectBudget = typeof project.budget === 'number' ? `$${project.budget}` : project.budget || 'TBD';
    const projectSkills = Array.isArray(project.skills) ? project.skills : [];
    
    return (
      <Card key={project.id}>
        <CardHeader className="p-4">
          <CardTitle className="text-base">{project.title}</CardTitle>
          <CardDescription>{companyName}</CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="grid gap-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Budget:</span>
              <span className="font-medium">{projectBudget}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Deadline:</span>
              <span className="font-medium">{project.deadline}</span>
            </div>
            <div className="flex flex-wrap gap-1 pt-2">
              {projectSkills.map((skill: any, index: number) => {
                const skillName = typeof skill === 'string' 
                  ? skill 
                  : skill.name || `Skill ${index + 1}`;
                
                return (
                  <Badge key={index} variant="secondary">
                    {skillName}
                  </Badge>
                );
              })}
            </div>
            <Button className="mt-3 w-full">Apply Now</Button>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Mock data for fallback when API data is not available
  const mockSkills = [
    { id: '1', skill: { id: '1', name: 'JavaScript', category: 'Programming' }, level: 4, verified: true },
    { id: '2', skill: { id: '2', name: 'React.js', category: 'Frontend' }, level: 3, verified: true },
    { id: '3', skill: { id: '3', name: 'Node.js', category: 'Backend' }, level: 3, verified: false },
    { id: '4', skill: { id: '4', name: 'UI/UX Design', category: 'Design' }, level: 4, verified: true },
    { id: '5', skill: { id: '5', name: 'MongoDB', category: 'Database' }, level: 2, verified: false },
  ];
  
  const mockProjects = [
    {
      id: 1,
      title: "Shopify Website for Local Boutique",
      company: "Fashion Forward BD",
      budget: "$300",
      deadline: "2 weeks",
      skills: ["Shopify", "HTML/CSS", "JavaScript"],
    },
    {
      id: 2,
      title: "Social Media Dashboard UI Design",
      company: "TechVision Ltd",
      budget: "$250",
      deadline: "1 week",
      skills: ["UI/UX", "Figma", "Adobe XD"],
    },
    {
      id: 3,
      title: "API Development for Inventory Management",
      company: "Retail Solutions BD",
      budget: "$400",
      deadline: "3 weeks",
      skills: ["Node.js", "Express", "MongoDB"],
    },
  ];
  
  const mockActivities = [
    {
      id: 1,
      type: "PROJECT_SUBMISSION",
      title: "E-commerce Website UI Design",
      date: "2 days ago",
      status: "COMPLETED",
    },
    {
      id: 2,
      type: "COURSE_PROGRESS",
      title: "React.js Fundamentals",
      date: "5 days ago",
      progress: 65,
    },
    {
      id: 3,
      type: "MENTORSHIP_SESSION",
      title: "Career Guidance with Sarah",
      date: "1 week ago",
      status: "COMPLETED",
    },
    {
      id: 4,
      type: "PROJECT_APPLICATION",
      title: "Mobile App Development for Local Business",
      date: "2 weeks ago",
      status: "PENDING",
    },
  ];
  
  // Use real data if available, otherwise fall back to mock data
  const displaySkills = skills.length > 0 ? skills : mockSkills;
  const displayProjects = projects.length > 0 ? projects : mockProjects;
  const displayActivities = activities.length > 0 ? activities : mockActivities;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Student Dashboard</h2>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user.name}! Here's an overview of your progress.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">Download CV</Button>
          <Button>Complete Profile</Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Skills Assessed</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.skills_count}</div>
            <p className="text-xs text-muted-foreground">
              +2 skills since last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projects Completed</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.projects_count}</div>
            <p className="text-xs text-muted-foreground">
              +1 completed this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Courses Enrolled</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <path d="M2 10h20" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.courses_count}</div>
            <p className="text-xs text-muted-foreground">
              1 course in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mentorship Sessions</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sessions_count}</div>
            <p className="text-xs text-muted-foreground">
              Next session tomorrow
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Top Skills */}
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>Top Skills</CardTitle>
            <CardDescription>
              Your highest-rated technical skills
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {displaySkills.slice(0, 5).map((skill, index) => renderSkill(skill, index))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Your latest interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {displayActivities.map((activity) => (
                <div key={activity.id} className="flex items-center p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                  <div className="space-y-1 w-full">
                    <p className="text-sm font-medium leading-none">
                      {activity.title}
                    </p>
                    <div className="flex items-center pt-2 justify-between">
                      <div className="flex items-center gap-2">
                        {activity.type === "PROJECT_SUBMISSION" && (
                          <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>
                        )}
                        {activity.type === "PROJECT_APPLICATION" && (
                          <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>
                        )}
                        {activity.type === "MENTORSHIP_SESSION" && (
                          <Badge className="bg-blue-500 hover:bg-blue-600">Session</Badge>
                        )}
                        {activity.type === "COURSE_PROGRESS" && (
                          <Badge className="bg-purple-500 hover:bg-purple-600">Course</Badge>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {activity.date}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" className="ml-auto">View</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <Button variant="outline" className="w-full">
                View All Activities
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommended Projects */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Recommended Projects</CardTitle>
          <CardDescription>Based on your skills and interests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {displayProjects.map(project => renderProject(project))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 