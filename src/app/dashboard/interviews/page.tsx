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
          const employerId = user.employers[0].id;
          const response = await fetch(
            `/api/dashboard/sessions?userId=${user.id}&userRole=${user.role}`
          );
          if (!response.ok) throw new Error("Failed to fetch sessions");
          const data = await response.json();
          setSessions(data.sessions || []);
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
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Interviews</h2>
        <p className="text-muted-foreground">
          Manage your scheduled interviews and meetings
        </p>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList>
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingSessions.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedSessions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingSessions.length > 0 ? (
            upcomingSessions.map((session) => renderSession(session))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground">
                  No upcoming interviews scheduled
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedSessions.length > 0 ? (
            completedSessions.map((session) => renderSession(session))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground">
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
