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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Briefcase, Clock, Calendar, Plus, Eye, ExternalLink, PlusCircle } from "lucide-react";
import Link from "next/link";
import { Toaster } from "@/components/ui/toaster";

interface Project {
  id: string | number;
  title: string;
  description: string;
  status: string;
  is_paid?: boolean;
  budget?: number | string;
  deadline?: string;
  created_at?: string;
  updated_at?: string;
  technologies?: string[];
  skills?: string[];
  employer_id?: string;
  company_name?: string;
  applications_count?: number;
  progress?: number;
  student?: {
    id: string | number;
    name: string;
    avatar_url?: string;
  };
  last_updated?: string;
}

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [projectForm, setProjectForm] = useState({
    title: "",
    description: "",
    is_paid: false,
    budget: "",
    deadline: "",
    technologies: [] as string[],
  });
  const [newTechnology, setNewTechnology] = useState("");

  useEffect(() => {
    fetchProjects();
  }, [user, activeTab]);

  async function fetchProjects() {
    try {
      setLoading(true);
      
      if (!user) return;
      
      let url = '';
      
      if (user.role === "EMPLOYER" && user.employers && user.employers.length > 0) {
        // Fetch employer projects
        url = `/api/dashboard/employers/projects?employerId=${user.employers[0].id}`;
        if (activeTab !== "all") {
          url += `&status=${activeTab.toUpperCase()}`;
        }
      } else if (user.role === "STUDENT" && user.students && user.students.length > 0) {
        // Fetch student projects
        url = `/api/dashboard/students/projects?studentId=${user.students[0].id}`;
        if (activeTab !== "all") {
          url += `&status=${activeTab.toUpperCase()}`;
        }
      } else if (user.role === "MENTOR" && user.mentors && user.mentors.length > 0) {
        // Fetch mentor projects
        url = `/api/dashboard/projects?userId=${user.id}`;
      } else {
        setLoading(false);
        return;
      }
      
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch projects");
      const data = await response.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateProject = async () => {
    try {
      if (!user?.employers || user.employers.length === 0) {
        toast({
          title: "Error",
          description: "Employer profile not found",
          variant: "destructive",
        });
        return;
      }
      
      const employerId = user.employers[0].id;
      
      const response = await fetch('/api/dashboard/projects/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userRole: user.role,
          employer_id: employerId,
          title: projectForm.title,
          description: projectForm.description,
          is_paid: projectForm.is_paid,
          budget: projectForm.is_paid ? parseFloat(projectForm.budget) : null,
          deadline: projectForm.deadline,
          technologies: projectForm.technologies,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to create project");
      }
      
      toast({
        title: "Project Created",
        description: "Your project has been created successfully.",
      });
      
      // Refresh the projects list
      fetchProjects();
      
      // Reset form and close dialog
      setProjectForm({
        title: "",
        description: "",
        is_paid: false,
        budget: "",
        deadline: "",
        technologies: [],
      });
      setShowCreateDialog(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create project",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    
    try {
      const response = await fetch(`/api/dashboard/employers/projects/${projectToDelete}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete project");
      }
      
      toast({
        title: "Project Deleted",
        description: "The project has been deleted successfully.",
      });
      
      // Refresh projects list
      fetchProjects();
      
      // Reset state
      setProjectToDelete(null);
      setShowDeleteDialog(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete project",
        variant: "destructive",
      });
    }
  };

  const handleAddTechnology = () => {
    if (!newTechnology.trim()) return;
    
    if (!projectForm.technologies.includes(newTechnology)) {
      setProjectForm({
        ...projectForm,
        technologies: [...projectForm.technologies, newTechnology],
      });
    }
    
    setNewTechnology("");
  };

  const handleRemoveTechnology = (tech: string) => {
    setProjectForm({
      ...projectForm,
      technologies: projectForm.technologies.filter(t => t !== tech),
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Employer View
  if (user?.role === "EMPLOYER") {
    const openProjects = projects.filter(p => p.status === "OPEN");
    const inProgressProjects = projects.filter(p => p.status === "IN_PROGRESS");
    const completedProjects = projects.filter(p => p.status === "COMPLETED");
    
    return (
      <div className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
            <p className="text-muted-foreground mt-1.5">
              Create and manage projects for students
            </p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Project
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Projects</TabsTrigger>
            <TabsTrigger value="open">Open</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {projects.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                  <Card key={project.id} className="flex flex-col">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{project.title}</CardTitle>
                          <CardDescription className="mt-1">
                            {project.company_name || (user?.employers && user.employers[0]?.company_name)}
                          </CardDescription>
                        </div>
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
                    </CardHeader>
                    <CardContent className="pb-3 text-sm">
                      <p className="line-clamp-3 text-muted-foreground">
                        {project.description}
                      </p>
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        {project.is_paid && (
                          <div className="flex items-center">
                            <Briefcase className="h-3.5 w-3.5 text-muted-foreground mr-1" />
                            <span className="text-xs truncate">
                              Budget: ${project.budget}
                            </span>
                          </div>
                        )}
                        {project.deadline && (
                          <div className="flex items-center">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground mr-1" />
                            <span className="text-xs truncate">
                              Deadline: {new Date(project.deadline).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center col-span-2 mt-1">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground mr-1" />
                          <span className="text-xs">
                            Created: {new Date(project.created_at || "").toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      {project.technologies && project.technologies.length > 0 && (
                        <div className="mt-4">
                          <p className="text-xs font-medium mb-2">Technologies</p>
                          <div className="flex flex-wrap gap-2">
                            {project.technologies.map((tech, index) => (
                              <Badge key={index} variant="secondary">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-between items-center border-t mt-auto pt-3">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/projects/${project.id}`}>
                          <Eye className="h-3.5 w-3.5 mr-1.5" />
                          View Details
                        </Link>
                      </Button>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => {
                            setProjectToDelete(project.id as string);
                            setShowDeleteDialog(true);
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="bg-muted rounded-lg text-center py-16">
                <Briefcase className="h-10 w-10 mx-auto text-muted-foreground" />
                <h3 className="text-lg font-medium mt-4">No projects found</h3>
                <p className="text-muted-foreground mt-1 mb-4">
                  Create your first project to get started
                </p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Project
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Create Project Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Create a new project for students to apply and work on
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Project Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. Build a React E-commerce Website"
                  value={projectForm.title}
                  onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Project Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the project requirements, objectives, and expectations..."
                  rows={5}
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_paid"
                    checked={projectForm.is_paid}
                    onChange={(e) => setProjectForm({ ...projectForm, is_paid: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="is_paid">Paid Project</Label>
                </div>
              </div>
              {projectForm.is_paid && (
                <div className="grid gap-2">
                  <Label htmlFor="budget">Budget (USD)</Label>
                  <Input
                    id="budget"
                    type="number"
                    placeholder="e.g. 500"
                    value={projectForm.budget}
                    onChange={(e) => setProjectForm({ ...projectForm, budget: e.target.value })}
                  />
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={projectForm.deadline}
                  onChange={(e) => setProjectForm({ ...projectForm, deadline: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="technologies">Technologies/Skills Required</Label>
                <div className="flex gap-2">
                  <Input
                    id="technologies"
                    placeholder="e.g. React, Node.js"
                    value={newTechnology}
                    onChange={(e) => setNewTechnology(e.target.value)}
                  />
                  <Button type="button" variant="outline" onClick={handleAddTechnology}>
                    Add
                  </Button>
                </div>
                {projectForm.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {projectForm.technologies.map((tech, index) => (
                      <Badge key={index} variant="secondary">
                        {tech}
                        <button
                          type="button"
                          className="ml-1 text-xs"
                          onClick={() => handleRemoveTechnology(tech)}
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateProject}>Create Project</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Project Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Project</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this project? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteProject}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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

  // Student View
  if (user?.role === "STUDENT") {
    const myProjects = projects.filter(p => p.status === "IN_PROGRESS" || p.status === "COMPLETED");
    
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
          <p className="text-muted-foreground mt-1.5">
            View and manage your projects
          </p>
        </div>

        <Tabs defaultValue="my-projects" className="space-y-8">
          <TabsList>
            <TabsTrigger value="my-projects">My Projects</TabsTrigger>
            <TabsTrigger value="explore">Explore Projects</TabsTrigger>
          </TabsList>

          <TabsContent value="my-projects">
            {myProjects.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {myProjects.map((project) => (
                  <Card key={project.id} className="flex flex-col">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle>{project.title}</CardTitle>
                        <Badge
                          variant={
                            project.status === "COMPLETED"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {project.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <CardDescription className="mt-2">
                        {project.company_name || "Project Sponsor"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {project.description}
                          </p>
                        </div>
                        {project.technologies && project.technologies.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-2">Technologies</h4>
                            <div className="flex flex-wrap gap-2">
                              {project.technologies.map((tech, index) => (
                                <Badge key={index} variant="secondary">
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {project.progress !== undefined && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-sm font-medium">Progress</h4>
                              <span className="text-sm text-muted-foreground">
                                {project.progress}%
                              </span>
                            </div>
                            <Progress value={project.progress} className="h-2" />
                          </div>
                        )}
                        {project.deadline && (
                          <div>
                            <h4 className="text-sm font-medium mb-1">Deadline</h4>
                            <p className="text-sm text-muted-foreground">
                              {new Date(project.deadline).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="border-t pt-4 mt-auto">
                      <Button className="w-full" asChild>
                        <Link href={`/dashboard/projects/${project.id}`}>
                          View Project
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="bg-muted rounded-lg text-center py-16">
                <Briefcase className="h-10 w-10 mx-auto text-muted-foreground" />
                <h3 className="text-lg font-medium mt-4">No active projects</h3>
                <p className="text-muted-foreground mt-1 mb-4">
                  You don't have any projects yet. Explore available projects to apply!
                </p>
                <Button>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Explore Projects
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="explore">
            <div className="mb-6">
              <h3 className="text-lg font-semibold">Available Projects</h3>
              <p className="text-muted-foreground">Browse open projects and apply to work on them</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* We would need to fetch open projects here */}
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle>E-commerce Website</CardTitle>
                  <CardDescription>ABC Company</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Build a responsive e-commerce website with React and Node.js
                    </p>
                    <div>
                      <h4 className="text-sm font-medium mb-2">Technologies</h4>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">React</Badge>
                        <Badge variant="secondary">Node.js</Badge>
                        <Badge variant="secondary">MongoDB</Badge>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Briefcase className="h-4 w-4 text-muted-foreground mr-1.5" />
                      <span className="text-sm">Paid: $500</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-muted-foreground mr-1.5" />
                      <span className="text-sm">Deadline: Aug 30, 2023</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4 mt-auto">
                  <Button className="w-full">
                    Apply Now
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle>Mobile App Development</CardTitle>
                  <CardDescription>Tech Solutions Ltd</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Develop a cross-platform mobile app using React Native
                    </p>
                    <div>
                      <h4 className="text-sm font-medium mb-2">Technologies</h4>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">React Native</Badge>
                        <Badge variant="secondary">Firebase</Badge>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Briefcase className="h-4 w-4 text-muted-foreground mr-1.5" />
                      <span className="text-sm">Paid: $800</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-muted-foreground mr-1.5" />
                      <span className="text-sm">Deadline: Sep 15, 2023</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4 mt-auto">
                  <Button className="w-full">
                    Apply Now
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        
        <Toaster />
      </div>
    );
  }

  // Mentor View - keep existing mentor view code
  const inProgressProjects = projects.filter(
    (project) => project.status === "IN_PROGRESS"
  );
  const reviewProjects = projects.filter(
    (project) => project.status === "REVIEW"
  );
  const completedProjects = projects.filter(
    (project) => project.status === "COMPLETED"
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
        <p className="text-muted-foreground mt-1.5">
          Manage and review student projects
        </p>
      </div>

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
                      <CardTitle className="text-xl">{project.title}</CardTitle>
                      <CardDescription className="mt-1.5">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={project.student?.avatar_url} />
                            <AvatarFallback>
                              {project.student?.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span>{project.student?.name}</span>
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
                      <h4 className="text-sm font-medium mb-2">Description</h4>
                      <p className="text-sm text-muted-foreground">
                        {project.description}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-3">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {project.skills?.map((skill, index) => (
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
                      {project.deadline && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Due Date</h4>
                          <p className="text-sm text-muted-foreground">
                            {project.deadline}
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
                      <CardTitle className="text-xl">{project.title}</CardTitle>
                      <CardDescription className="mt-1.5">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={project.student?.avatar_url} />
                            <AvatarFallback>
                              {project.student?.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span>{project.student?.name}</span>
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
                      <h4 className="text-sm font-medium mb-2">Description</h4>
                      <p className="text-sm text-muted-foreground">
                        {project.description}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-3">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {project.skills?.map((skill, index) => (
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
                      {project.deadline && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Due Date</h4>
                          <p className="text-sm text-muted-foreground">
                            {project.deadline}
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
                      <CardTitle className="text-xl">{project.title}</CardTitle>
                      <CardDescription className="mt-1.5">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={project.student?.avatar_url} />
                            <AvatarFallback>
                              {project.student?.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span>{project.student?.name}</span>
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
                      <h4 className="text-sm font-medium mb-2">Description</h4>
                      <p className="text-sm text-muted-foreground">
                        {project.description}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-3">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {project.skills?.map((skill, index) => (
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
                      {project.deadline && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Due Date</h4>
                          <p className="text-sm text-muted-foreground">
                            {project.deadline}
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
      
      <Toaster />
    </div>
  );
}
