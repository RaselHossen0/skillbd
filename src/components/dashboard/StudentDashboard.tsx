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
import {
  PlusCircle,
  Trash,
  Edit,
  MoreVertical,
  BookOpen,
  Briefcase,
  Users,
  Award,
  Clock,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Toaster } from "@/components/ui/toaster";

// Import new common components
import { DashboardHeader } from "./common/DashboardHeader";
import { StatsCard } from "./common/StatsCard";

interface DashboardStats {
  skills_count: number;
  projects_count: number;
  courses_count: number;
  sessions_count: number;
  applications_count: number;
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
  type: string;
}

interface Activity {
  id: number | string;
  title: string;
  date: string;
  type: string;
  status?: string;
  progress?: number;
}

interface JobApplication {
  id: string;
  status: string;
  created_at: string;
  job: {
    id: string;
    title: string;
    company_name?: string;
  };
}

interface StudentDashboardProps {
  user: User;
}

export default function StudentDashboard({ user }: StudentDashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    skills_count: 5,
    projects_count: 3,
    courses_count: 2,
    sessions_count: 8,
    applications_count: 12
  });
  const [skills, setSkills] = useState<Skill[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [mentors, setMentors] = useState<any[]>([]);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [isEditingSession, setIsEditingSession] = useState(false);
  const [currentSession, setCurrentSession] = useState<any>(null);
  const [isDeletingSession, setIsDeletingSession] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [availableProjects, setAvailableProjects] = useState<Project[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // Fetch student-specific data
        if (
          user.role === "STUDENT" &&
          user.students &&
          user.students.length > 0
        ) {
          const studentId = user.students[0].id;

          // Fetch projects stats
          const projectsStatsResponse = await fetch(
            `/api/dashboard/projects/stats?studentId=${studentId}`
          );
          if (!projectsStatsResponse.ok) throw new Error("Failed to fetch projects stats");
          const projectsStatsData = await projectsStatsResponse.json();

          // Fetch skills stats
          const skillsStatsResponse = await fetch(
            `/api/dashboard/skills/stats?studentId=${studentId}`
          );
          if (!skillsStatsResponse.ok) throw new Error("Failed to fetch skills stats");
          const skillsStatsData = await skillsStatsResponse.json();

          // Fetch mentorship stats
          const mentorshipStatsResponse = await fetch(
            `/api/dashboard/mentorship/stats?studentId=${studentId}`
          );
          if (!mentorshipStatsResponse.ok) throw new Error("Failed to fetch mentorship stats");
          const mentorshipStatsData = await mentorshipStatsResponse.json();

          // Fetch job applications stats
          const applicationsStatsResponse = await fetch(
            `/api/jobs/applications/stats?studentId=${studentId}`
          );
          if (!applicationsStatsResponse.ok) throw new Error("Failed to fetch job applications stats");
          const applicationsStatsData = await applicationsStatsResponse.json();

          // Update stats with fetched data
          setStats({
            skills_count: skillsStatsData.total_skills || 0,
            projects_count: projectsStatsData.total_projects || 0,
            courses_count: skillsStatsData.total_courses || 0,
            sessions_count: mentorshipStatsData.total_sessions || 0,
            applications_count: applicationsStatsData.total_applications || 0,
          });

          // Fetch available projects
          const availableProjectsResponse = await fetch(
            `/api/dashboard/students/available-projects?studentId=${studentId}`
          );
          if (!availableProjectsResponse.ok) throw new Error("Failed to fetch available projects");
          const availableProjectsData = await availableProjectsResponse.json();
          setAvailableProjects(availableProjectsData.projects || []);

          // Fetch activities
          const activitiesResponse = await fetch(
            `/api/dashboard/activities?userId=${user.id}`
          );
          if (!activitiesResponse.ok)
            throw new Error("Failed to fetch activities");
          const activitiesData = await activitiesResponse.json();

          // Fetch sessions
          const sessionsResponse = await fetch(
            `/api/dashboard/sessions?userId=${user.id}&userRole=${user.role}`
          );
          if (!sessionsResponse.ok) throw new Error("Failed to fetch sessions");
          const sessionsData = await sessionsResponse.json();

          // Fetch skills
          const skillsResponse = await fetch(
            `/api/dashboard/skills?studentId=${studentId}`
          );
          if (!skillsResponse.ok) throw new Error("Failed to fetch skills");
          const skillsData = await skillsResponse.json();

          // Fetch projects
          const projectsResponse = await fetch(
            `/api/dashboard/projects?studentId=${studentId}`
          );
          if (!projectsResponse.ok) throw new Error("Failed to fetch projects");
          const projectsData = await projectsResponse.json();

          // Fetch job applications
          const applicationsResponse = await fetch(
            `/api/jobs/applications?studentId=${studentId}`
          );
          if (!applicationsResponse.ok) throw new Error("Failed to fetch job applications");
          const applicationsData = await applicationsResponse.json();

          // Set initial data
          setActivities(activitiesData.activities || []);
          setSessions(sessionsData.sessions || []);
          setSkills(skillsData.skills || []);
          setProjects(projectsData.projects || []);
          setApplications(applicationsData.applications || []);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
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

  // Generate mock sessions when no real sessions exist
  const generateMockSessions = () => {
    return [
      {
        id: 'mock-1',
        title: 'Web Development Fundamentals',
        mentor: { 
          name: 'Sarah Johnson', 
          avatar_url: '/avatars/mentor1.jpg' 
        },
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 week from now
        time: '14:00',
        status: 'PENDING',
        zoom_link: 'https://zoom.us/j/mockmeeting1'
      },
      {
        id: 'mock-2',
        title: 'React.js Advanced Techniques',
        mentor: { 
          name: 'Michael Chen', 
          avatar_url: '/avatars/mentor2.jpg' 
        },
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 weeks from now
        time: '16:30',
        status: 'PENDING',
        zoom_link: 'https://zoom.us/j/mockmeeting2'
      }
    ];
  };

  // Modify the sessions rendering to use mock data if no real sessions
  const displaySessions = sessions.length > 0 ? sessions : generateMockSessions();

  // Render a session item with actions
  const renderSessionWithActions = (session: any) => {
    // The enhanced API now returns mentor data in a more standardized format
    const mentorName = session.mentor?.name || session.applicant?.name || "Your Mentor";
    const isMockSession = session.id.startsWith('mock-');
    
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
                  ? "secondary" 
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
          
          {!isMockSession && (
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
          )}
        </div>
      </div>
    );
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
      {/* Dashboard Header */}
      <DashboardHeader 
        user={user} 
        title="Student Dashboard" 
        description={`Welcome back, ${user.name}! Here's an overview of your progress.`}
        actions={
          <>
            <Button variant="outline">Download CV</Button>
            <Button>Find Opportunities</Button>
          </>
        }
      />

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <StatsCard 
          title="Skills Assessed" 
          value={stats.skills_count} 
          description="Skills developed"
          icon={<BookOpen />}
          trend={{ value: 20, direction: 'up' }}
        />
        <StatsCard 
          title="Projects Completed" 
          value={stats.projects_count} 
          description="Active projects"
          icon={<Briefcase />}
          trend={{ value: 15, direction: 'up' }}
        />
        <StatsCard 
          title="Courses Enrolled" 
          value={stats.courses_count} 
          description="Learning progress"
          icon={<Users />}
          trend={{ value: 10, direction: 'up' }}
        />
        <StatsCard 
          title="Mentorship Sessions" 
          value={stats.sessions_count} 
          description="Total sessions"
          icon={<Award />}
          trend={{ value: 25, direction: 'up' }}
        />
        <StatsCard 
          title="Job Applications" 
          value={stats.applications_count} 
          description="Total applications"
          icon={<Clock />}
          trend={{ value: 30, direction: 'up' }}
        />
      </div>

      {/* Activities and Insights Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Top Skills Card */}
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>Top Skills</CardTitle>
            <CardDescription>
              Your highest-rated technical skills
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {skills.slice(0, 5).map((skill, index) => renderSkill(skill, index))}
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
            {displaySessions.map((session) => renderSessionWithActions(session))}
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
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.length > 0 ? (
              projects.slice(0, 3).map((project) => renderProject(project))
            ) : (
              <div className="col-span-full text-center py-4">
                <p className="text-muted-foreground">No projects available. Check the marketplace for opportunities!</p>
                <Button variant="outline" className="mt-2" asChild>
                  <Link href="/dashboard/jobs">Browse Marketplace</Link>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Job Applications */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Job Applications</CardTitle>
            <CardDescription>Track the status of your job applications</CardDescription>
          </div>
          <Button asChild>
            <Link href="/dashboard/applications">View All Applications</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {applications.length > 0 ? (
              applications.slice(0, 3).map((application) => (
                <div key={application.id} className="flex items-center justify-between border p-4 rounded-lg">
                  <div>
                    <h4 className="font-medium">{application.job.title}</h4>
                    <p className="text-sm text-muted-foreground">{application.job.company_name || "Company"}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">Applied on {formatDate(application.created_at)}</Badge>
                      <Badge 
                        variant={
                          application.status === "PENDING" 
                            ? "secondary" 
                            : application.status === "REJECTED" 
                              ? "destructive"
                              : "default"
                        }
                      >
                        {application.status}
                      </Badge>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/applications">View Details</Link>
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground">No job applications yet. Start applying for jobs!</p>
                <Button variant="outline" className="mt-4 w-full" asChild>
                  <Link href="/dashboard/jobs">Find Jobs</Link>
                </Button>
              </div>
            )}
            
            {applications.length > 0 && (
              <Button variant="outline" className="w-full" asChild>
                <Link href="/jobs">Find More Jobs</Link>
              </Button>
            )}
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