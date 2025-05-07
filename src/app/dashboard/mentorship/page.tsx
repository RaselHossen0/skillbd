"use client";

import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/components/providers/AuthProvider";
import { createSession, fetchAvailableMentors } from "@/lib/session-service";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

interface Mentor {
  id: string;
  name?: string;
  position?: string;
  company?: string;
  expertise?: string[];
  experience?: number;
  bio?: string;
  hourlyRate?: number;
  rating?: number;
  totalSessions?: number;
  avatar_url?: string;
  availability?: { day: string; slots: string[] }[];
}

interface Session {
  id: string;
  title: string;
  date: string;
  time: string;
  status: string;
  zoom_link?: string;
  description?: string;
  mentor?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  rating?: number;
  feedback?: string;
}

interface SessionsState {
  upcoming: Session[];
  past: Session[];
}

export default function MentorshipPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [sessions, setSessions] = useState<SessionsState>({
    upcoming: [],
    past: [],
  });
  const [loading, setLoading] = useState(true);
  const [sessionTopic, setSessionTopic] = useState("");
  const [sessionDescription, setSessionDescription] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  // Fetch mentors and sessions data
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch available mentors
        const mentorsData = await fetchAvailableMentors();
        setMentors(mentorsData);

        // Fetch sessions if user is logged in
        if (user && user.id) {
          const sessionsResponse = await fetch(
            `/api/dashboard/sessions?userId=${user.id}&userRole=${user.role}`
          );
          if (!sessionsResponse.ok) throw new Error("Failed to fetch sessions");
          const sessionsData = await sessionsResponse.json();

          // Separate upcoming and past sessions
          const now = new Date();
          const upcomingSessions: Session[] = [];
          const pastSessions: Session[] = [];

          for (const session of sessionsData.sessions || []) {
            const sessionDate = new Date(session.date + "T" + session.time);

            if (
              sessionDate > now ||
              session.status === "PENDING" ||
              session.status === "CONFIRMED"
            ) {
              upcomingSessions.push(session);
            } else {
              pastSessions.push(session);
            }
          }

          setSessions({ upcoming: upcomingSessions, past: pastSessions });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  // Handle session booking
  const handleBookSession = async () => {
    if (
      !user ||
      !selectedMentor ||
      !sessionTopic ||
      !selectedDate ||
      !selectedTime
    ) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields to book a session.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Get student ID from user object
      const studentId = user.students?.[0]?.id;

      if (!studentId) {
        toast({
          title: "Account error",
          description:
            "Could not find your student profile. Please contact support.",
          variant: "destructive",
        });
        return;
      }

      const sessionData = {
        title: sessionTopic,
        description: sessionDescription,
        date: selectedDate,
        time: selectedTime,
        mentor_id: selectedMentor.id,
        student_id: studentId,
        creator_id: user.id,
        status: "PENDING",
        zoom_link: "", // Will be filled by the mentor later
      };

      const newSession = await createSession("STUDENT", sessionData);

      // Add to upcoming sessions
      setSessions((prev) => ({
        ...prev,
        upcoming: [newSession, ...prev.upcoming],
      }));

      toast({
        title: "Session booked",
        description: "Your mentorship session has been scheduled successfully.",
      });

      // Clear form fields
      setSessionTopic("");
      setSessionDescription("");
      setSelectedDate("");
      setSelectedTime("");
    } catch (error) {
      console.error("Error booking session:", error);
      toast({
        title: "Booking failed",
        description:
          "There was a problem booking your session. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Filter mentors based on search query
  const filteredMentors = mentors.filter((mentor) => {
    return (
      mentor.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.position?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.expertise?.some((skill) =>
        skill.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  });

  // Render mentor availability slots or placeholder if not available
  const renderAvailabilitySlots = (mentor: Mentor | null) => {
    if (!mentor || !mentor.availability || mentor.availability.length === 0) {
      return (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            No specific availability information. Please select a date and time
            below.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {mentor.availability.map((avail) => (
          <div key={avail.day} className="space-y-1">
            <p className="text-sm font-medium">{avail.day}</p>
            <div className="flex flex-wrap gap-2">
              {avail.slots.map((slot) => (
                <Badge
                  key={slot}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                  onClick={() => setSelectedTime(slot)}
                >
                  {slot}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Add new joinSession function to handle zoom links
  const joinSession = (zoomLink: string) => {
    if (!zoomLink) {
      toast({
        title: "No meeting link available",
        description:
          "The mentor has not provided a Zoom link for this session yet.",
        variant: "destructive",
      });
      return;
    }
    window.open(zoomLink, "_blank");
  };

  // Add demo/mock sessions
  const demoUpcomingSessions = [
    {
      id: "demo-upcoming-1",
      title: "Career Guidance Session",
      date: "2024-07-10",
      time: "15:00",
      status: "CONFIRMED",
      zoom_link: "https://zoom.us/j/123456789",
      description: "Discussing career growth and opportunities in tech.",
      mentor: {
        id: "mentor-1",
        name: "Sarah Johnson",
        avatar_url: "/placeholder-image.jpg",
      },
      rating: undefined,
      feedback: undefined,
    },
    {
      id: "demo-upcoming-2",
      title: "Project Review",
      date: "2024-07-12",
      time: "11:00",
      status: "PENDING",
      zoom_link: "",
      description: "Reviewing your latest web development project.",
      mentor: {
        id: "mentor-2",
        name: "Ahmed Khan",
        avatar_url: "/placeholder-image.jpg",
      },
      rating: undefined,
      feedback: undefined,
    },
  ];
  const demoPastSessions = [
    {
      id: "demo-past-1",
      title: "Mock Interview",
      date: "2024-06-20",
      time: "10:00",
      status: "COMPLETED",
      zoom_link: "",
      description: "Practice interview for frontend developer role.",
      mentor: {
        id: "mentor-3",
        name: "Tania Rahman",
        avatar_url: "/placeholder-image.jpg",
      },
      rating: 5,
      feedback: "Great communication and technical skills. Keep practicing!",
    },
    {
      id: "demo-past-2",
      title: "Resume Review",
      date: "2024-06-10",
      time: "14:00",
      status: "COMPLETED",
      zoom_link: "",
      description: "Feedback on resume and LinkedIn profile.",
      mentor: {
        id: "mentor-1",
        name: "Sarah Johnson",
        avatar_url: "/placeholder-image.jpg",
      },
      rating: 4,
      feedback: "Resume is strong, but add more project details.",
    },
  ];

  // In the render logic for upcoming and past sessions, merge demo data if arrays are empty
  // For upcoming sessions:
  const upcomingSessionsToShow =
    sessions.upcoming.length > 0 ? sessions.upcoming : demoUpcomingSessions;
  // For past sessions:
  const pastSessionsToShow =
    sessions.past.length > 0 ? sessions.past : demoPastSessions;

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Mentorship Hub</h2>
          <p className="text-muted-foreground">
            Connect with industry professionals for guidance and career advice
          </p>
        </div>
      </div>

      <Tabs defaultValue="find-mentors">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="find-mentors">Find Mentors</TabsTrigger>
          <TabsTrigger value="my-sessions">My Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="find-mentors" className="space-y-6">
          {/* Search Bar */}
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0">
            <div className="flex-1">
              <Input
                placeholder="Search mentors, skills, companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
              <Button variant="outline">Filter by Expertise</Button>
              <Button variant="outline">Sort by: Rating</Button>
            </div>
          </div>

          {/* Mentors Listing */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <div className="col-span-full flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : filteredMentors.length > 0 ? (
              filteredMentors.map((mentor) => (
                <Card key={mentor.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex flex-col items-center text-center">
                      <Avatar className="h-24 w-24 mb-4">
                        <AvatarImage src={mentor.avatar_url} />
                        <AvatarFallback>
                          {mentor.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("") || "M"}
                        </AvatarFallback>
                      </Avatar>
                      <CardTitle>{mentor.name}</CardTitle>
                      <CardDescription className="pt-1">
                        {mentor.position} at {mentor.company}
                      </CardDescription>
                      <div className="flex items-center justify-center mt-1">
                        <span className="text-sm font-medium">
                          ⭐ {mentor.rating || "4.5"}/5
                        </span>
                        <span className="mx-2">•</span>
                        <span className="text-sm text-muted-foreground">
                          {mentor.totalSessions || "25"} sessions
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {mentor.bio ||
                        `Expert in ${
                          mentor.expertise?.join(", ") || "technology"
                        } with professional experience.`}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {mentor.expertise?.map((skill) => (
                        <Badge
                          key={skill}
                          variant="secondary"
                          className="text-xs"
                        >
                          {skill}
                        </Badge>
                      )) || (
                        <Badge variant="secondary" className="text-xs">
                          Technology
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Experience</span>
                      <span className="font-medium">
                        {mentor.experience || "5+"} years
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-muted-foreground">Rate</span>
                      <span className="font-medium">
                        ${mentor.hourlyRate || "30"}/hour
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          className="w-full"
                          onClick={() => setSelectedMentor(mentor)}
                          id="book-session-button"
                        >
                          Book Session
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle>
                            Book a Session with {selectedMentor?.name}
                          </DialogTitle>
                          <DialogDescription>
                            Schedule a one-on-one mentorship session for career
                            guidance, project help, or technical advice.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="space-y-2">
                            <h4 className="font-medium">Mentor Information</h4>
                            <div className="flex items-center gap-3 p-3 border rounded-md bg-muted/20">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={selectedMentor?.avatar_url} />
                                <AvatarFallback>
                                  {selectedMentor?.name
                                    ?.split(" ")
                                    .map((n) => n[0])
                                    .join("") || "M"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">
                                  {selectedMentor?.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {selectedMentor?.position} at{" "}
                                  {selectedMentor?.company}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <h4 className="font-medium">
                              Select Date and Time
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-sm font-medium">
                                  Date <span className="text-red-500">*</span>
                                </label>
                                <Input
                                  type="date"
                                  value={selectedDate}
                                  onChange={(e) =>
                                    setSelectedDate(e.target.value)
                                  }
                                  min={new Date().toISOString().split("T")[0]}
                                  className={
                                    !selectedDate ? "border-red-300" : ""
                                  }
                                />
                                {!selectedDate && (
                                  <p className="text-xs text-red-500">
                                    Date is required
                                  </p>
                                )}
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium">
                                  Time <span className="text-red-500">*</span>
                                </label>
                                <Input
                                  type="time"
                                  value={selectedTime}
                                  onChange={(e) =>
                                    setSelectedTime(e.target.value)
                                  }
                                  className={
                                    !selectedTime ? "border-red-300" : ""
                                  }
                                />
                                {!selectedTime && (
                                  <p className="text-xs text-red-500">
                                    Time is required
                                  </p>
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Please select a date and time that works for you.
                              The mentor will confirm the appointment.
                            </p>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Session Topic{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <Input
                              placeholder="e.g. Career guidance, Project review, etc."
                              value={sessionTopic}
                              onChange={(e) => setSessionTopic(e.target.value)}
                              className={!sessionTopic ? "border-red-300" : ""}
                            />
                            {!sessionTopic && (
                              <p className="text-xs text-red-500">
                                Topic is required
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Questions/Topics to discuss
                            </label>
                            <textarea
                              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              placeholder="Brief description of what you'd like to discuss"
                              value={sessionDescription}
                              onChange={(e) =>
                                setSessionDescription(e.target.value)
                              }
                            />
                          </div>
                          {renderAvailabilitySlots(selectedMentor)}
                        </div>
                        <DialogFooter className="flex-col sm:flex-row gap-2">
                          <div className="text-sm text-muted-foreground mr-auto">
                            Rate: ${selectedMentor?.hourlyRate || 30}/hour
                          </div>
                          <Button
                            onClick={handleBookSession}
                            disabled={
                              !selectedDate || !selectedTime || !sessionTopic
                            }
                          >
                            Book Session
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full flex items-center justify-center p-12">
                <div className="text-center">
                  <h3 className="text-lg font-medium">No mentors found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="my-sessions" className="space-y-8">
          {/* Upcoming Sessions */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Upcoming Sessions</h3>
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : upcomingSessionsToShow.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {upcomingSessionsToShow.map((session: Session) => (
                  <Card key={session.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">
                            {session.title}
                          </CardTitle>
                          <CardDescription>
                            with {session.mentor?.name || "Your Mentor"}
                          </CardDescription>
                        </div>
                        <Badge
                          className={
                            session.status === "CONFIRMED"
                              ? "bg-green-500 hover:bg-green-600"
                              : session.status === "CANCELLED"
                              ? "bg-red-500 hover:bg-red-600"
                              : "bg-yellow-500 hover:bg-yellow-600"
                          }
                        >
                          {session.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-2 text-muted-foreground"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span>{session.date}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-2 text-muted-foreground"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span>{session.time}</span>
                        </div>
                        {session.description && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {session.description}
                          </p>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t pt-4">
                      <Button
                        variant="outline"
                        disabled={session.status === "CANCELLED"}
                      >
                        Reschedule
                      </Button>
                      {session.status === "CONFIRMED" ? (
                        <Button
                          disabled={!session.zoom_link}
                          onClick={() => joinSession(session.zoom_link || "")}
                        >
                          Join Meeting
                        </Button>
                      ) : session.status === "CANCELLED" ? (
                        <Button variant="outline" disabled>
                          Cancelled
                        </Button>
                      ) : (
                        <Button disabled>Awaiting Confirmation</Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <p className="text-muted-foreground mb-4">
                    You don't have any upcoming sessions
                  </p>
                  <Button
                    onClick={() => {
                      const findMentorsTab = document.querySelector(
                        '[data-value="find-mentors"]'
                      ) as HTMLElement;
                      if (findMentorsTab) findMentorsTab.click();
                    }}
                  >
                    Find a Mentor
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Past Sessions */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Past Sessions</h3>
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : pastSessionsToShow.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {pastSessionsToShow.map((session: Session) => (
                  <Card key={session.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">
                            {session.title}
                          </CardTitle>
                          <CardDescription>
                            with {session.mentor?.name || "Your Mentor"}
                          </CardDescription>
                        </div>
                        <div className="flex">
                          {Array(5)
                            .fill(null)
                            .map((_, i) => (
                              <svg
                                key={i}
                                className={`h-4 w-4 ${
                                  i < (session.rating || 0)
                                    ? "text-yellow-400"
                                    : "text-gray-300"
                                }`}
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                              </svg>
                            ))}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-2 text-muted-foreground"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span>{session.date}</span>
                          <span className="mx-2">•</span>
                          <span>{session.time}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <span className="text-muted-foreground">Status:</span>
                          <Badge
                            variant={
                              session.status === "COMPLETED"
                                ? "default"
                                : "outline"
                            }
                          >
                            {session.status}
                          </Badge>
                        </div>
                        {session.feedback ? (
                          <div>
                            <p className="text-sm font-medium">Feedback:</p>
                            <p className="text-sm text-muted-foreground line-clamp-3">
                              {session.feedback}
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">
                            No feedback provided for this session.
                          </p>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t pt-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          if (session.mentor) {
                            setSelectedMentor({
                              id: session.mentor.id,
                              name: session.mentor.name,
                              avatar_url: session.mentor.avatar_url,
                            });

                            // Open the dialog programmatically
                            const findMentorsTab = document.querySelector(
                              '[data-value="find-mentors"]'
                            ) as HTMLElement;
                            if (findMentorsTab) findMentorsTab.click();

                            // Pre-fill the topic with the previous session title
                            setSessionTopic(`Follow-up: ${session.title}`);

                            // Slight delay to ensure tab change completes
                            setTimeout(() => {
                              const bookButton = document.getElementById(
                                "book-session-button"
                              );
                              if (bookButton) bookButton.click();
                            }, 100);
                          }
                        }}
                      >
                        Book Again
                      </Button>
                      {session.zoom_link && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            // If there's a recording link available
                            toast({
                              title: "No recording available",
                              description:
                                "Session recordings are not currently available.",
                            });
                          }}
                        >
                          View Recording
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <p className="text-muted-foreground">
                    You don't have any past sessions
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
      <Toaster />
    </div>
  );
}
