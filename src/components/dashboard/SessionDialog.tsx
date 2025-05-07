"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { User } from "@/types";

// Define the form schema based on session fields
const sessionFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  date: z.string().min(1, { message: "Date is required" }),
  time: z.string().min(1, { message: "Time is required" }),
  status: z.string().default("PENDING"),
  description: z.string().optional(),
  zoom_link: z.string().optional(),
  meeting_link: z.string().optional(),
  mentor_id: z.string().optional(),
  student_id: z.string().optional(),
  employer_id: z.string().optional(),
  applicant_id: z.string().optional(),
  job_id: z.string().optional(),
});

type SessionFormValues = z.infer<typeof sessionFormSchema>;

interface SessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session?: any; // For editing existing session
  userRole: string;
  currentUser: User;
  onSave: (data: any) => Promise<void>;
  otherUsers?: any[]; // Users to select from (mentors/students/applicants)
  jobs?: any[]; // Only for employer role
}

export default function SessionDialog({
  open,
  onOpenChange,
  session,
  userRole,
  currentUser,
  onSave,
  otherUsers = [],
  jobs = [],
}: SessionDialogProps) {
  const [isSaving, setIsSaving] = useState(false);
  const isEditing = !!session;

  // Set up the form with default values
  const form = useForm<SessionFormValues>({
    resolver: zodResolver(sessionFormSchema),
    defaultValues: {
      title: session?.title || "",
      date: session?.date || new Date().toISOString().split("T")[0],
      time: session?.time || "10:00",
      status: session?.status || "PENDING",
      description: session?.description || "",
      zoom_link: session?.zoom_link || "",
      meeting_link: session?.meeting_link || "",
      mentor_id: session?.mentor_id || "",
      student_id: session?.student_id || "",
      employer_id: session?.employer_id || "",
      applicant_id: session?.applicant_id || "",
      job_id: session?.job_id || "",
    },
  });

  // Update form values when session changes
  useEffect(() => {
    if (session) {
      form.reset({
        title: session.title || "",
        date: session.date || new Date().toISOString().split("T")[0],
        time: session.time || "10:00",
        status: session.status || "PENDING",
        description: session.description || "",
        zoom_link: session.zoom_link || "",
        meeting_link: session.meeting_link || "",
        mentor_id: session.mentor_id || "",
        student_id: session.student_id || "",
        employer_id: session.employer_id || "",
        applicant_id: session.applicant_id || "",
        job_id: session.job_id || "",
      });
    }
  }, [session, form]);

  // Handle form submission
  async function onSubmit(values: SessionFormValues) {
    try {
      setIsSaving(true);

      // Prepare submission data based on user role
      const submissionData = { ...values };

      // Set the appropriate user IDs based on role
      if (userRole === "STUDENT") {
        submissionData.student_id = currentUser.id;
      } else if (userRole === "MENTOR") {
        submissionData.mentor_id = currentUser.id;
      } else if (userRole === "EMPLOYER") {
        submissionData.employer_id = currentUser.id;
      }

      // Call the onSave callback
      await onSave(submissionData);

      // Close dialog and show success message
      onOpenChange(false);
      toast({
        title: isEditing ? "Session updated" : "Session created",
        description: isEditing 
          ? "Your session has been updated successfully." 
          : "Your session has been scheduled successfully.",
      });
    } catch (error) {
      console.error("Failed to save session:", error);
      toast({
        title: "Failed to save",
        description: "There was a problem saving your session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Session" : "Schedule New Session"}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Make changes to your existing session here." 
              : "Fill in the details to schedule a new session."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Session Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Session Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter session title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter session details and objectives"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Other User Selection - Mentors for Students, Students for Mentors, etc. */}
            {userRole === "STUDENT" && (
              <FormField
                control={form.control}
                name="mentor_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Mentor</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a mentor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {otherUsers.map((mentor) => (
                          <SelectItem key={mentor.id} value={mentor.id}>
                            {mentor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {userRole === "MENTOR" && (
              <FormField
                control={form.control}
                name="student_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Student</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a student" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {otherUsers.map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {userRole === "EMPLOYER" && (
              <>
                <FormField
                  control={form.control}
                  name="applicant_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Applicant</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an applicant" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {otherUsers.map((applicant) => (
                            <SelectItem key={applicant.id} value={applicant.id}>
                              {applicant.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="job_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Related Job (Optional)</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a job" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {jobs.map((job) => (
                            <SelectItem key={job.id} value={job.id}>
                              {job.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {/* Meeting Link - Different field names based on role */}
            {(userRole === "STUDENT" || userRole === "MENTOR") && (
              <FormField
                control={form.control}
                name="zoom_link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zoom Meeting Link (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://zoom.us/j/example"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {userRole === "EMPLOYER" && (
              <FormField
                control={form.control}
                name="meeting_link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meeting Link (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://meet.google.com/example"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : isEditing ? "Update Session" : "Create Session"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 