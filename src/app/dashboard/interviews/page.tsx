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

interface Session {
  id: string | number;
  title: string;
  applicant_name?: string;
  date: string;
  time: string;
  status: string;
  meeting_link?: string;
  job?: {
    title: string;
    company_name?: string;
  };
}

// Mock interview sessions data
const mockSessions: Session[] = [
  {
    id: 1,
    title: "Technical Interview",
    applicant_name: "Sarah Johnson",
    date: "2024-03-20",
    time: "10:00 AM",
    status: "SCHEDULED",
    meeting_link: "https://zoom.us/j/123456789",
    job: {
      title: "Frontend Developer",
      company_name: "TechVision Ltd",
    },
  },
  {
    id: 2,
    title: "System Design Interview",
    applicant_name: "Michael Chen",
    date: "2024-03-22",
    time: "2:30 PM",
    status: "SCHEDULED",
    meeting_link: "https://zoom.us/j/987654321",
    job: {
      title: "Senior Software Engineer",
      company_name: "Digital Solutions Inc",
    },
  },
  {
    id: 3,
    title: "Behavioral Interview",
    applicant_name: "Emily Davis",
    date: "2024-03-15",
    time: "11:00 AM",
    status: "COMPLETED",
    meeting_link: "https://zoom.us/j/456789123",
    job: {
      title: "Product Manager",
      company_name: "Creative Studios",
    },
  },
  {
    id: 4,
    title: "Technical Assessment",
    applicant_name: "David Wilson",
    date: "2024-03-18",
    time: "3:00 PM",
    status: "COMPLETED",
    meeting_link: "https://zoom.us/j/789123456",
    job: {
      title: "Backend Developer",
      company_name: "TechVision Ltd",
    },
  },
];

export default function InterviewsPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSessions() {
      try {
        if (
          user?.role === "EMPLOYER" &&
          user.employers &&
          user.employers.length > 0
        ) {
          // Use mock data instead of fetching
          setSessions(mockSessions);
        }
      } catch (error) {
        console.error("Error fetching sessions:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSessions();
  }, [user]);

  const renderSession = (session: Session) => {
    return (
      <Card key={session.id}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{session.title}</CardTitle>
              <CardDescription>
                {session.job?.title} - {session.job?.company_name}
              </CardDescription>
            </div>
            <Badge
              variant={
                session.status === "SCHEDULED"
                  ? "default"
                  : session.status === "COMPLETED"
                  ? "secondary"
                  : "destructive"
              }
            >
              {session.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">
                with {session.applicant_name}
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{session.date}</Badge>
                <Badge variant="outline">{session.time}</Badge>
              </div>
            </div>
            {session.meeting_link && (
              <Button variant="outline" size="sm" asChild>
                <a
                  href={session.meeting_link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Join Meeting
                </a>
              </Button>
            )}
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

  const upcomingSessions = sessions.filter(
    (session) => session.status === "SCHEDULED"
  );
  const completedSessions = sessions.filter(
    (session) => session.status === "COMPLETED"
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Interviews</h2>
        <p className="text-muted-foreground mt-1.5">
          Manage your scheduled interviews and meetings
        </p>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-8">
        <TabsList className="w-full md:w-auto">
          <TabsTrigger value="upcoming" className="flex-1 md:flex-none">
            Upcoming ({upcomingSessions.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex-1 md:flex-none">
            Completed ({completedSessions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-6">
          {upcomingSessions.length > 0 ? (
            upcomingSessions.map((session) => (
              <Card key={session.id} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl">{session.title}</CardTitle>
                      <CardDescription className="mt-1.5">
                        {session.job?.title} - {session.job?.company_name}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={
                        session.status === "SCHEDULED"
                          ? "default"
                          : session.status === "COMPLETED"
                          ? "secondary"
                          : "destructive"
                      }
                      className="w-fit"
                    >
                      {session.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">
                        with {session.applicant_name}
                      </p>
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge variant="outline" className="px-3 py-1">
                          {session.date}
                        </Badge>
                        <Badge variant="outline" className="px-3 py-1">
                          {session.time}
                        </Badge>
                      </div>
                    </div>
                    {session.meeting_link && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="px-4"
                        asChild
                      >
                        <a
                          href={session.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Join Meeting
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <p className="text-muted-foreground text-center">
                  No upcoming interviews scheduled
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-6">
          {completedSessions.length > 0 ? (
            completedSessions.map((session) => (
              <Card key={session.id} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl">{session.title}</CardTitle>
                      <CardDescription className="mt-1.5">
                        {session.job?.title} - {session.job?.company_name}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={
                        session.status === "SCHEDULED"
                          ? "default"
                          : session.status === "COMPLETED"
                          ? "secondary"
                          : "destructive"
                      }
                      className="w-fit"
                    >
                      {session.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">
                        with {session.applicant_name}
                      </p>
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge variant="outline" className="px-3 py-1">
                          {session.date}
                        </Badge>
                        <Badge variant="outline" className="px-3 py-1">
                          {session.time}
                        </Badge>
                      </div>
                    </div>
                    {session.meeting_link && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="px-4"
                        asChild
                      >
                        <a
                          href={session.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Recording
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <p className="text-muted-foreground text-center">
                  No completed interviews yet
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
