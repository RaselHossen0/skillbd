"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User } from "@/types";
import { Plus, Check, Clock, Search, FileEdit, Edit, Star, StarHalf, PlusCircle, Trash, X, SearchX, BookX } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

interface DashboardStats {
  students_count: number;
  sessions_count: number;
  projects_count: number;
  completed_mentorships: number;
}

interface Expertise {
  id: string | number;
    name: string;
  level: string;
  students_count: number;
}

interface Session {
  id: string | number;
  title: string;
  student_name?: string;
  date: string;
  time: string;
  status: string;
  meeting_link?: string;
}

interface Project {
  id: string | number;
  title: string;
  description: string;
  status: "IN_PROGRESS" | "COMPLETED" | "PENDING_REVIEW";
  student_name: string;
  student_id: string;
  created_at: string;
  technologies: string[];
}

interface Activity {
  id: number | string;
  title: string;
  date: string;
  type: string;
  status?: string;
  progress?: number;
}

// Add an interface for the skill type
interface Skill {
  id: string;
  name: string;
  category: string;
}

interface MentorDashboardProps {
  user: User;
}

export default function MentorDashboard({ user }: MentorDashboardProps) {
  const { toast } = useToast();
  const stats = {
    students_count: 10,
    sessions_count: 10,
    projects_count: 10,
    completed_mentorships: 10,
  }

  const [expertise, setExpertise] = useState<Expertise[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    technologies: "",
    student_id: "",
  });
  const [students, setStudents] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState("");
  const [isAddingExpertise, setIsAddingExpertise] = useState(false);
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<string>("");
  const [expertiseLevel, setExpertiseLevel] = useState<string>("3");
  const [skillsSearchQuery, setSkillsSearchQuery] = useState<string>("");
  const [isEditingExpertise, setIsEditingExpertise] = useState(false);
  const [currentExpertise, setCurrentExpertise] = useState<any>(null);
  const [isDeletingExpertise, setIsDeletingExpertise] = useState(false);
  const [expertiseToDelete, setExpertiseToDelete] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch stats
        const statsResponse = await fetch(
          `/api/dashboard/stats?userId=${user.id}&userRole=${user.role}`
        );
        if (!statsResponse.ok) throw new Error("Failed to fetch stats");
        const statsData = await statsResponse.json();
        
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

        // Fetch projects
        const projectsResponse = await fetch(
          `/api/dashboard/projects?userId=${user.id}&userRole=${user.role}`
        );
        if (!projectsResponse.ok) throw new Error("Failed to fetch projects");
        const projectsData = await projectsResponse.json();
        
        // Set initial data
        
        setActivities(activitiesData.activities || []);
        setSessions(sessionsData.sessions || []);
        setProjects(projectsData.projects || []);
        
        // Fetch mentor-specific data
        if (user.role === "MENTOR" && user.mentors && user.mentors.length > 0) {
          const mentorId = user.mentors[0].id;
          
          // Fetch expertise
          const expertiseResponse = await fetch(
            `/api/dashboard/mentors/expertise?mentorId=${mentorId}`
          );
          if (!expertiseResponse.ok)
            throw new Error("Failed to fetch expertise");
          const expertiseData = await expertiseResponse.json();
          
          setExpertise(expertiseData.expertise || []);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [user]);
  
  // Fetch students for the project creation form
  useEffect(() => {
    async function fetchStudents() {
      if (user.role === "MENTOR" && user.mentors && user.mentors.length > 0) {
        try {
          const response = await fetch(`/api/dashboard/mentors/${user.mentors[0].id}/students`);
          if (!response.ok) throw new Error("Failed to fetch students");
          const data = await response.json();
          setStudents(data.students || []);
        } catch (error) {
          console.error("Error fetching students:", error);
        }
      }
    }

    fetchStudents();
  }, [user]);

  // Modified useEffect for expertise with debouncing
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | undefined;
    
    const searchSkills = async () => {
      if (isAddingExpertise && user.mentors && user.mentors.length > 0) {
        const mentorId = user.mentors[0].id;
        const skills = await fetchAvailableSkills(mentorId, skillsSearchQuery);
        setAvailableSkills(skills);
      }
    };

    // Clear previous timeout to implement debouncing
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Set a timeout to avoid too many API calls while typing
    timeoutId = setTimeout(() => {
      searchSkills();
    }, 300); // 300ms debounce time

    return () => {
      // Cleanup the timeout when component unmounts or dependencies change
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isAddingExpertise, skillsSearchQuery, user.mentors]);

  // Handle project creation form submission
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionError("");

    try {
      if (!newProject.title || !newProject.student_id) {
        throw new Error("Please fill in all required fields");
      }

      // Split technologies string into array
      const technologies = newProject.technologies
        .split(",")
        .map((tech) => tech.trim())
        .filter((tech) => tech !== "");

      const mentorId = user.mentors?.[0]?.id || "";

      const createdProject = await createProject({
        title: newProject.title,
        description: newProject.description,
        student_id: newProject.student_id,
        mentor_id: mentorId,
        technologies,
      });

      // Add the newly created project to the list
      setProjects([createdProject, ...projects]);

      // Reset form and close dialog
      setNewProject({
        title: "",
        description: "",
        technologies: "",
        student_id: "",
      });
      setIsCreatingProject(false);
    } catch (error) {
      setSubmissionError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle project status update
  const handleUpdateProjectStatus = async (projectId: string | number, newStatus: string) => {
    try {
      const updatedProject = await updateProjectStatus(projectId, newStatus);
      
      // Update the projects list with the updated project
      setProjects(
        projects.map((project) =>
          project.id === updatedProject.id ? { ...project, status: updatedProject.status } : project
        )
      );
    } catch (error) {
      console.error("Error updating project status:", error);
    }
  };
  
  // Render a session item
  const renderSession = (session: Session) => {
    return (
      <div
        key={session.id}
        className="flex items-center justify-between border p-4 rounded-lg"
      >
        <div>
          <h4 className="font-medium">{session.title}</h4>
          <p className="text-sm text-muted-foreground">
            with {session.student_name}
          </p>
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
        {session.meeting_link && (
          <Link
            href={session.meeting_link}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm">
              Join Meeting
            </Button>
          </Link>
        )}
      </div>
    );
  };
  
  // Modify the renderProject function to include the review action
  const renderProject = (project: Project) => {
    return (
      <div
        key={project.id}
        className="flex flex-col border p-4 rounded-lg hover:bg-muted/50 transition-colors"
      >
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-medium text-base">{project.title}</h4>
          <Badge
            variant={
              project.status === "COMPLETED"
                ? "default"
                : project.status === "IN_PROGRESS"
                ? "secondary"
                : "outline"
            }
          >
            {project.status.replace("_", " ")}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
          {project.description}
        </p>
        <div className="flex items-center gap-2 mt-1 mb-3">
          <p className="text-xs text-muted-foreground">
            Student: <span className="font-medium">{project.student_name}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Created: {new Date(project.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {project.technologies.map((tech, index) => (
            <Badge key={index} variant="outline" className="bg-primary/5">
              {tech}
            </Badge>
          ))}
        </div>
        <div className="flex gap-2 mt-auto">
          <Button variant="outline" size="sm" className="flex-1">
            <Search className="h-3.5 w-3.5 mr-1.5" />
            View Details
          </Button>
          {project.status === "PENDING_REVIEW" && (
            <Button 
              size="sm" 
              className="flex-1"
              onClick={() => handleUpdateProjectStatus(project.id, "COMPLETED")}
            >
              <Check className="h-3.5 w-3.5 mr-1.5" />
              Review Project
            </Button>
          )}
          {project.status === "IN_PROGRESS" && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => handleUpdateProjectStatus(project.id, "PENDING_REVIEW")}
            >
              <FileEdit className="h-3.5 w-3.5 mr-1.5" />
              Mark for Review
            </Button>
          )}
        </div>
      </div>
    );
  };

  // Add this function to render expertise items
  const renderExpertise = (exp: any) => {
    // Generate stars based on level
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= exp.level) {
        stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
      } else {
        stars.push(<Star key={i} className="h-4 w-4 text-gray-300" />);
      }
    }

    return (
      <div key={exp.id} className="flex items-center justify-between border p-4 rounded-lg">
        <div>
          <h4 className="font-medium">{exp.name}</h4>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline">{exp.category}</Badge>
            <div className="flex">{stars}</div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setCurrentExpertise(exp);
              setExpertiseLevel(exp.level.toString());
              setIsEditingExpertise(true);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-700"
            onClick={() => {
              setExpertiseToDelete(exp.id);
              setIsDeletingExpertise(true);
            }}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  // Use real data if available
  const displayExpertise = expertise;
  const displayActivities = activities;
  const displaySessions = sessions;
  const displayProjects = projects;

  // Function to fetch available skills
  const fetchAvailableSkills = async (mentorId: string, query: string = "") => {
    try {
      const response = await fetch(
        `/api/dashboard/mentors/skills?mentorId=${mentorId}&query=${query}`
      );
      if (!response.ok) throw new Error("Failed to fetch skills");
      const data = await response.json();
      return data.skills || [];
    } catch (error) {
      console.error("Error fetching available skills:", error);
      return [];
    }
  };

  // Function to handle adding expertise
  const handleAddExpertise = async () => {
    if (!selectedSkill || !expertiseLevel) {
      toast({
        title: "Missing information",
        description: "Please select a skill and expertise level",
        variant: "destructive",
      });
      return;
    }

    try {
      const mentorId = user.mentors?.[0]?.id;
      if (!mentorId) throw new Error("Mentor ID not found");

      const response = await fetch("/api/dashboard/mentors/expertise", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mentor_id: mentorId,
          skill_id: selectedSkill,
          level: parseInt(expertiseLevel),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add expertise");
      }

      const data = await response.json();

      // Add the new expertise to state
      setExpertise([...expertise, data.expertise]);

      // Reset the form
      setSelectedSkill("");
      setExpertiseLevel("3");
      setIsAddingExpertise(false);

      toast({
        title: "Success",
        description: "Expertise added successfully",
      });
    } catch (error) {
      console.error("Error adding expertise:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add expertise",
        variant: "destructive",
      });
    }
  };

  // Function to handle updating expertise
  const handleUpdateExpertise = async () => {
    if (!currentExpertise || !expertiseLevel) {
      toast({
        title: "Missing information",
        description: "Please select an expertise level",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/dashboard/mentors/expertise/${currentExpertise.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          level: parseInt(expertiseLevel),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update expertise");
      }

      const data = await response.json();

      // Update the expertise in state
      setExpertise(
        expertise.map((exp) => (exp.id === currentExpertise.id ? data.expertise : exp))
      );

      // Reset form and close dialog
      setCurrentExpertise(null);
      setExpertiseLevel("3");
      setIsEditingExpertise(false);

      toast({
        title: "Success",
        description: "Expertise updated successfully",
      });
    } catch (error) {
      console.error("Error updating expertise:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update expertise",
        variant: "destructive",
      });
    }
  };

  // Function to handle deleting expertise
  const handleDeleteExpertise = async () => {
    if (!expertiseToDelete) return;

    try {
      const response = await fetch(`/api/dashboard/mentors/expertise/${expertiseToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete expertise");
      }

      // Remove the expertise from state
      setExpertise(expertise.filter((exp) => exp.id !== expertiseToDelete));

      // Reset and close dialog
      setExpertiseToDelete(null);
      setIsDeletingExpertise(false);

      toast({
        title: "Success",
        description: "Expertise deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting expertise:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete expertise",
        variant: "destructive",
      });
    }
  };

  // Function to create a project
  const createProject = async (projectData: {
    title: string;
    description: string;
    student_id: string;
    mentor_id: string;
    technologies: string[];
  }) => {
    try {
      const response = await fetch("/api/dashboard/projects/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create project");
      }

      const data = await response.json();
      return data.project;
    } catch (error) {
      console.error("Error creating project:", error);
      throw error;
    }
  };

  // Function to update a project status
  const updateProjectStatus = async (projectId: string | number, status: string) => {
    try {
      const response = await fetch(`/api/dashboard/projects/${projectId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update project status");
      }

      const data = await response.json();
      return data.project;
    } catch (error) {
      console.error("Error updating project status:", error);
      throw error;
    }
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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-gradient-to-r from-primary/10 via-background to-background p-6 rounded-lg border shadow-sm">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Mentor Dashboard
          </h2>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user.name}! Here's an overview of your mentorship
            activities.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">View Analytics</Button>
          <Button>Schedule Session</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Students
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
                <div className="text-2xl font-bold">{stats.students_count}</div>
                <p className="text-xs text-muted-foreground">Active students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sessions</CardTitle>
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
                <div className="text-2xl font-bold">{stats.sessions_count}</div>
            <p className="text-xs text-muted-foreground">
                  Total sessions conducted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Projects</CardTitle>
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
                <div className="text-2xl font-bold">{stats.projects_count}</div>
                <p className="text-xs text-muted-foreground">Active projects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
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
                <div className="text-2xl font-bold">
                  {stats.completed_mentorships}
                </div>
            <p className="text-xs text-muted-foreground">
                  Completed mentorships
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Expertise Areas */}
            <Card className="md:col-span-2 lg:col-span-4">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>My Areas of Expertise</CardTitle>
                  <CardDescription>Skills you can mentor students on</CardDescription>
                </div>
                  <Button onClick={() => setIsAddingExpertise(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Expertise
                  </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
                  {displayExpertise.length > 0 ? (
                    displayExpertise.map((exp) => renderExpertise(exp))
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-muted-foreground">
                        You haven't added any areas of expertise yet.
                      </p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => setIsAddingExpertise(true)}
                      >
                        Add Your First Expertise
                      </Button>
                    </div>
                  )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
            <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Your latest interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {displayActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
                    >
                  <div className="space-y-1 w-full">
                    <p className="text-sm font-medium leading-none">
                      {activity.title}
                    </p>
                    <div className="flex items-center pt-2 justify-between">
                      <div className="flex items-center gap-2">
                        {activity.type === "SESSION_COMPLETED" && (
                              <Badge className="bg-green-500 hover:bg-green-600">
                                Completed
                              </Badge>
                            )}
                            {activity.type === "NEW_STUDENT" && (
                              <Badge className="bg-blue-500 hover:bg-blue-600">
                                New Student
                              </Badge>
                            )}
                            {activity.type === "PROJECT_REVIEW" && (
                              <Badge className="bg-purple-500 hover:bg-purple-600">
                                Review
                              </Badge>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {activity.date}
                        </p>
                      </div>
                          <Button variant="ghost" size="sm" className="ml-auto">
                            View
                          </Button>
                    </div>
                  </div>
                </div>
              ))}
                  {displayActivities.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No recent activities
                    </div>
                  )}
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
        <CardHeader>
              <CardTitle>Upcoming Sessions</CardTitle>
              <CardDescription>Your scheduled mentoring sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
                {displaySessions.map((session) => renderSession(session))}
                {displaySessions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No upcoming sessions scheduled
                  </div>
                )}
                <Button variant="outline" className="w-full mt-4">
                  View All Sessions
                </Button>
          </div>
        </CardContent>
      </Card>
        </TabsContent>
        
        <TabsContent value="projects" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Projects</CardTitle>
                <CardDescription>
                  Student projects you're mentoring
                </CardDescription>
              </div>
              <Dialog open={isCreatingProject} onOpenChange={setIsCreatingProject}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Project
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handleCreateProject}>
                    <DialogHeader>
                      <DialogTitle>Create New Project</DialogTitle>
                      <DialogDescription>
                        Set up a new project for your student
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="project-title">Project Title *</Label>
                        <Input 
                          id="project-title" 
                          placeholder="Enter project title"
                          value={newProject.title}
                          onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="project-description">Description</Label>
                        <Textarea
                          id="project-description"
                          placeholder="Describe the project requirements and goals"
                          value={newProject.description}
                          onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="project-technologies">Technologies</Label>
                        <Input 
                          id="project-technologies" 
                          placeholder="React, Node.js, MongoDB (comma separated)"
                          value={newProject.technologies}
                          onChange={(e) => setNewProject({...newProject, technologies: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="project-student">Student *</Label>
                        <select 
                          id="project-student"
                          className="w-full rounded-md border border-input bg-background px-3 py-2"
                          value={newProject.student_id}
                          onChange={(e) => setNewProject({...newProject, student_id: e.target.value})}
                          required
                        >
                          <option value="">Select a student</option>
                          {students.map((student) => (
                            <option key={student.id} value={student.id}>
                              {student.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      {submissionError && (
                        <div className="text-sm text-red-500">{submissionError}</div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsCreatingProject(false)}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Creating...' : 'Create Project'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {displayProjects.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {displayProjects.map((project) => renderProject(project))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No projects available. Create a new project to get started.
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Project Analytics</CardTitle>
              <CardDescription>Overview of project performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="border rounded-lg p-4">
                  <h4 className="text-sm font-medium mb-2">Status Breakdown</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs">In Progress</span>
                      <Badge variant="outline">
                        {displayProjects.filter(p => p.status === "IN_PROGRESS").length}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs">Pending Review</span>
                      <Badge variant="outline">
                        {displayProjects.filter(p => p.status === "PENDING_REVIEW").length}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs">Completed</span>
                      <Badge variant="outline">
                        {displayProjects.filter(p => p.status === "COMPLETED").length}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="text-sm font-medium mb-2">Timeline</h4>
                  <div className="text-center py-4 text-muted-foreground text-xs">
                    Projects analytics visualization would appear here
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="text-sm font-medium mb-2">Popular Technologies</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {Array.from(
                      new Set(
                        displayProjects
                          .flatMap(p => p.technologies)
                          .filter(Boolean)
                      )
                    ).map((tech, i) => (
                      <Badge key={i} variant="outline" className="bg-primary/5">
                        {tech}
                      </Badge>
                    ))}
                    {displayProjects.length === 0 && (
                      <div className="text-center w-full py-2 text-muted-foreground text-xs">
                        No data available
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sessions" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>All Sessions</CardTitle>
                <CardDescription>
                  Your scheduled and past mentoring sessions
                </CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Session
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Schedule New Session</DialogTitle>
                    <DialogDescription>
                      Create a new mentoring session with a student
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="session-title">Session Title</Label>
                      <Input id="session-title" placeholder="Enter session title" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="session-description">Description</Label>
                      <Textarea
                        id="session-description"
                        placeholder="Describe what this session will cover"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="session-date">Date</Label>
                        <Input id="session-date" type="date" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="session-time">Time</Label>
                        <Input id="session-time" type="time" />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Schedule Session</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {displaySessions.map((session) => renderSession(session))}
                {displaySessions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No sessions scheduled. Create your first session!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isAddingExpertise} onOpenChange={setIsAddingExpertise}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Area of Expertise</DialogTitle>
            <DialogDescription>
              Add a skill that you can mentor students on
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="skill-search">Search Skills</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="skill-search"
                  placeholder="Search for a skill..."
                  value={skillsSearchQuery}
                  onChange={(e) => setSkillsSearchQuery(e.target.value)}
                  className="pl-8"
                />
                {skillsSearchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setSkillsSearchQuery("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="skill">Available Skills</Label>
              <div className="max-h-[250px] overflow-y-auto border rounded-md p-2">
                {availableSkills.length > 0 ? (
                  <>
                    {/* Group skills by category */}
                    {Object.entries(
                      availableSkills.reduce<Record<string, Skill[]>>((acc, skill) => {
                        const category = skill.category || "Other";
                        if (!acc[category]) {
                          acc[category] = [];
                        }
                        acc[category].push(skill);
                        return acc;
                      }, {})
                    ).map(([category, skills]) => (
                      <div key={category} className="mb-3">
                        <h4 className="text-sm font-medium text-muted-foreground mb-1 px-2">{category}</h4>
                        <div className="space-y-1">
                          {skills.map((skill) => (
                            <div 
                              key={skill.id} 
                              className={`flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-muted transition-colors ${selectedSkill === skill.id ? 'bg-primary/10 border border-primary/30' : 'border'}`}
                              onClick={() => setSelectedSkill(skill.id)}
                            >
                              <div>
                                <p className="font-medium">{skill.name}</p>
                              </div>
                              {selectedSkill === skill.id && (
                                <Check className="h-4 w-4 text-primary" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="p-4 text-center">
                    {skillsSearchQuery ? (
                      <div className="text-muted-foreground">
                        <SearchX className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                        <p>No skills matching "{skillsSearchQuery}"</p>
                        <Button 
                          variant="link" 
                          className="mt-1 h-auto p-0"
                          onClick={() => setSkillsSearchQuery("")}
                        >
                          Clear search
                        </Button>
                      </div>
                    ) : (
                      <div className="text-muted-foreground">
                        <BookX className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                        <p>No more skills available to add</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="level">Your Expertise Level (1-5)</Label>
              <Select value={expertiseLevel} onValueChange={setExpertiseLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Beginner</SelectItem>
                  <SelectItem value="2">2 - Elementary</SelectItem>
                  <SelectItem value="3">3 - Intermediate</SelectItem>
                  <SelectItem value="4">4 - Advanced</SelectItem>
                  <SelectItem value="5">5 - Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddingExpertise(false);
              setSkillsSearchQuery("");
              setSelectedSkill("");
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddExpertise} 
              disabled={!selectedSkill}
            >
              Add Expertise
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditingExpertise} onOpenChange={setIsEditingExpertise}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Expertise Level</DialogTitle>
            <DialogDescription>
              Update your proficiency level for {currentExpertise?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-level">Your Expertise Level (1-5)</Label>
              <Select value={expertiseLevel} onValueChange={setExpertiseLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Beginner</SelectItem>
                  <SelectItem value="2">2 - Elementary</SelectItem>
                  <SelectItem value="3">3 - Intermediate</SelectItem>
                  <SelectItem value="4">4 - Advanced</SelectItem>
                  <SelectItem value="5">5 - Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingExpertise(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateExpertise}>Update Expertise</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeletingExpertise} onOpenChange={setIsDeletingExpertise}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expertise</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this expertise? Students won't be able to find you for this skill anymore.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteExpertise}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster />
    </div>
  );
} 
