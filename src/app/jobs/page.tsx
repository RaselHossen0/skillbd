"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { 
  MapPin, 
  Banknote, 
  CalendarClock,
  Search,
  Building,
  Filter,
} from "lucide-react";

interface Job {
  id: string;
  title: string;
  description: string;
  requirements?: string;
  location?: string;
  salary_range?: string;
  deadline?: string;
  status: string;
  company_name?: string;
  applications_count?: number;
  created_at: string;
}

export default function JobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentJob, setCurrentJob] = useState<Job | null>(null);
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    try {
      setLoading(true);
      const response = await fetch('/api/jobs');
      
      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }
      
      const data = await response.json();
      setJobs(data.jobs || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast({
        title: "Error",
        description: "Failed to load jobs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const filteredJobs = jobs
    .filter(job => {
      // Filter by status
      if (activeFilter !== "all" && job.status.toLowerCase() !== activeFilter) {
        return false;
      }
      
      // Search term filters
      if (searchTerm && !job.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !job.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !job.company_name?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const handleApply = (job: Job) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please sign in to apply for jobs",
        variant: "destructive",
      });
      return;
    }
    
    if (user.role !== "STUDENT") {
      toast({
        title: "Student Account Required",
        description: "Only students can apply for jobs",
        variant: "destructive",
      });
      return;
    }
    
    setCurrentJob(job);
    setCoverLetter("");
    setShowApplyDialog(true);
  };

  const submitApplication = async () => {
    if (!user?.students || user.students.length === 0) {
      toast({
        title: "Error",
        description: "Student profile not found",
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
        title: "Success",
        description: "Your application has been submitted",
      });
      
      setShowApplyDialog(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit application",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
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
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Find Jobs</h1>
          <p className="text-muted-foreground mt-1">
            Browse and apply for available job opportunities
          </p>
        </div>
        
        <div className="w-full md:w-auto flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              className="pl-9"
              placeholder="Search by title, company, or keywords"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <Tabs value={activeFilter} onValueChange={setActiveFilter}>
        <TabsList className="grid grid-cols-3 w-full md:w-[400px]">
          <TabsTrigger value="all">All Jobs</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="closed">Closed</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeFilter} className="mt-6">
          {filteredJobs.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredJobs.map((job) => (
                <Card key={job.id} className="overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex flex-col space-y-1.5">
                      <CardTitle className="text-xl">{job.title}</CardTitle>
                      <CardDescription className="flex items-center">
                        <Building className="h-4 w-4 mr-1.5 opacity-70" />
                        {job.company_name || "Company Name"}
                      </CardDescription>
                    </div>
                    
                    <Badge
                      variant={job.status === "ACTIVE" ? "default" : "outline"}
                      className="w-fit mt-2"
                    >
                      {job.status}
                    </Badge>
                  </CardHeader>
                  
                  <CardContent className="pb-2">
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {job.description}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-2">
                      {job.location && (
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-muted-foreground mr-1.5" />
                          <span className="text-sm truncate">{job.location}</span>
                        </div>
                      )}
                      
                      {job.salary_range && (
                        <div className="flex items-center">
                          <Banknote className="h-4 w-4 text-muted-foreground mr-1.5" />
                          <span className="text-sm truncate">{job.salary_range}</span>
                        </div>
                      )}
                      
                      {job.deadline && (
                        <div className="flex items-center">
                          <CalendarClock className="h-4 w-4 text-muted-foreground mr-1.5" />
                          <span className="text-sm truncate">
                            {new Date(job.deadline).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="border-t pt-4">
                    <Button 
                      className="w-full" 
                      onClick={() => handleApply(job)}
                      disabled={job.status !== "ACTIVE"}
                    >
                      {job.status === "ACTIVE" ? "Apply Now" : "Closed"}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="bg-muted rounded-lg text-center py-16">
              <h3 className="text-lg font-medium">No jobs found</h3>
              <p className="text-muted-foreground mt-1">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
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