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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

interface DashboardStats {
  jobs_count: number;
  applications_count: number;
  projects_count: number;
  active_contracts: number;
}

interface Job {
  id: string | number;
  title: string;
  company_name?: string;
  applications_count: number;
  deadline: string;
  status: string;
}

interface Session {
  id: string | number;
  title: string;
  applicant_name?: string;
  date: string;
  time: string;
  status: string;
  meeting_link?: string;
  applicants?: any;
  job?: any;
  applicant?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
}

interface Activity {
  id: number | string;
  title: string;
  date: string;
  type: string;
  status?: string;
  progress?: number;
}

interface JobFormData {
  title: string;
  description: string;
  requirements: string;
  location: string;
  salary_range: string;
  deadline: string;
}

interface EmployerDashboardProps {
  user: User;
}

export default function EmployerDashboard({ user }: EmployerDashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    jobs_count: 0,
    applications_count: 0,
    projects_count: 0,
    active_contracts: 0,
  });
  const [jobs, setJobs] = useState<Job[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreatingJob, setIsCreatingJob] = useState(false);
  const [jobFormData, setJobFormData] = useState<JobFormData>({
    title: "",
    description: "",
    requirements: "",
    location: "",
    salary_range: "",
    deadline: "",
  });

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

        // Fetch employer-specific data
        if (
          user.role === "EMPLOYER" &&
          user.employers &&
          user.employers.length > 0
        ) {
          const employerId = user.employers[0].id;

          // Fetch jobs
          const jobsResponse = await fetch(
            `/api/dashboard/employers/jobs?employerId=${employerId}`
          );
          if (!jobsResponse.ok) throw new Error("Failed to fetch jobs");
          const jobsData = await jobsResponse.json();

          setJobs(jobsData.jobs || []);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  const handleCreateJob = async () => {
    try {
      if (!user.employers || user.employers.length === 0) {
        throw new Error("No employer account found");
      }

      const employerId = user.employers[0].id;
      const response = await fetch("/api/dashboard/employers/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...jobFormData,
          employer_id: employerId,
          status: "ACTIVE",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create job");
      }

      // Refresh jobs list
      const jobsResponse = await fetch(
        `/api/dashboard/employers/jobs?employerId=${employerId}`
      );
      if (!jobsResponse.ok) throw new Error("Failed to fetch jobs");
      const jobsData = await jobsResponse.json();
      setJobs(jobsData.jobs || []);

      // Update stats
      setStats(prev => ({
        ...prev,
        jobs_count: prev.jobs_count + 1
      }));

      // Reset form and close dialog
      setJobFormData({
        title: "",
        description: "",
        requirements: "",
        location: "",
        salary_range: "",
        deadline: "",
      });
      setIsCreatingJob(false);
    } catch (error) {
      console.error("Error creating job:", error);
      // You might want to show an error message to the user here
    }
  };

  // Render a session item
  const renderSession = (session: Session) => {
    const applicantName =
      session.applicant?.name ||
      session.applicants?.users?.name ||
      session.applicant_name ||
      "Applicant";
    const jobTitle = session.job?.title || "Job Interview";

    return (
      <div
        key={session.id}
        className="flex items-center justify-between border p-4 rounded-lg"
      >
        <div>
          <h4 className="font-medium">{session.title || jobTitle}</h4>
          <p className="text-sm text-muted-foreground">with {applicantName}</p>
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Employer Dashboard
          </h2>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user.name}! Here's an overview of your company's
            activities.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">View Analytics</Button>
          <Button>Post New Job</Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
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
            <div className="text-2xl font-bold">{stats.jobs_count}</div>
            <p className="text-xs text-muted-foreground">Active job postings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
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
            <div className="text-2xl font-bold">{stats.applications_count}</div>
            <p className="text-xs text-muted-foreground">
              Total applications received
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Projects
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
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <path d="M2 10h20" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.projects_count}</div>
            <p className="text-xs text-muted-foreground">Ongoing projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Contracts
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
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active_contracts}</div>
            <p className="text-xs text-muted-foreground">Current contracts</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Job Management */}
        <Card className="md:col-span-2 lg:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Job Management</CardTitle>
              <CardDescription>Create and manage job postings</CardDescription>
            </div>
            <Dialog open={isCreatingJob} onOpenChange={setIsCreatingJob}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Job
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Create New Job</DialogTitle>
                  <DialogDescription>
                    Fill in the details to create a new job posting
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Job Title</Label>
                    <Input
                      id="title"
                      value={jobFormData.title}
                      onChange={(e) =>
                        setJobFormData({
                          ...jobFormData,
                          title: e.target.value,
                        })
                      }
                      placeholder="e.g., Senior Frontend Developer"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Job Description</Label>
                    <Textarea
                      id="description"
                      value={jobFormData.description}
                      onChange={(e) =>
                        setJobFormData({
                          ...jobFormData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Describe the role and responsibilities"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="requirements">Requirements</Label>
                    <Textarea
                      id="requirements"
                      value={jobFormData.requirements}
                      onChange={(e) =>
                        setJobFormData({
                          ...jobFormData,
                          requirements: e.target.value,
                        })
                      }
                      placeholder="List the required skills and qualifications"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={jobFormData.location}
                        onChange={(e) =>
                          setJobFormData({
                            ...jobFormData,
                            location: e.target.value,
                          })
                        }
                        placeholder="e.g., Remote, New York"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="salary_range">Salary Range</Label>
                      <Input
                        id="salary_range"
                        value={jobFormData.salary_range}
                        onChange={(e) =>
                          setJobFormData({
                            ...jobFormData,
                            salary_range: e.target.value,
                          })
                        }
                        placeholder="e.g., $80,000 - $120,000"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="deadline">Application Deadline</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={jobFormData.deadline}
                      onChange={(e) =>
                        setJobFormData({
                          ...jobFormData,
                          deadline: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreatingJob(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateJob}>Create Job</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between border p-4 rounded-lg"
                >
                  <div>
                    <h4 className="font-medium">{job.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {job.company_name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">
                        {job.applications_count} Applications
                      </Badge>
                      <Badge variant="outline">Deadline: {job.deadline}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      View Applications
                    </Button>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
              {jobs.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No jobs posted yet. Create your first job posting!
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
              {activities.map((activity) => (
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
                        {activity.type === "JOB_POSTED" && (
                          <Badge className="bg-green-500 hover:bg-green-600">
                            Posted
                          </Badge>
                        )}
                        {activity.type === "APPLICATION_RECEIVED" && (
                          <Badge className="bg-blue-500 hover:bg-blue-600">
                            New Application
                          </Badge>
                        )}
                        {activity.type === "PROJECT_STARTED" && (
                          <Badge className="bg-purple-500 hover:bg-purple-600">
                            Project
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

      {/* Interview Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Interviews & Meetings</CardTitle>
          <CardDescription>
            Your scheduled appointments with applicants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sessions.map((session) => renderSession(session))}
            <Button variant="outline" className="w-full mt-4">
              View All Sessions
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
