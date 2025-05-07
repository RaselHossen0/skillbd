"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User } from "@/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";
import { createSession, deleteSession, fetchAvailableMentors, updateSession } from "@/lib/session-service";
import { PlusCircle, Trash, Edit, MoreVertical } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Toaster } from "@/components/ui/toaster";

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
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mentors, setMentors] = useState<any[]>([]);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [isEditingSession, setIsEditingSession] = useState(false);
  const [currentSession, setCurrentSession] = useState<any>(null);
  const [isDeletingSession, setIsDeletingSession] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

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
        
        // Fetch sessions
        const sessionsResponse = await fetch(`/api/dashboard/sessions?userId=${user.id}&userRole=${user.role}`);
        if (!sessionsResponse.ok) throw new Error('Failed to fetch sessions');
        const sessionsData = await sessionsResponse.json();
        
        // Set initial data
        setStats(statsData);
        setActivities(activitiesData.activities || []);
        setSessions(sessionsData.sessions || []);
        
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
  
  useEffect(() => {
    async function fetchMentors() {
      try {
        const mentorsData = await fetchAvailableMentors();
        setMentors(mentorsData);
      } catch (error) {
        console.error('Error fetching mentors:', error);
      }
    }
    
    fetchMentors();
  }, []);

  // Function to handle session creation
  const handleCreateSession = async (sessionData: any) => {
    try {
      const newSession = await createSession('STUDENT', sessionData);
      
      // Add the new session to the list
      setSessions(prev => [newSession, ...prev]);
      
      toast({
        title: "Session scheduled",
        description: "Your mentorship session has been scheduled successfully.",
      });
    } catch (error) {
      console.error('Error creating session:', error);
      toast({
        title: "Failed to schedule session",
        description: "There was a problem scheduling your session. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Function to handle session update
  const handleUpdateSession = async (sessionData: any) => {
    if (!currentSession) return;
    
    try {
      const updatedSession = await updateSession('STUDENT', currentSession.id, sessionData);
      
      // Update the session in the list
      setSessions(prev => prev.map(session => 
        session.id === updatedSession.id ? updatedSession : session
      ));
      
      toast({
        title: "Session updated",
        description: "Your mentorship session has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating session:', error);
      toast({
        title: "Failed to update session",
        description: "There was a problem updating your session. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Function to handle session deletion
  const handleDeleteSession = async () => {
    if (!sessionToDelete) return;
    
    try {
      await deleteSession('STUDENT', sessionToDelete);
      
      // Remove the session from the list
      setSessions(prev => prev.filter(session => session.id !== sessionToDelete));
      
      toast({
        title: "Session cancelled",
        description: "Your mentorship session has been cancelled successfully.",
      });
    } catch (error) {
      console.error('Error deleting session:', error);
      toast({
        title: "Failed to cancel session",
        description: "There was a problem cancelling your session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingSession(false);
      setSessionToDelete(null);
    }
  };

  // Open the edit session dialog
  const openEditSessionDialog = (session: any) => {
    setCurrentSession(session);
    setIsEditingSession(true);
  };

  // Confirm session deletion
  const confirmDeleteSession = (sessionId: string) => {
    setSessionToDelete(sessionId);
    setIsDeletingSession(true);
  };

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
  
  const mockSessions = [
    {
      id: 1,
      title: "Career Guidance Session",
      mentor_name: "John Doe",
      date: "Tomorrow",
      time: "10:00 AM",
      status: "SCHEDULED",
      zoom_link: "https://zoom.us/j/123456789"
    },
    {
      id: 2,
      title: "React Project Review",
      mentor_name: "Jane Smith",
      date: "Thursday",
      time: "2:00 PM",
      status: "SCHEDULED",
      zoom_link: "https://zoom.us/j/987654321"
    },
    {
      id: 3,
      title: "Interview Preparation",
      mentor_name: "Alex Johnson",
      date: "Friday",
      time: "11:30 AM",
      status: "SCHEDULED",
      zoom_link: "https://zoom.us/j/567891234"
    }
  ];

  // Use real data if available, otherwise fall back to mock data
  const displaySkills = skills.length > 0 ? skills : mockSkills;
  const displayProjects = projects.length > 0 ? projects : mockProjects;
  const displayActivities = activities.length > 0 ? activities : mockActivities;
  const displaySessions = sessions.length > 0 ? sessions : mockSessions;

  // Render a session item with actions
  const renderSessionWithActions = (session: any) => {
    const mentorName = session.mentors?.users?.name || "Your Mentor";
    
    return (
      <div key={session.id} className="flex items-center justify-between border p-4 rounded-lg">
        <div>
          <h4 className="font-medium">{session.title}</h4>
          <p className="text-sm text-muted-foreground">with {mentorName}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline">{session.date}</Badge>
            <Badge variant="outline">{session.time}</Badge>
            <Badge
              variant={
                session.status === "CONFIRMED" 
                  ? "success" 
                  : session.status === "PENDING" 
                  ? "secondary"
                  : session.status === "COMPLETED"
                  ? "default"
                  : "destructive"
              }
            >
              {session.status}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {session.zoom_link && (
            <Link href={session.zoom_link} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                Join Zoom
              </Button>
            </Link>
          )}
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-2">
              <div className="flex flex-col space-y-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="justify-start"
                  onClick={() => openEditSessionDialog(session)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="justify-start text-destructive hover:text-destructive"
                  onClick={() => confirmDeleteSession(session.id)}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

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

      {/* Upcoming Sessions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Upcoming Mentorship Sessions</CardTitle>
            <CardDescription>Your scheduled mentoring appointments</CardDescription>
          </div>
          <Button onClick={() => setIsCreatingSession(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Book Session
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {displaySessions.map(session => renderSessionWithActions(session))}
            {displaySessions.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                No upcoming sessions. Book a session with a mentor to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

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

      {/* Session Dialog for Create/Edit */}
      {isCreatingSession && (
        <div>
          {/* Import and use custom SessionDialog component */}
          {/* For now, let's simulate a simple dialog */}
          <AlertDialog open={isCreatingSession} onOpenChange={setIsCreatingSession}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Book a Session</AlertDialogTitle>
                <AlertDialogDescription>
                  This is a placeholder. The actual form would go here.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    // Simulate creating a session
                    const mockSession = {
                      id: Date.now().toString(),
                      title: "Mock Mentorship Session",
                      date: new Date().toISOString().split("T")[0],
                      time: "10:00",
                      status: "PENDING",
                      mentor_id: mentors[0]?.id || "mock-mentor-id",
                      student_id: user.id
                    };
                    handleCreateSession(mockSession);
                    setIsCreatingSession(false);
                  }}
                >
                  Book Session
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      {/* Edit Session Dialog */}
      {isEditingSession && currentSession && (
        <div>
          <AlertDialog open={isEditingSession} onOpenChange={setIsEditingSession}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Edit Session</AlertDialogTitle>
                <AlertDialogDescription>
                  This is a placeholder. The actual form would go here.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    // Simulate updating a session
                    const updatedSession = {
                      ...currentSession,
                      status: currentSession.status === "PENDING" ? "CONFIRMED" : "PENDING"
                    };
                    handleUpdateSession(updatedSession);
                    setIsEditingSession(false);
                  }}
                >
                  Update Session
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeletingSession} onOpenChange={setIsDeletingSession}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Session</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this session? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Session</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSession}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, Cancel Session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <Toaster />
    </div>
  );
} 