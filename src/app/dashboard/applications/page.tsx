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
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { 
  Building,
  CalendarClock,
  Clock,
  FileEdit,
  Trash,
  Eye,
} from "lucide-react";
import Link from "next/link";

interface Application {
  id: string;
  status: string;
  cover_letter: string;
  created_at: string;
  job: {
    id: string;
    title: string;
    description: string;
    company_name?: string;
    deadline?: string;
    status?: string;
  };
}

export default function ApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [currentApplication, setCurrentApplication] = useState<Application | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [editCoverLetter, setEditCoverLetter] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.students && user.students.length > 0) {
      fetchApplications();
    } else {
      setLoading(false);
    }
  }, [user, activeTab]);

  async function fetchApplications() {
    try {
      setLoading(true);
      
      if (!user?.students || user.students.length === 0) {
        throw new Error("Student profile not found");
      }
      
      const studentId = user.students[0].id;
      let url = `/api/jobs/applications?studentId=${studentId}`;
      
      if (activeTab !== "all") {
        url += `&status=${activeTab.toUpperCase()}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error("Failed to fetch applications");
      }
      
      const data = await response.json();
      setApplications(data.applications || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast({
        title: "Error",
        description: "Failed to load your applications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const handleViewApplication = (application: Application) => {
    setCurrentApplication(application);
    setShowViewDialog(true);
  };

  const handleEditApplication = (application: Application) => {
    setCurrentApplication(application);
    setEditCoverLetter(application.cover_letter || "");
    setShowEditDialog(true);
  };

  const handleWithdrawApplication = (application: Application) => {
    setCurrentApplication(application);
    setShowWithdrawDialog(true);
  };

  const submitEditApplication = async () => {
    if (!currentApplication) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/jobs/applications/${currentApplication.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cover_letter: editCoverLetter,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to update application");
      }
      
      // Update local state with updated application
      setApplications(prev => 
        prev.map(app => 
          app.id === currentApplication.id 
            ? { ...app, cover_letter: editCoverLetter } 
            : app
        )
      );
      
      toast({
        title: "Success",
        description: "Your application has been updated",
      });
      
      setShowEditDialog(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update application",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmWithdrawApplication = async () => {
    if (!currentApplication) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/jobs/applications/${currentApplication.id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to withdraw application");
      }
      
      // Remove application from local state
      setApplications(prev => 
        prev.filter(app => app.id !== currentApplication.id)
      );
      
      toast({
        title: "Success",
        description: "Your application has been withdrawn",
      });
      
      setShowWithdrawDialog(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to withdraw application",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "PENDING":
        return "secondary";
      case "REVIEWED":
        return "default";
      case "SHORTLISTED":
        return "default";
      case "HIRED":
        return "default";
      case "REJECTED":
        return "destructive";
      default:
        return "outline";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user?.students || user.students.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Student Profile Required</CardTitle>
            <CardDescription>
              You need a student profile to view job applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Please complete your student profile to access job applications.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Job Applications</h1>
        <p className="text-muted-foreground mt-1">
          Track and manage your job applications
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="reviewed">Reviewed</TabsTrigger>
          <TabsTrigger value="shortlisted">Shortlisted</TabsTrigger>
          <TabsTrigger value="hired">Hired</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-6">
          {applications.length > 0 ? (
            <div className="space-y-4">
              {applications.map((application) => (
                <Card key={application.id} className="overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <CardTitle>{application.job.title}</CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <Building className="h-4 w-4 mr-1.5 opacity-70" />
                          {application.job.company_name || "Company"}
                        </CardDescription>
                      </div>
                      <Badge
                        variant={getStatusBadgeVariant(application.status)}
                        className="w-fit"
                      >
                        {application.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pb-2">
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1.5" />
                        Applied on {new Date(application.created_at).toLocaleDateString()}
                      </div>
                      
                      {application.job.deadline && (
                        <div className="flex items-center">
                          <CalendarClock className="h-4 w-4 mr-1.5" />
                          Deadline: {new Date(application.job.deadline).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="border-t pt-4 flex flex-wrap gap-3 justify-end">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1 md:flex-none"
                      onClick={() => handleViewApplication(application)}
                    >
                      <Eye className="h-3.5 w-3.5 mr-1.5" />
                      View Details
                    </Button>
                    
                    {application.status === "PENDING" && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex-1 md:flex-none"
                          onClick={() => handleEditApplication(application)}
                        >
                          <FileEdit className="h-3.5 w-3.5 mr-1.5" />
                          Edit
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex-1 md:flex-none text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleWithdrawApplication(application)}
                        >
                          <Trash className="h-3.5 w-3.5 mr-1.5" />
                          Withdraw
                        </Button>
                      </>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <p className="text-muted-foreground mb-4 text-center">
                  No applications found. Browse jobs and submit applications!
                </p>
                <Button asChild>
                  <Link href="/jobs">Browse Jobs</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      
      {/* View Application Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              Your application for {currentApplication?.job.title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-1">
              <div className="font-medium">Job</div>
              <div className="text-sm">
                {currentApplication?.job.title} at {currentApplication?.job.company_name}
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="font-medium">Status</div>
              <Badge variant={getStatusBadgeVariant(currentApplication?.status || "PENDING")}>
                {currentApplication?.status}
              </Badge>
            </div>
            
            <div className="space-y-1">
              <div className="font-medium">Applied On</div>
              <div className="text-sm">
                {currentApplication?.created_at ? 
                  new Date(currentApplication.created_at).toLocaleDateString() : ""}
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="font-medium">Cover Letter</div>
              <div className="text-sm p-4 bg-muted rounded-md whitespace-pre-wrap">
                {currentApplication?.cover_letter || "No cover letter provided"}
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="font-medium">Job Description</div>
              <div className="text-sm">
                {currentApplication?.job.description}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setShowViewDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Application Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Application</DialogTitle>
            <DialogDescription>
              Update your application for {currentApplication?.job.title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <div className="font-medium">Cover Letter</div>
              <Textarea
                value={editCoverLetter}
                onChange={(e) => setEditCoverLetter(e.target.value)}
                placeholder="Explain why you're a good fit for this role..."
                className="min-h-[200px]"
              />
              <p className="text-xs text-muted-foreground">
                Update your cover letter to improve your application
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowEditDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={submitEditApplication}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update Application"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Withdraw Application Confirmation */}
      <AlertDialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Withdraw Application</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to withdraw your application for{" "}
              <strong>{currentApplication?.job.title}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmWithdrawApplication}
              className="bg-red-500 hover:bg-red-600 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Withdrawing..." : "Withdraw Application"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <Toaster />
    </div>
  );
} 