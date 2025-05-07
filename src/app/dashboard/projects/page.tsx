"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/providers/AuthProvider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

interface Project {
  id: string | number;
  title: string;
  description: string;
  student: {
    id: string | number;
    name: string;
    avatar_url?: string;
  };
  status: "IN_PROGRESS" | "COMPLETED" | "REVIEW";
  progress: number;
  due_date?: string;
  skills: string[];
  last_updated: string;
}

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      try {
        if (user?.role === "MENTOR") {
          const response = await fetch(
            `/api/dashboard/projects?userId=${user.id}`
          );
          if (!response.ok) throw new Error("Failed to fetch projects");
          const data = await response.json();
          setProjects(data.projects || []);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, [user]);

  const renderProject = (project: Project) => {
    return (
      <Card key={project.id}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{project.title}</CardTitle>
              <CardDescription className="mt-2">
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
            >
              {project.status.replace("_", " ")}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Description</h4>
              <p className="text-sm text-muted-foreground">
                {project.description}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">Skills</h4>
              <div className="flex flex-wrap gap-2">
                {project.skills.map((skill, index) => (
                  <Badge key={index} variant="outline">
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
            {project.due_date && (
              <div>
                <h4 className="text-sm font-medium mb-1">Due Date</h4>
                <p className="text-sm text-muted-foreground">
                  {project.due_date}
                </p>
              </div>
            )}
            <div>
              <h4 className="text-sm font-medium mb-1">Last Updated</h4>
              <p className="text-sm text-muted-foreground">
                {project.last_updated}
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" size="sm">
                View Details
              </Button>
              {project.status === "REVIEW" && (
                <Button size="sm">Review Project</Button>
              )}
            </div>
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
                      <h4 className="text-sm font-medium mb-2">Description</h4>
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
                          <h4 className="text-sm font-medium mb-2">Due Date</h4>
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
                      <CardTitle className="text-xl">{project.title}</CardTitle>
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
                      <h4 className="text-sm font-medium mb-2">Description</h4>
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
                          <h4 className="text-sm font-medium mb-2">Due Date</h4>
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
                      <CardTitle className="text-xl">{project.title}</CardTitle>
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
                      <h4 className="text-sm font-medium mb-2">Description</h4>
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
                          <h4 className="text-sm font-medium mb-2">Due Date</h4>
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
    </div>
  );
}
