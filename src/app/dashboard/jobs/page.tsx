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
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/providers/AuthProvider";
import { 
  Plus, 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  Banknote, 
  CalendarClock,
  Briefcase,
  Trash,
  PencilLine,
  Search
} from "lucide-react";
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
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Toaster } from "@/components/ui/toaster";

interface Job {
  id: string | number;
  title: string;
  description: string;
  requirements?: string;
  location?: string;
  salary_range?: string;
  company_name?: string;
  applications_count: number;
  deadline?: string;
  status: string;
  created_at: string;
  application?: {
    id: string;
    status: string;
  };
}

export default function JobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [isCreatingJob, setIsCreatingJob] = useState(false);
  const [isEditingJob, setIsEditingJob] = useState(false);
  const [jobToEdit, setJobToEdit] = useState<Job | null>(null);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [jobFormData, setJobFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    location: "",
    salary_range: "",
    deadline: "",
    status: "ACTIVE",
  });
  
  // Student-specific state
  const [searchTerm, setSearchTerm] = useState("");
  const [currentJob, setCurrentJob] = useState<Job | null>(null);
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, [user, activeTab]);

  async function fetchJobs() {
    try {
      setLoading(true);

      if (user?.role === "EMPLOYER" && user.employers && user.employers.length > 0) {
        // Fetch employer-specific jobs
        const employerId = user.employers[0].id;
        let url = `/api/dashboard/employers/jobs?employerId=${employerId}`;
        
        // Filter by status if not "all"
        if (activeTab !== "all") {
          url += `&status=${activeTab.toUpperCase()}`;
        }
        
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch jobs");
        const data = await response.json();
        setJobs(data.jobs || []);
      } else {
        // Fetch all jobs for students
        let url = '/api/jobs';
        
        // Filter by status if not "all"
        if (activeTab !== "all") {
          url += `?status=${activeTab.toUpperCase()}`;
        }
        
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch jobs");
        const data = await response.json();
        setJobs(data.jobs || []);
        
        // For students, fetch their application status for each job
        if (user?.role === "STUDENT" && user.students && user.students.length > 0) {
          const studentId = user.students[0].id;
          const applicationsResponse = await fetch(`/api/jobs/applications?studentId=${studentId}`);
          
          if (applicationsResponse.ok) {
            const applicationsData = await applicationsResponse.json();
            const applications = applicationsData.applications || [];
            
            // Create a map of job_id to application status
            const applicationMap = new Map();
            applications.forEach((app: any) => {
              applicationMap.set(app.job.id, { id: app.id, status: app.status });
            });
            
            // Update jobs with application status
            setJobs(prevJobs => 
              prevJobs.map(job => ({
                ...job,
                application: applicationMap.get(job.id) || undefined
              }))
            );
          }
        }
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  }

  // Employer functions
  const handleCreateJob = async () => {
    try {
      if (!user?.employers || user.employers.length === 0) {
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
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create job");
      }

      // Refresh jobs list
      await fetchJobs();

      // Reset form and close dialog
      resetJobForm();
      setIsCreatingJob(false);
    } catch (error) {
      console.error("Error creating job:", error);
    }
  };

  const handleEditJob = async () => {
    try {
      if (!jobToEdit?.id) {
        throw new Error("No job selected for editing");
      }

      const response = await fetch(`/api/dashboard/employers/jobs/${jobToEdit.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jobFormData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update job");
      }

      // Refresh jobs list
      await fetchJobs();

      // Reset form and close dialog
      resetJobForm();
      setIsEditingJob(false);
      setJobToEdit(null);
    } catch (error) {
      console.error("Error updating job:", error);
    }
  };

  const handleDeleteJob = async () => {
    try {
      if (!jobToDelete) {
        throw new Error("No job selected for deletion");
      }

      const response = await fetch(`/api/dashboard/employers/jobs/${jobToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete job");
      }

      // Refresh jobs list
      await fetchJobs();

      // Reset state
      setJobToDelete(null);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error("Error deleting job:", error);
    }
  };

  const resetJobForm = () => {
    setJobFormData({
      title: "",
      description: "",
      requirements: "",
      location: "",
      salary_range: "",
      deadline: "",
      status: "ACTIVE",
    });
  };

  const openEditDialog = (job: Job) => {
    setJobToEdit(job);
    setJobFormData({
      title: job.title || "",
      description: job.description || "",
      requirements: job.requirements || "",
      location: job.location || "",
      salary_range: job.salary_range || "",
      deadline: job.deadline ? job.deadline.split('T')[0] : "",
      status: job.status || "ACTIVE",
    });
    setIsEditingJob(true);
  };

  // Student functions
  const handleApply = (job: Job) => {
    if (!user) {
      console.error("You must be logged in to apply");
      return;
    }
    
    if (user.role !== "STUDENT") {
      console.error("Only students can apply for jobs");
      return;
    }
    
    setCurrentJob(job);
    setCoverLetter("");
    setShowApplyDialog(true);
  };

  const submitApplication = async () => {
    if (!user?.students || user.students.length === 0) {
      toast({
        title: "Profile Error",
        description: "Student profile not found. Please complete your profile first.",
        variant: "destructive",
      });
      return;
    }
    
    if (!currentJob) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      const response = await fetch('/api/jobs/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          job_id: currentJob.id,
          student_id: user.students[0].id,
          cover_letter: coverLetter,
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to submit application");
      }
      
      toast({
        title: "Application Submitted",
        description: "Your application has been submitted successfully.",
      });
      
      // Update the job status in the UI
      setJobs(prevJobs => 
        prevJobs.map(job => 
          job.id === currentJob.id 
            ? { 
                ...job, 
                application: { 
                  id: data.application.id, 
                  status: data.application.status 
                } 
              } 
            : job
        )
      );
      
      setShowApplyDialog(false);
    } catch (error: any) {
      console.error("Error submitting application:", error.message);
      
      // Handle specific error cases
      if (error.message.includes("already applied")) {
        toast({
          title: "Already Applied",
          description: "You have already applied for this job.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to submit application. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const filteredJobs = jobs
    .filter(job => {
      // Filter by status if role is student
      if (user?.role === "STUDENT" && activeTab !== "all" && job.status.toLowerCase() !== activeTab) {
        return false;
      }
      
      // Search term filters for students
      if (user?.role === "STUDENT" && searchTerm && 
          !job.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !job.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !job.company_name?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Function to render the job action button based on application status
  const renderJobActionButton = (job: Job) => {
    // If job is closed, show "Closed" button
    if (job.status !== "ACTIVE") {
      return (
        <Button className="w-full" disabled>
          Closed
        </Button>
      );
    }
    
    // If user has already applied, show application status
    if (job.application) {
      const statusColors: Record<string, string> = {
        'PENDING': 'bg-secondary hover:bg-secondary/90',
        'REVIEWED': 'bg-blue-500 hover:bg-blue-600',
        'SHORTLISTED': 'bg-green-500 hover:bg-green-600',
        'HIRED': 'bg-green-600 hover:bg-green-700',
        'REJECTED': 'bg-destructive hover:bg-destructive/90'
      };
      
      return (
        <Button 
          className={`w-full ${statusColors[job.application.status] || ''}`}
          asChild
        >
          <Link href="/dashboard/applications">
            {job.application.status} - View
          </Link>
        </Button>
      );
    }
    
    // Otherwise, show "Apply Now" button
    return (
      <Button 
        className="w-full" 
        onClick={() => handleApply(job)}
      >
        Apply Now
      </Button>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // For employers, show job management UI
  if (user?.role === "EMPLOYER") {
    return (
      <div className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Job Management</h2>
            <p className="text-muted-foreground mt-1.5">
              Create and manage your job postings
            </p>
          </div>
          <Button onClick={() => setIsCreatingJob(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Job
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Jobs</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="closed">Closed</TabsTrigger>
            <TabsTrigger value="draft">Drafts</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {jobs.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {jobs.map((job) => (
                  <Card key={job.id} className="flex flex-col">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{job.title}</CardTitle>
                          <CardDescription className="mt-1">
                            {job.company_name || (user?.employers && user.employers[0]?.company_name)}
                          </CardDescription>
                        </div>
                        <Badge
                          variant={job.status === "ACTIVE" ? "default" : "outline"}
                        >
                          {job.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3 text-sm">
                      <p className="line-clamp-3 text-muted-foreground">
                        {job.description}
                      </p>
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        {job.location && (
                          <div className="flex items-center">
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground mr-1" />
                            <span className="text-xs truncate">{job.location}</span>
                          </div>
                        )}
                        {job.salary_range && (
                          <div className="flex items-center">
                            <Banknote className="h-3.5 w-3.5 text-muted-foreground mr-1" />
                            <span className="text-xs truncate">{job.salary_range}</span>
                          </div>
                        )}
                        {job.deadline && (
                          <div className="flex items-center col-span-2">
                            <CalendarClock className="h-3.5 w-3.5 text-muted-foreground mr-1" />
                            <span className="text-xs">
                              Deadline: {format(new Date(job.deadline), "MMM d, yyyy")}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center col-span-2">
                          <Users className="h-3.5 w-3.5 text-muted-foreground mr-1" />
                          <span className="text-xs">
                            {job.applications_count || 0} applications
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between items-center border-t mt-auto pt-3">
                      <Link href={`/dashboard/applications?jobId=${job.id}`}>
                        <Button variant="outline" size="sm">
                          View Applications
                        </Button>
                      </Link>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(job)}
                        >
                          <PencilLine className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => {
                            setJobToDelete(job.id as string);
                            setShowDeleteConfirm(true);
                          }}
                        >
                          <Trash className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="bg-muted rounded-lg text-center py-16">
                <Briefcase className="h-10 w-10 mx-auto text-muted-foreground" />
                <h3 className="text-lg font-medium mt-4">No jobs found</h3>
                <p className="text-muted-foreground mt-1 mb-4">
                  Start by creating your first job posting
                </p>
                <Button onClick={() => setIsCreatingJob(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Job
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Create/Edit Job Dialog */}
        <Dialog
          open={isCreatingJob || isEditingJob}
          onOpenChange={(open) => {
            if (!open) {
              setIsCreatingJob(false);
              setIsEditingJob(false);
              resetJobForm();
            }
          }}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {isEditingJob ? "Edit Job Posting" : "Create Job Posting"}
              </DialogTitle>
              <DialogDescription>
                {isEditingJob
                  ? "Make changes to your job posting"
                  : "Create a new job posting for your company"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid gap-3">
                <Label htmlFor="title">Job Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. Frontend Developer"
                  value={jobFormData.title}
                  onChange={(e) =>
                    setJobFormData({ ...jobFormData, title: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="description">Job Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the job responsibilities and requirements"
                  rows={5}
                  value={jobFormData.description}
                  onChange={(e) =>
                    setJobFormData({
                      ...jobFormData,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="requirements">Requirements</Label>
                <Textarea
                  id="requirements"
                  placeholder="List the required skills, experience, and qualifications"
                  rows={3}
                  value={jobFormData.requirements}
                  onChange={(e) =>
                    setJobFormData({
                      ...jobFormData,
                      requirements: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-3">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g. Dhaka, Bangladesh"
                    value={jobFormData.location}
                    onChange={(e) =>
                      setJobFormData({
                        ...jobFormData,
                        location: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="salary">Salary Range</Label>
                  <Input
                    id="salary"
                    placeholder="e.g. $50,000 - $70,000"
                    value={jobFormData.salary_range}
                    onChange={(e) =>
                      setJobFormData({
                        ...jobFormData,
                        salary_range: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-3">
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
                <div className="grid gap-3">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={jobFormData.status}
                    onChange={(e) =>
                      setJobFormData({
                        ...jobFormData,
                        status: e.target.value,
                      })
                    }
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="CLOSED">Closed</option>
                    <option value="DRAFT">Draft</option>
                  </select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreatingJob(false);
                  setIsEditingJob(false);
                  resetJobForm();
                }}
              >
                Cancel
              </Button>
              <Button onClick={isEditingJob ? handleEditJob : handleCreateJob}>
                {isEditingJob ? "Update Job" : "Create Job"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Job Posting</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this
                job posting and remove it from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteJob}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  // For students, show job browsing UI
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Browse Jobs</h2>
          <p className="text-muted-foreground mt-1.5">
            Find and apply for job opportunities
          </p>
        </div>
        <div className="relative w-full md:w-64">
          <Input
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-8"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Jobs</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="closed">Closed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredJobs.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredJobs.map((job) => (
                <Card key={job.id} className="flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{job.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {job.company_name || "Company"}
                        </CardDescription>
                      </div>
                      <Badge
                        variant={job.status === "ACTIVE" ? "default" : "outline"}
                      >
                        {job.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3 text-sm">
                    <p className="line-clamp-3 text-muted-foreground">
                      {job.description}
                    </p>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      {job.location && (
                        <div className="flex items-center">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground mr-1" />
                          <span className="text-xs truncate">{job.location}</span>
                        </div>
                      )}
                      {job.salary_range && (
                        <div className="flex items-center">
                          <Banknote className="h-3.5 w-3.5 text-muted-foreground mr-1" />
                          <span className="text-xs truncate">{job.salary_range}</span>
                        </div>
                      )}
                      {job.deadline && (
                        <div className="flex items-center col-span-2">
                          <CalendarClock className="h-3.5 w-3.5 text-muted-foreground mr-1" />
                          <span className="text-xs">
                            Deadline: {format(new Date(job.deadline), "MMM d, yyyy")}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="border-t mt-auto pt-3">
                    {renderJobActionButton(job)}
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="bg-muted rounded-lg text-center py-16">
              <Briefcase className="h-10 w-10 mx-auto text-muted-foreground" />
              <h3 className="text-lg font-medium mt-4">No jobs found</h3>
              <p className="text-muted-foreground mt-1 mb-4">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Apply Job Dialog */}
      <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Apply for {currentJob?.title}</DialogTitle>
            <DialogDescription>
              Complete your application for {currentJob?.company_name || "this company"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-1">
              <div className="font-medium">Job Details</div>
              <div className="text-sm text-muted-foreground">
                {currentJob?.description}
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="cover-letter">Cover Letter</Label>
              <Textarea
                id="cover-letter"
                placeholder="Explain why you're a good fit for this role..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                className="min-h-[200px]"
              />
              <p className="text-xs text-muted-foreground">
                Tell the employer about your qualifications and why you're interested in this position.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowApplyDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={submitApplication} 
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Application"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Toaster />
    </div>
  );
}
