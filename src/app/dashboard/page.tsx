"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { 
  getDashboardStats, 
  getStudentSkills, 
  getRecommendedProjects, 
  getRecentActivities 
} from "@/lib/dashboard";
import { DashboardStats } from "@/types";

// Mock data interfaces to handle type differences
interface MockSkill {
  name: string;
  level: number;
  category: string;
  verified: boolean;
}

// Skill interface matching what comes from our dashboard API now
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

interface MockProject {
  id: number;
  title: string;
  company: string;
  budget: string;
  deadline: string;
  skills: string[];
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const [stats, setStats] = useState<DashboardStats>({
    skills_count: 0,
    projects_count: 0,
    courses_count: 0,
    sessions_count: 0
  });
  const [skills, setSkills] = useState<Skill[]>([]);
  const [recommendedProjects, setRecommendedProjects] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Check for success messages from URL parameters
  useEffect(() => {
    const signup = searchParams.get('signup');
    const login = searchParams.get('login');
    const reset = searchParams.get('reset');
    
    if (signup === 'success') {
      setSuccessMessage('Account created successfully! Welcome to SkillBD.');
    } else if (login === 'success') {
      setSuccessMessage('You have successfully logged in.');
    } else if (reset === 'success') {
      setSuccessMessage('Your password has been successfully reset.');
    }
    
    // Clear success message after 5 seconds
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [searchParams, successMessage]);

  useEffect(() => {
    async function loadDashboardData() {
      if (!user) return;

      try {
        setLoading(true);
        
        // Use API endpoints instead of direct Supabase calls
        const fetchStats = async () => {
          const response = await fetch(`/api/dashboard/stats?userId=${user.id}&userRole=${user.role}`);
          if (!response.ok) throw new Error('Failed to fetch dashboard stats');
          return await response.json();
        };
        
        const fetchActivities = async () => {
          const response = await fetch(`/api/dashboard/activities?userId=${user.id}`);
          if (!response.ok) throw new Error('Failed to fetch activities');
          return await response.json();
        };
        
        // Fetch data in parallel
        const [statsData, activitiesData] = await Promise.all([
          fetchStats(),
          fetchActivities()
        ]);
        
        setStats(statsData);
        setActivities(activitiesData.activities || []);
        
        // Fetch student-specific data if user is a student
        if (user.role === 'STUDENT' && user.students && user.students.length > 0) {
          const studentId = user.students[0].id;
          
          const fetchSkills = async () => {
            const response = await fetch(`/api/dashboard/skills?studentId=${studentId}`);
            if (!response.ok) throw new Error('Failed to fetch skills');
            return await response.json();
          };
          
          const fetchProjects = async () => {
            const response = await fetch(`/api/dashboard/projects?studentId=${studentId}`);
            if (!response.ok) throw new Error('Failed to fetch projects');
            return await response.json();
          };
          
          const [skillsData, projectsData] = await Promise.all([
            fetchSkills(),
            fetchProjects()
          ]);
          
          setSkills(skillsData.skills || []);
          setRecommendedProjects(projectsData.projects || []);
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadDashboardData();
  }, [user]);

  // Show loading state when data is loading
  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Mock data for demonstration (in case real data isn't available yet)
  const mockSkills: MockSkill[] = [
    { name: "JavaScript", level: 4, category: "Programming", verified: true },
    { name: "React.js", level: 3, category: "Frontend", verified: true },
    { name: "Node.js", level: 3, category: "Backend", verified: false },
    { name: "UI/UX Design", level: 4, category: "Design", verified: true },
    { name: "MongoDB", level: 2, category: "Database", verified: false },
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
  
  const mockProjects: MockProject[] = [
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

  // Use real data if available, otherwise fall back to mock data
  const displayActivities = activities.length > 0 ? activities : mockActivities;

  // Render a skill item based on its type (API data or mock data)
  const renderSkillItem = (skill: Skill | MockSkill, index: number) => {
    // Get skill name based on type
    const skillName = 'skill' in skill && skill.skill ? skill.skill.name : 'name' in skill ? skill.name : `Skill ${index}`;
    // Get skill category based on type
    const skillCategory = 'skill' in skill && skill.skill ? skill.skill.category : 'category' in skill ? skill.category : 'General';
    // Get skill level based on type
    const skillLevel = skill.level || 0;

    return (
      <div key={index} className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium leading-none">
            {skillName}
            <Badge variant="outline" className="ml-2">
              {skillCategory}
            </Badge>
          </p>
          <p className="text-sm text-muted-foreground">
            Level {skillLevel}/5
          </p>
        </div>
        <div className="flex items-center">
          {Array(5)
            .fill(null)
            .map((_, i) => (
              <svg
                key={i}
                className={`h-4 w-4 ${
                  i < skillLevel ? "fill-primary" : "fill-muted"
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

  // Render a project item based on its type (API data or mock data)
  const renderProject = (project: any) => {
    // Get project company based on type
    const company = project.employer ? 
      (project.employer.company_name || 'Unknown Company') : 
      'company' in project ? project.company : 'Unknown Company';
    // Get project budget based on type
    const budget = 'budget' in project ? project.budget : '$TBD';
    // Get project deadline based on type
    const deadline = 'deadline' in project ? project.deadline : 'TBD';
    // Get project skills based on type
    const projectSkills = 'skills' in project ? (
      Array.isArray(project.skills) ? project.skills : []
    ) : [];

    return (
      <Card key={project.id}>
        <CardHeader className="p-4">
          <CardTitle className="text-base">{project.title}</CardTitle>
          <CardDescription>{company}</CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="grid gap-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Budget:</span>
              <span className="font-medium">{budget}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Deadline:</span>
              <span className="font-medium">{deadline}</span>
            </div>
            <div className="flex flex-wrap gap-1 pt-2">
              {projectSkills.map((skill: string | any, index: number) => {
                // Handle different skill types
                const skillName = typeof skill === 'string' 
                  ? skill 
                  : 'skill' in skill && skill.skill 
                    ? skill.skill.name 
                    : `Skill ${index}`;
                
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

  return (
    <div className="w-full px-4 py-6 md:px-6 lg:px-8 space-y-8">
      {successMessage && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <p className="text-muted-foreground mt-1">
              Welcome back, {user?.name || "User"}! Here's an overview of your progress.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {user?.role === 'STUDENT' && (
              <>
                <Button variant="outline">Download CV</Button>
                <Button>Complete Profile</Button>
              </>
            )}
            {user?.role === 'MENTOR' && (
              <>
                <Button variant="outline">View Calendar</Button>
                <Button>Update Availability</Button>
              </>
            )}
            {user?.role === 'EMPLOYER' && (
              <>
                <Button variant="outline">View Applicants</Button>
                <Button>Post New Project</Button>
              </>
            )}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {user?.role === 'STUDENT' && "Skills Assessed"}
                {user?.role === 'MENTOR' && "Expertise Areas"}
                {user?.role === 'EMPLOYER' && "Completed Projects"}
              </CardTitle>
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
                {user?.role === 'STUDENT' && "+2 skills since last month"}
                {user?.role === 'MENTOR' && "Areas of professional expertise"}
                {user?.role === 'EMPLOYER' && "Projects delivered successfully"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {user?.role === 'STUDENT' && "Projects Completed"}
                {user?.role === 'MENTOR' && "Projects Reviewed"}
                {user?.role === 'EMPLOYER' && "Active Projects"}
              </CardTitle>
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
                {user?.role === 'STUDENT' && "+1 completed this month"}
                {user?.role === 'MENTOR' && "Reviewed and provided feedback"}
                {user?.role === 'EMPLOYER' && "Projects in progress"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {user?.role === 'STUDENT' && "Courses Enrolled"}
                {user?.role === 'MENTOR' && "Courses Created"}
                {user?.role === 'EMPLOYER' && "Talent Applications"}
              </CardTitle>
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
                {user?.role === 'STUDENT' && "1 course in progress"}
                {user?.role === 'MENTOR' && "Educational content published"}
                {user?.role === 'EMPLOYER' && "Candidates applied to your projects"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {user?.role === 'STUDENT' && "Mentorship Sessions"}
                {user?.role === 'MENTOR' && "Mentorship Sessions"}
                {user?.role === 'EMPLOYER' && "Featured Positions"}
              </CardTitle>
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
                {user?.role === 'STUDENT' && "Next session tomorrow"}
                {user?.role === 'MENTOR' && "Total mentoring appointments"}
                {user?.role === 'EMPLOYER' && "Premium placement projects"}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          {/* Top Skills */}
          {user?.role === 'STUDENT' && (
            <Card className="md:col-span-2 lg:col-span-3">
              <CardHeader>
                <CardTitle>Top Skills</CardTitle>
                <CardDescription>
                  Your highest-rated technical skills
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {skills.length > 0 
                    ? skills.slice(0, 5).map((skill, index) => renderSkillItem(skill, index))
                    : mockSkills.slice(0, 5).map((skill, index) => renderSkillItem(skill, index))
                  }
                </div>
              </CardContent>
            </Card>
          )}

          {/* Expertise Areas - for mentors */}
          {user?.role === 'MENTOR' && (
            <Card className="md:col-span-2 lg:col-span-3">
              <CardHeader>
                <CardTitle>Expertise Areas</CardTitle>
                <CardDescription>
                  Your professional skills and competencies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {skills.length > 0 
                    ? skills.slice(0, 5).map((skill, index) => renderSkillItem(skill, index))
                    : mockSkills.slice(0, 5).map((skill, index) => renderSkillItem(skill, index))
                  }
                </div>
              </CardContent>
            </Card>
          )}

          {/* Project Stats - for employers */}
          {user?.role === 'EMPLOYER' && (
            <Card className="md:col-span-2 lg:col-span-3">
              <CardHeader>
                <CardTitle>Project Statistics</CardTitle>
                <CardDescription>
                  Overview of your posted projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Active Projects</p>
                    <div className="bg-muted h-2 rounded-full overflow-hidden">
                      <div className="bg-primary h-full" style={{ width: '70%' }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>70% Completion Rate</span>
                      <span>{stats.projects_count} Projects</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Applicant Conversion</p>
                    <div className="bg-muted h-2 rounded-full overflow-hidden">
                      <div className="bg-primary h-full" style={{ width: '45%' }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>45% Hire Rate</span>
                      <span>{stats.courses_count} Applicants</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Project Completion</p>
                    <div className="bg-muted h-2 rounded-full overflow-hidden">
                      <div className="bg-primary h-full" style={{ width: '85%' }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>85% Success Rate</span>
                      <span>{stats.skills_count} Completed</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

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

        {/* Recommended Projects - Student-only section */}
        {user?.role === 'STUDENT' && (
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Recommended Projects</CardTitle>
              <CardDescription>Based on your skills and interests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {recommendedProjects.length > 0
                  ? recommendedProjects.map(project => renderProject(project))
                  : mockProjects.map(project => renderProject(project))
                }
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upcoming Sessions - Mentor-only section */}
        {user?.role === 'MENTOR' && (
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Mentorship Sessions</CardTitle>
              <CardDescription>Your scheduled mentoring appointments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((id) => (
                  <div key={id} className="flex items-center justify-between border p-4 rounded-lg">
                    <div>
                      <h4 className="font-medium">Career Guidance Session</h4>
                      <p className="text-sm text-muted-foreground">with Student {id}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">Tomorrow</Badge>
                        <Badge variant="outline">10:00 AM</Badge>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Join Zoom</Button>
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-4">View All Sessions</Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Talent Pool - Employer-only section */}
        {user?.role === 'EMPLOYER' && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Talent Pool</CardTitle>
              <CardDescription>Students with skills matching your projects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((id) => (
                  <div key={id} className="flex items-center justify-between border p-4 rounded-lg">
                    <div>
                      <h4 className="font-medium">Student {id}</h4>
                      <p className="text-sm text-muted-foreground">Full Stack Developer</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <Badge variant="secondary" className="text-xs">React</Badge>
                        <Badge variant="secondary" className="text-xs">Node.js</Badge>
                        <Badge variant="secondary" className="text-xs">MongoDB</Badge>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">View Profile</Button>
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-4">Browse Talent Pool</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 