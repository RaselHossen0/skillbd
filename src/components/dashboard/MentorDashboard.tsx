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
import { Plus } from "lucide-react";
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

interface Activity {
  id: number | string;
  title: string;
  date: string;
  type: string;
  status?: string;
  progress?: number;
}

interface MentorDashboardProps {
  user: User;
}

export default function MentorDashboard({ user }: MentorDashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    students_count: 0,
    sessions_count: 0,
    projects_count: 0,
    completed_mentorships: 0,
  });
  const [expertise, setExpertise] = useState<Expertise[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

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

        // Set initial data
        setStats(statsData);
        setActivities(activitiesData.activities || []);
        setSessions(sessionsData.sessions || []);

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

  // Mock data for fallback
  const mockExpertise = [
    {
      id: 1,
      name: "Web Development",
      level: "Expert",
      students_count: 5,
    },
    {
      id: 2,
      name: "Data Science",
      level: "Advanced",
      students_count: 3,
    },
  ];

  const mockSessions = [
    {
      id: 1,
      title: "Web Development Session",
      student_name: "John Doe",
      date: "Tomorrow",
      time: "10:00 AM",
      status: "SCHEDULED",
      meeting_link: "https://zoom.us/j/123456789",
    },
    {
      id: 2,
      title: "Data Science Workshop",
      student_name: "Jane Smith",
      date: "Thursday",
      time: "2:00 PM",
      status: "SCHEDULED",
      meeting_link: "https://zoom.us/j/987654321",
    },
  ];

  const mockActivities = [
    {
      id: 1,
      type: "SESSION_COMPLETED",
      title: "Completed Web Development Session",
      date: "2 days ago",
      status: "COMPLETED",
    },
    {
      id: 2,
      type: "NEW_STUDENT",
      title: "New student joined your mentorship",
      date: "5 days ago",
      status: "ACTIVE",
    },
    {
      id: 3,
      type: "PROJECT_REVIEW",
      title: "Project Review Completed",
      date: "1 week ago",
      progress: 100,
    },
  ];

  // Use real data if available, otherwise fall back to mock data
  const displayExpertise = expertise.length > 0 ? expertise : mockExpertise;
  const displayActivities = activities.length > 0 ? activities : mockActivities;
  const displaySessions = sessions.length > 0 ? sessions : mockSessions;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-gradient-to-r from-background via-background to-background/80 p-6 rounded-lg border shadow-sm">
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
              <CardTitle>Expertise Areas</CardTitle>
              <CardDescription>
                Your areas of expertise and student count
              </CardDescription>
            </div>
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add Expertise
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {displayExpertise.map((area) => (
                <div
                  key={area.id}
                  className="flex items-center justify-between border p-4 rounded-lg"
                >
                  <div>
                    <h4 className="font-medium">{area.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{area.level}</Badge>
                      <Badge variant="outline">
                        {area.students_count} Students
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      View Students
                    </Button>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
              {displayExpertise.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No expertise areas added yet. Add your first expertise area!
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
            <Button variant="outline" className="w-full mt-4">
              View All Sessions
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
