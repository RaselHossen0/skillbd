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

interface Student {
  id: string | number;
  name: string;
  email: string;
  avatar_url?: string;
  skills: string[];
  progress: {
    completed_sessions: number;
    total_sessions: number;
    completed_projects: number;
    total_projects: number;
  };
  status: "ACTIVE" | "INACTIVE";
  last_session?: string;
}

// Mock students data
const mockStudents: Student[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    avatar_url: "https://i.pravatar.cc/150?img=1",
    skills: ["React", "TypeScript", "Node.js", "MongoDB"],
    progress: {
      completed_sessions: 8,
      total_sessions: 12,
      completed_projects: 3,
      total_projects: 4,
    },
    status: "ACTIVE",
    last_session: "2024-03-15",
  },
  {
    id: 2,
    name: "Michael Chen",
    email: "michael.chen@example.com",
    avatar_url: "https://i.pravatar.cc/150?img=2",
    skills: ["Python", "Django", "PostgreSQL", "AWS"],
    progress: {
      completed_sessions: 6,
      total_sessions: 10,
      completed_projects: 2,
      total_projects: 3,
    },
    status: "ACTIVE",
    last_session: "2024-03-18",
  },
  {
    id: 3,
    name: "Emily Davis",
    email: "emily.davis@example.com",
    avatar_url: "https://i.pravatar.cc/150?img=3",
    skills: ["Java", "Spring Boot", "MySQL", "Docker"],
    progress: {
      completed_sessions: 4,
      total_sessions: 8,
      completed_projects: 1,
      total_projects: 2,
    },
    status: "ACTIVE",
    last_session: "2024-03-10",
  },
  {
    id: 4,
    name: "David Wilson",
    email: "david.wilson@example.com",
    avatar_url: "https://i.pravatar.cc/150?img=4",
    skills: ["JavaScript", "Vue.js", "Express", "MongoDB"],
    progress: {
      completed_sessions: 2,
      total_sessions: 6,
      completed_projects: 0,
      total_projects: 2,
    },
    status: "INACTIVE",
    last_session: "2024-02-28",
  },
  {
    id: 5,
    name: "Lisa Anderson",
    email: "lisa.anderson@example.com",
    avatar_url: "https://i.pravatar.cc/150?img=5",
    skills: ["C#", ".NET", "SQL Server", "Azure"],
    progress: {
      completed_sessions: 3,
      total_sessions: 8,
      completed_projects: 1,
      total_projects: 3,
    },
    status: "INACTIVE",
    last_session: "2024-03-01",
  },
];

export default function StudentsPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStudents() {
      try {
        if (user?.role === "MENTOR") {
          // Use mock data instead of fetching
          setStudents(mockStudents);
        }
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStudents();
  }, [user]);

  const renderStudent = (student: Student) => {
    return (
      <Card key={student.id}>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={student.avatar_url} />
              <AvatarFallback>
                {student.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{student.name}</CardTitle>
              <CardDescription>{student.email}</CardDescription>
            </div>
            <Badge
              variant={student.status === "ACTIVE" ? "default" : "secondary"}
              className="ml-auto"
            >
              {student.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Skills</h4>
              <div className="flex flex-wrap gap-2">
                {student.skills.map((skill, index) => (
                  <Badge key={index} variant="outline">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Sessions</h4>
                <p className="text-sm text-muted-foreground">
                  {student.progress.completed_sessions} /{" "}
                  {student.progress.total_sessions} completed
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Projects</h4>
                <p className="text-sm text-muted-foreground">
                  {student.progress.completed_projects} /{" "}
                  {student.progress.total_projects} completed
                </p>
              </div>
            </div>
            {student.last_session && (
              <div>
                <h4 className="text-sm font-medium mb-1">Last Session</h4>
                <p className="text-sm text-muted-foreground">
                  {student.last_session}
                </p>
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" size="sm">
                View Profile
              </Button>
              <Button variant="outline" size="sm">
                Schedule Session
              </Button>
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

  const activeStudents = students.filter(
    (student) => student.status === "ACTIVE"
  );
  const inactiveStudents = students.filter(
    (student) => student.status === "INACTIVE"
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Students</h2>
        <p className="text-muted-foreground mt-1.5">
          Manage your students and track their progress
        </p>
      </div>

      <Tabs defaultValue="active" className="space-y-8">
        <TabsList className="w-full md:w-auto">
          <TabsTrigger value="active" className="flex-1 md:flex-none">
            Active ({activeStudents.length})
          </TabsTrigger>
          <TabsTrigger value="inactive" className="flex-1 md:flex-none">
            Inactive ({inactiveStudents.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6">
          {activeStudents.length > 0 ? (
            activeStudents.map((student) => (
              <Card key={student.id} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={student.avatar_url} />
                      <AvatarFallback className="text-lg">
                        {student.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-xl">{student.name}</CardTitle>
                      <CardDescription className="mt-1.5">
                        {student.email}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={
                        student.status === "ACTIVE" ? "default" : "secondary"
                      }
                      className="w-fit"
                    >
                      {student.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-medium mb-3">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {student.skills.map((skill, index) => (
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Sessions</h4>
                        <p className="text-sm text-muted-foreground">
                          {student.progress.completed_sessions} /{" "}
                          {student.progress.total_sessions} completed
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-2">Projects</h4>
                        <p className="text-sm text-muted-foreground">
                          {student.progress.completed_projects} /{" "}
                          {student.progress.total_projects} completed
                        </p>
                      </div>
                    </div>
                    {student.last_session && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">
                          Last Session
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {student.last_session}
                        </p>
                      </div>
                    )}
                    <div className="flex justify-end gap-3">
                      <Button variant="outline" size="sm" className="px-4">
                        View Profile
                      </Button>
                      <Button variant="outline" size="sm" className="px-4">
                        Schedule Session
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <p className="text-muted-foreground text-center">
                  No active students found
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="inactive" className="space-y-6">
          {inactiveStudents.length > 0 ? (
            inactiveStudents.map((student) => (
              <Card key={student.id} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={student.avatar_url} />
                      <AvatarFallback className="text-lg">
                        {student.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-xl">{student.name}</CardTitle>
                      <CardDescription className="mt-1.5">
                        {student.email}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={
                        student.status === "ACTIVE" ? "default" : "secondary"
                      }
                      className="w-fit"
                    >
                      {student.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-medium mb-3">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {student.skills.map((skill, index) => (
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Sessions</h4>
                        <p className="text-sm text-muted-foreground">
                          {student.progress.completed_sessions} /{" "}
                          {student.progress.total_sessions} completed
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-2">Projects</h4>
                        <p className="text-sm text-muted-foreground">
                          {student.progress.completed_projects} /{" "}
                          {student.progress.total_projects} completed
                        </p>
                      </div>
                    </div>
                    {student.last_session && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">
                          Last Session
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {student.last_session}
                        </p>
                      </div>
                    )}
                    <div className="flex justify-end gap-3">
                      <Button variant="outline" size="sm" className="px-4">
                        View Profile
                      </Button>
                      <Button variant="outline" size="sm" className="px-4">
                        Schedule Session
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <p className="text-muted-foreground text-center">
                  No inactive students found
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
