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
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/providers/AuthProvider";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Job {
  id: string | number;
  title: string;
  company_name?: string;
  applications_count: number;
  deadline: string;
  status: string;
}

export default function JobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreatingJob, setIsCreatingJob] = useState(false);
  const [jobFormData, setJobFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    location: "",
    salary_range: "",
    deadline: "",
  });

  useEffect(() => {
    async function fetchJobs() {
      try {
        if (
          user?.role === "EMPLOYER" &&
          user.employers &&
          user.employers.length > 0
        ) {
          const employerId = user.employers[0].id;
          const response = await fetch(
            `/api/dashboard/employers/jobs?employerId=${employerId}`
          );
          if (!response.ok) throw new Error("Failed to fetch jobs");
          const data = await response.json();
          setJobs(data.jobs || []);
        }
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchJobs();
  }, [user]);

  const handleCreateJob = async () => {
    try {
      if (!user?.employers || user.employers.length === 0) {
        throw new Error("No employer account found");
      }

      const employerId = user.employers[0].id;
      const response = await fetch("/api/jobs", {
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
        throw new Error("Failed to create job");
      }

      // Refresh jobs list
      const jobsResponse = await fetch(
        `/api/dashboard/employers/jobs?employerId=${employerId}`
      );
      if (!jobsResponse.ok) throw new Error("Failed to fetch jobs");
      const jobsData = await jobsResponse.json();
      setJobs(jobsData.jobs || []);

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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Job Management</h2>
          <p className="text-muted-foreground mt-1.5">
            Create and manage your job postings
          </p>
        </div>
        <Dialog open={isCreatingJob} onOpenChange={setIsCreatingJob}>
          <DialogTrigger asChild>
            <Button className="w-full md:w-auto">
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
            <div className="grid gap-6 py-4">
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
                  className="min-h-[120px]"
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
                  className="min-h-[120px]"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setIsCreatingJob(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateJob}>Create Job</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {jobs.map((job) => (
          <Card key={job.id} className="overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="text-xl">{job.title}</CardTitle>
                  <CardDescription className="mt-1.5">
                    {job.company_name}
                  </CardDescription>
                </div>
                <Badge
                  variant={
                    job.status === "ACTIVE"
                      ? "default"
                      : job.status === "DRAFT"
                      ? "secondary"
                      : "destructive"
                  }
                  className="w-fit"
                >
                  {job.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="outline" className="px-3 py-1">
                    {job.applications_count} Applications
                  </Badge>
                  <Badge variant="outline" className="px-3 py-1">
                    Deadline: {job.deadline}
                  </Badge>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm" className="px-4">
                    View Applications
                  </Button>
                  <Button variant="outline" size="sm" className="px-4">
                    Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {jobs.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <p className="text-muted-foreground mb-6 text-center">
                No jobs posted yet. Create your first job posting!
              </p>
              <Button onClick={() => setIsCreatingJob(true)} size="lg">
                <Plus className="mr-2 h-4 w-4" />
                Create Job
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
