"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/providers/AuthProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Application {
  id: string | number;
  student: {
    id: string | number;
    name: string;
    email: string;
    avatar_url?: string;
    resume_url?: string;
  };
  job: {
    id: string | number;
    title: string;
  };
  status: string;
  applied_at: string;
}

export default function ApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchApplications() {
      try {
        if (
          user?.role === "EMPLOYER" &&
          user.employers &&
          user.employers.length > 0
        ) {
          const employerId = user.employers[0].id;
          const response = await fetch(
            `/api/dashboard/applications?employerId=${employerId}`
          );
          if (!response.ok) throw new Error("Failed to fetch applications");
          const data = await response.json();
          setApplications(data.applications || []);
        }
      } catch (error) {
        console.error("Error fetching applications:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchApplications();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Applications</h2>
        <p className="text-muted-foreground mt-1.5">
          Review applications from students for your job postings
        </p>
      </div>
      <div className="grid gap-6">
        {applications.length > 0 ? (
          applications.map((app) => (
            <Card key={app.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={app.student.avatar_url} />
                      <AvatarFallback>
                        {app.student.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">
                        {app.student.name}
                      </CardTitle>
                      <CardDescription>{app.student.email}</CardDescription>
                    </div>
                  </div>
                  <Badge
                    variant={
                      app.status === "PENDING"
                        ? "secondary"
                        : app.status === "ACCEPTED"
                        ? "default"
                        : "destructive"
                    }
                    className="w-fit"
                  >
                    {app.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Applied for:{" "}
                      <span className="font-medium">{app.job.title}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Applied on:{" "}
                      {new Date(app.applied_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    {app.student.resume_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={app.student.resume_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Resume
                        </a>
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    <Button variant="default" size="sm">
                      Accept
                    </Button>
                    <Button variant="destructive" size="sm">
                      Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <p className="text-muted-foreground text-center mb-6">
                No applications received yet.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
