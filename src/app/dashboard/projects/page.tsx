"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/providers/AuthProvider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, DollarSign, Calendar } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface Project {
  id: string | number;
  title: string;
  description: string;
  student: {
    id: string | number;
    name: string;
    avatar_url?: string;
  };
  status: "IN_PROGRESS" | "COMPLETED" | "REVIEW" | "OPEN";
  progress: number;
  due_date?: string;
  skills: string[];
  last_updated: string;
  type?: string;
  assigned?: boolean;
  company_name?: string;
  budget?: number;
}

// Mock projects data
const mockProjects: Project[] = [
  {
    id: 1,
    title: "E-commerce Platform Development",
    description:
      "Build a full-stack e-commerce platform with React, Node.js, and MongoDB. Features include user authentication, product catalog, shopping cart, and payment integration.",
    student: {
      id: 1,
      name: "Sarah Johnson",
      avatar_url: "https://i.pravatar.cc/150?img=1",
    },
    status: "IN_PROGRESS",
    progress: 65,
    due_date: "2024-04-15",
    skills: ["React", "Node.js", "MongoDB", "Stripe API"],
    last_updated: "2024-03-18",
    type: "CHALLENGE",
  },
  {
    id: 2,
    title: "AI-Powered Task Manager",
    description:
      "Create an intelligent task management application that uses AI to prioritize and categorize tasks. Include features for team collaboration and progress tracking.",
    student: {
      id: 2,
      name: "Michael Chen",
      avatar_url: "https://i.pravatar.cc/150?img=2",
    },
    status: "REVIEW",
    progress: 100,
    due_date: "2024-03-20",
    skills: ["Python", "TensorFlow", "FastAPI", "PostgreSQL"],
    last_updated: "2024-03-19",
    type: "CHALLENGE",
  },
  {
    id: 3,
    title: "Mobile Fitness App",
    description:
      "Develop a cross-platform mobile application for tracking workouts, nutrition, and fitness goals. Include social features and progress visualization.",
    student: {
      id: 3,
      name: "Emily Davis",
      avatar_url: "https://i.pravatar.cc/150?img=3",
    },
    status: "COMPLETED",
    progress: 100,
    due_date: "2024-03-10",
    skills: ["React Native", "Firebase", "Redux", "Node.js"],
    last_updated: "2024-03-10",
    type: "CHALLENGE",
  },
  {
    id: 4,
    title: "Real Estate Listing Platform",
    description:
      "Build a modern real estate platform with advanced search, virtual tours, and property management features. Focus on user experience and performance.",
    student: {
      id: 0,
      name: "Not Assigned",
    },
    status: "OPEN",
    progress: 0,
    skills: ["Vue.js", "Django", "PostgreSQL", "AWS"],
    last_updated: "2024-03-15",
    type: "AVAILABLE",
    company_name: "TechVision Ltd",
    budget: 5000,
  },
  {
    id: 5,
    title: "Healthcare Management System",
    description:
      "Create a comprehensive healthcare management system for clinics. Features include patient records, appointment scheduling, and billing management.",
    student: {
      id: 0,
      name: "Not Assigned",
    },
    status: "OPEN",
    progress: 0,
    skills: ["Java", "Spring Boot", "MySQL", "Docker"],
    last_updated: "2024-03-17",
    type: "AVAILABLE",
    company_name: "Digital Solutions Inc",
    budget: 8000,
  },
  {
    id: 6,
    title: "Social Media Analytics Dashboard",
    description:
      "Develop a dashboard for analyzing social media metrics and trends. Include data visualization, reporting, and automated insights.",
    student: {
      id: 0,
      name: "Not Assigned",
    },
    status: "OPEN",
    progress: 0,
    skills: ["React", "Python", "MongoDB", "D3.js"],
    last_updated: "2024-03-16",
    type: "AVAILABLE",
    company_name: "Creative Studios",
    budget: 6000,
  },
];

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingProject, setCreatingProject] = useState(false);
  const [projectFormData, setProjectFormData] = useState({
    title: "",
    description: "",
    is_paid: false,
    budget: "",
    deadline: "",
    technologies: [""],
  });
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [applicationData, setApplicationData] = useState({
    cover_letter: "",
  });

  useEffect(() => {
    async function fetchProjects() {
      try {
        if (user?.id) {
          // Use mock data instead of fetching
          setProjects(mockProjects);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchProjects();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleCreateProject = async () => {
    try {
      if (!user?.employers || user.employers.length === 0) {
        throw new Error("No employer account found");
      }

      const employerId = user.employers[0].id;
      const response = await fetch("/api/dashboard/projects/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...projectFormData,
          employer_id: employerId,
          userRole: "EMPLOYER",
          technologies: projectFormData.technologies.filter(
            (tech) => tech.trim() !== ""
          ),
          budget: projectFormData.budget
            ? parseFloat(projectFormData.budget)
            : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        throw new Error(errorData.error || "Failed to create project");
      }

      // Refresh projects list
      const updatedResponse = await fetch(
        `/api/dashboard/projects?userId=${user.id}&userRole=${user.role}`
      );
      if (!updatedResponse.ok) throw new Error("Failed to fetch projects");
      const data = await updatedResponse.json();
      setProjects(data.projects || []);

      // Reset form and close dialog
      setProjectFormData({
        title: "",
        description: "",
        is_paid: false,
        budget: "",
        deadline: "",
        technologies: [""],
      });
      setCreatingProject(false);
    } catch (error) {
      console.error("Error creating project:", error);
      // You could add a toast notification here to inform the user
    }
  };

  const handleAddTechnology = () => {
    setProjectFormData({
      ...projectFormData,
      technologies: [...projectFormData.technologies, ""],
    });
  };

  const handleRemoveTechnology = (index: number) => {
    const technologies = [...projectFormData.technologies];
    technologies.splice(index, 1);
    setProjectFormData({
      ...projectFormData,
      technologies,
    });
  };

  const handleTechnologyChange = (index: number, value: string) => {
    const technologies = [...projectFormData.technologies];
    technologies[index] = value;
    setProjectFormData({
      ...projectFormData,
      technologies,
    });
  };

  const handleApplyToProject = async (project: Project) => {
    try {
      if (!user?.students || user.students.length === 0) {
        throw new Error("No student account found");
      }

      const studentId = user.students[0].id;
      const response = await fetch("/api/dashboard/projects/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          project_id: project.id,
          student_id: studentId,
          cover_letter: applicationData.cover_letter,
          userRole: "STUDENT",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        throw new Error(errorData.error || "Failed to apply to project");
      }

      // Close the modal and reset application data
      setSelectedProject(null);
      setApplicationData({ cover_letter: "" });

      // Optionally, show a success toast or update projects list
      alert("Application submitted successfully!");
    } catch (error) {
      console.error("Error applying to project:", error);
      alert(error instanceof Error ? error.message : "Failed to apply to project");
    }
  };

  const renderProject = (project: Project) => {
    return (
      <Card key={project.id} className="flex flex-col hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="pb-4 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-gray-800">
                {project.title}
              </CardTitle>
              <CardDescription className="mt-1 text-gray-600">
                {project.company_name || "SkillBridge Project"}
              </CardDescription>
            </div>
            <Badge 
              variant={
                project.status === "COMPLETED" ? "default" 
                : project.status === "IN_PROGRESS" ? "secondary"
                : "outline"
              } 
              className="uppercase tracking-wider"
            >
              {project.status.replace("_", " ")}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex-grow space-y-4 p-6">
          <div className="text-sm text-gray-700 line-clamp-3">
            {project.description}
          </div>
          
          {project.skills && project.skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {project.skills.slice(0, 3).map((skill, index) => (
                <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700">
                  {skill}
                </Badge>
              ))}
              {project.skills.length > 3 && (
                <Badge variant="outline" className="bg-gray-100">
                  +{project.skills.length - 3} more
                </Badge>
              )}
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
            {project.budget && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span>${project.budget}</span>
              </div>
            )}
            {project.due_date && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span>{new Date(project.due_date).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="border-t p-4 bg-gray-50">
          <div className="flex justify-between items-center w-full">
            <Button variant="outline" size="sm">
              View Details
            </Button>
            
            {user?.role === "STUDENT" && project.type === "AVAILABLE" && (
              <Button 
                size="sm" 
                onClick={() => {
                  setSelectedProject(project);
                  setApplicationData({ cover_letter: "" });
                }}
              >
                Apply Now
              </Button>
            )}
          </div>
        </CardFooter>
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

  const inProgressProjects = projects.filter(
    (project) => project.status === "IN_PROGRESS"
  );
  const reviewProjects = projects.filter(
    (project) => project.status === "REVIEW"
  );
  const completedProjects = projects.filter(
    (project) => project.status === "COMPLETED"
  );
  const openProjects = projects.filter((project) => project.status === "OPEN");

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
          <p className="text-muted-foreground mt-1.5">
            Manage and review student projects
          </p>
        </div>

        {user?.role === "EMPLOYER" && (
          <Dialog open={creatingProject} onOpenChange={setCreatingProject}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Project
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create a New Project</DialogTitle>
                <DialogDescription>
                  Post a new project for students to apply and work on.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Project Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter project title"
                    value={projectFormData.title}
                    onChange={(e) =>
                      setProjectFormData({
                        ...projectFormData,
                        title: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter project description, requirements, and expectations"
                    rows={6}
                    value={projectFormData.description}
                    onChange={(e) =>
                      setProjectFormData({
                        ...projectFormData,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Technologies/Skills Required</Label>
                  {projectFormData.technologies.map((tech, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="e.g., React, Python, UI/UX"
                        value={tech}
                        onChange={(e) =>
                          handleTechnologyChange(index, e.target.value)
                        }
                      />
                      {index > 0 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveTechnology(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddTechnology}
                    className="mt-1 w-fit"
                  >
                    Add Technology
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_paid"
                    checked={projectFormData.is_paid}
                    onCheckedChange={(checked) =>
                      setProjectFormData({
                        ...projectFormData,
                        is_paid: checked,
                      })
                    }
                  />
                  <Label htmlFor="is_paid">This is a paid project</Label>
                </div>
                {projectFormData.is_paid && (
                  <div className="grid gap-2">
                    <Label htmlFor="budget">Budget (USD)</Label>
                    <Input
                      id="budget"
                      type="number"
                      placeholder="Enter project budget"
                      value={projectFormData.budget}
                      onChange={(e) =>
                        setProjectFormData({
                          ...projectFormData,
                          budget: e.target.value,
                        })
                      }
                    />
                  </div>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="deadline">Deadline</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={projectFormData.deadline}
                    onChange={(e) =>
                      setProjectFormData({
                        ...projectFormData,
                        deadline: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setCreatingProject(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateProject}>Create Project</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {user?.role === "MENTOR" && (
        <Tabs defaultValue="in-progress" className="space-y-8">
          <TabsList className="w-full md:w-auto">
            <TabsTrigger value="in-progress" className="flex-1 md:flex-none">
              In Progress ({inProgressProjects.length})
            </TabsTrigger>
            <TabsTrigger value="review" className="flex-1 md:flex-none">
              Review ({reviewProjects.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex-1 md:flex-none">
              Completed ({completedProjects.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="in-progress" className="space-y-6">
            {inProgressProjects.length > 0 ? (
              inProgressProjects.map((project) => (
                <Card key={project.id} className="overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <CardTitle className="text-xl">
                          {project.title}
                        </CardTitle>
                        <CardDescription className="mt-1.5">
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={project.student.avatar_url} />
                              <AvatarFallback>
                                {project.student.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span>{project.student.name}</span>
                          </div>
                        </CardDescription>
                      </div>
                      <Badge
                        variant={
                          project.status === "COMPLETED"
                            ? "default"
                            : project.status === "REVIEW"
                            ? "secondary"
                            : "outline"
                        }
                        className="w-fit"
                      >
                        {project.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-medium mb-2">
                          Description
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {project.description}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-3">Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {project.skills.map((skill, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="px-3 py-1"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium">Progress</h4>
                          <span className="text-sm text-muted-foreground">
                            {project.progress}%
                          </span>
                        </div>
                        <Progress value={project.progress} className="h-2" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {project.due_date && (
                          <div>
                            <h4 className="text-sm font-medium mb-2">
                              Due Date
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {project.due_date}
                            </p>
                          </div>
                        )}
                        <div>
                          <h4 className="text-sm font-medium mb-2">
                            Last Updated
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {project.last_updated}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-end gap-3">
                        <Button variant="outline" size="sm" className="px-4">
                          View Details
                        </Button>
                        {project.status === "REVIEW" && (
                          <Button size="sm" className="px-4">
                            Review Project
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <p className="text-muted-foreground text-center">
                    No projects in progress
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="review" className="space-y-6">
            {reviewProjects.length > 0 ? (
              reviewProjects.map((project) => (
                <Card key={project.id} className="overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <CardTitle className="text-xl">
                          {project.title}
                        </CardTitle>
                        <CardDescription className="mt-1.5">
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={project.student.avatar_url} />
                              <AvatarFallback>
                                {project.student.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span>{project.student.name}</span>
                          </div>
                        </CardDescription>
                      </div>
                      <Badge
                        variant={
                          project.status === "COMPLETED"
                            ? "default"
                            : project.status === "REVIEW"
                            ? "secondary"
                            : "outline"
                        }
                        className="w-fit"
                      >
                        {project.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-medium mb-2">
                          Description
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {project.description}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-3">Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {project.skills.map((skill, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="px-3 py-1"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium">Progress</h4>
                          <span className="text-sm text-muted-foreground">
                            {project.progress}%
                          </span>
                        </div>
                        <Progress value={project.progress} className="h-2" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {project.due_date && (
                          <div>
                            <h4 className="text-sm font-medium mb-2">
                              Due Date
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {project.due_date}
                            </p>
                          </div>
                        )}
                        <div>
                          <h4 className="text-sm font-medium mb-2">
                            Last Updated
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {project.last_updated}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-end gap-3">
                        <Button variant="outline" size="sm" className="px-4">
                          View Details
                        </Button>
                        {project.status === "REVIEW" && (
                          <Button size="sm" className="px-4">
                            Review Project
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <p className="text-muted-foreground text-center">
                    No projects awaiting review
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-6">
            {completedProjects.length > 0 ? (
              completedProjects.map((project) => (
                <Card key={project.id} className="overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <CardTitle className="text-xl">
                          {project.title}
                        </CardTitle>
                        <CardDescription className="mt-1.5">
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={project.student.avatar_url} />
                              <AvatarFallback>
                                {project.student.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span>{project.student.name}</span>
                          </div>
                        </CardDescription>
                      </div>
                      <Badge
                        variant={
                          project.status === "COMPLETED"
                            ? "default"
                            : project.status === "REVIEW"
                            ? "secondary"
                            : "outline"
                        }
                        className="w-fit"
                      >
                        {project.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-medium mb-2">
                          Description
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {project.description}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-3">Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {project.skills.map((skill, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="px-3 py-1"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium">Progress</h4>
                          <span className="text-sm text-muted-foreground">
                            {project.progress}%
                          </span>
                        </div>
                        <Progress value={project.progress} className="h-2" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {project.due_date && (
                          <div>
                            <h4 className="text-sm font-medium mb-2">
                              Due Date
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {project.due_date}
                            </p>
                          </div>
                        )}
                        <div>
                          <h4 className="text-sm font-medium mb-2">
                            Last Updated
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {project.last_updated}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-end gap-3">
                        <Button variant="outline" size="sm" className="px-4">
                          View Details
                        </Button>
                        {project.status === "REVIEW" && (
                          <Button size="sm" className="px-4">
                            Review Project
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <p className="text-muted-foreground text-center">
                    No completed projects
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}

      {user?.role === "EMPLOYER" && (
        <Tabs defaultValue="open" className="space-y-8">
          <TabsList className="w-full md:w-auto">
            <TabsTrigger value="open" className="flex-1 md:flex-none">
              Open Projects ({openProjects.length})
            </TabsTrigger>
            <TabsTrigger value="in-progress" className="flex-1 md:flex-none">
              In Progress ({inProgressProjects.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex-1 md:flex-none">
              Completed ({completedProjects.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="open" className="space-y-6">
            {openProjects.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {openProjects.map((project) => renderProject(project))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center border rounded-lg p-8">
                <div className="text-center">
                  <h3 className="text-lg font-medium mb-2">No open projects</h3>
                  <p className="text-muted-foreground mb-4">
                    You don't have any open projects at the moment.
                  </p>
                  <Button onClick={() => setCreatingProject(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Project
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="in-progress" className="space-y-6">
            {inProgressProjects.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {inProgressProjects.map((project) => renderProject(project))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center border rounded-lg p-8">
                <div className="text-center">
                  <h3 className="text-lg font-medium mb-2">
                    No projects in progress
                  </h3>
                  <p className="text-muted-foreground">
                    You don't have any projects in progress at the moment.
                  </p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-6">
            {completedProjects.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {completedProjects.map((project) => renderProject(project))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center border rounded-lg p-8">
                <div className="text-center">
                  <h3 className="text-lg font-medium mb-2">
                    No completed projects
                  </h3>
                  <p className="text-muted-foreground">
                    You don't have any completed projects yet.
                  </p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {user?.role === "STUDENT" && (
        <Tabs defaultValue="available" className="space-y-8">
          <TabsList className="w-full md:w-auto">
            <TabsTrigger value="available" className="flex-1 md:flex-none">
              Available Projects
            </TabsTrigger>
            <TabsTrigger value="applied" className="flex-1 md:flex-none">
              My Applications
            </TabsTrigger>
            <TabsTrigger value="assigned" className="flex-1 md:flex-none">
              Assigned Projects
            </TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="space-y-6">
            {projects.filter((p) => p.type === "AVAILABLE").length > 0 ? (
              projects
                .filter((p) => p.type === "AVAILABLE")
                .map((project) => renderProject(project))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <p className="text-muted-foreground text-center">
                    No available projects found
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="applied" className="space-y-6">
            {projects.filter((p) => p.type === "APPLICATION").length > 0 ? (
              projects
                .filter((p) => p.type === "APPLICATION")
                .map((project) => renderProject(project))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <p className="text-muted-foreground text-center">
                    You haven't applied to any projects yet
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="assigned" className="space-y-6">
            {projects.filter((p) => p.type === "CHALLENGE" || p.assigned)
              .length > 0 ? (
              projects
                .filter((p) => p.type === "CHALLENGE" || p.assigned)
                .map((project) => renderProject(project))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <p className="text-muted-foreground text-center">
                    No projects assigned to you
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}

      {selectedProject && (
        <Dialog 
          open={!!selectedProject} 
          onOpenChange={() => setSelectedProject(null)}
        >
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Apply to {selectedProject.title}</DialogTitle>
              <DialogDescription>
                Submit your application for this project
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="cover_letter">Cover Letter</Label>
                <Textarea
                  id="cover_letter"
                  placeholder="Why are you a great fit for this project? (Optional)"
                  value={applicationData.cover_letter}
                  onChange={(e) => 
                    setApplicationData({
                      ...applicationData, 
                      cover_letter: e.target.value 
                    })
                  }
                  rows={5}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setSelectedProject(null)}
              >
                Cancel
              </Button>
              <Button 
                onClick={() => handleApplyToProject(selectedProject)}
                disabled={!selectedProject}
              >
                Submit Application
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
