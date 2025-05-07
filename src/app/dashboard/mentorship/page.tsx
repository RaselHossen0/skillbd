"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function MentorshipPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMentor, setSelectedMentor] = useState<any>(null);

  const mentors = [
    {
      id: 1,
      name: "Sarah Johnson",
      position: "Senior Frontend Developer",
      company: "TechVision Ltd",
      expertise: ["React.js", "Vue.js", "JavaScript", "UI/UX"],
      experience: 6,
      bio: "Experienced frontend developer specializing in React.js and modern JavaScript frameworks. Passionate about mentoring junior developers and teaching best practices in web development.",
      hourlyRate: 30,
      rating: 4.9,
      availability: [
        { day: "Monday", slots: ["10:00 AM", "2:00 PM", "6:00 PM"] },
        { day: "Wednesday", slots: ["11:00 AM", "3:00 PM", "7:00 PM"] },
        { day: "Friday", slots: ["9:00 AM", "1:00 PM", "5:00 PM"] },
      ],
      totalSessions: 42,
      image: "",
    },
    {
      id: 2,
      name: "Ahmed Khan",
      position: "Lead Backend Developer",
      company: "Brain Station 23",
      expertise: ["Node.js", "Python", "Database Design", "Cloud Architecture"],
      experience: 8,
      bio: "Backend specialist with extensive experience in Node.js and Python. Skilled in designing scalable architectures and optimizing database performance. Enjoys mentoring on system design principles.",
      hourlyRate: 35,
      rating: 4.7,
      availability: [
        { day: "Tuesday", slots: ["9:00 AM", "1:00 PM", "5:00 PM"] },
        { day: "Thursday", slots: ["10:00 AM", "2:00 PM", "6:00 PM"] },
        { day: "Saturday", slots: ["11:00 AM", "3:00 PM"] },
      ],
      totalSessions: 36,
      image: "",
    },
    {
      id: 3,
      name: "Tania Rahman",
      position: "UX/UI Designer",
      company: "DesignHub BD",
      expertise: ["UI Design", "User Research", "Figma", "Design Systems"],
      experience: 5,
      bio: "Creative UI/UX designer with a focus on user-centered design. Experienced in conducting user research and creating intuitive interfaces. Passionate about teaching design thinking and prototyping.",
      hourlyRate: 25,
      rating: 4.8,
      availability: [
        { day: "Monday", slots: ["11:00 AM", "3:00 PM", "7:00 PM"] },
        { day: "Wednesday", slots: ["10:00 AM", "2:00 PM", "6:00 PM"] },
        { day: "Sunday", slots: ["9:00 AM", "1:00 PM", "5:00 PM"] },
      ],
      totalSessions: 29,
      image: "",
    },
    {
      id: 4,
      name: "Rafiq Islam",
      position: "CTO",
      company: "NewsCred",
      expertise: ["Tech Leadership", "System Architecture", "Career Guidance", "Full-Stack"],
      experience: 12,
      bio: "Tech executive with over a decade of experience in leadership roles. Specializes in helping mentees navigate career growth, technical decisions, and leadership challenges in the tech industry.",
      hourlyRate: 50,
      rating: 4.9,
      availability: [
        { day: "Tuesday", slots: ["6:00 PM", "7:00 PM", "8:00 PM"] },
        { day: "Thursday", slots: ["6:00 PM", "7:00 PM", "8:00 PM"] },
        { day: "Saturday", slots: ["10:00 AM", "11:00 AM", "12:00 PM"] },
      ],
      totalSessions: 65,
      image: "",
    },
    {
      id: 5,
      name: "Maliha Kabir",
      position: "Mobile App Developer",
      company: "AppLab BD",
      expertise: ["React Native", "Flutter", "iOS", "Android"],
      experience: 4,
      bio: "Mobile app developer with expertise in cross-platform frameworks. Skilled in building performant and user-friendly mobile applications. Loves to mentor on mobile development best practices.",
      hourlyRate: 28,
      rating: 4.6,
      availability: [
        { day: "Monday", slots: ["9:00 AM", "1:00 PM", "5:00 PM"] },
        { day: "Thursday", slots: ["10:00 AM", "2:00 PM", "6:00 PM"] },
        { day: "Saturday", slots: ["11:00 AM", "3:00 PM", "7:00 PM"] },
      ],
      totalSessions: 18,
      image: "",
    },
  ];

  const upcomingSessions = [
    {
      id: 1,
      mentor: "Sarah Johnson",
      title: "Frontend Career Guidance",
      date: "Nov 15, 2023",
      time: "10:00 AM - 11:00 AM",
      status: "CONFIRMED",
      zoomLink: "https://zoom.us/j/123456789",
    },
    {
      id: 2,
      mentor: "Rafiq Islam",
      title: "Tech Leadership Discussion",
      date: "Nov 20, 2023",
      time: "6:00 PM - 7:00 PM",
      status: "PENDING",
      zoomLink: null,
    },
  ];

  const pastSessions = [
    {
      id: 3,
      mentor: "Ahmed Khan",
      title: "Node.js Architecture Review",
      date: "Oct 25, 2023",
      time: "9:00 AM - 10:00 AM",
      status: "COMPLETED",
      rating: 5,
      feedback: "Ahmed was extremely helpful in reviewing my backend architecture. His suggestions have significantly improved my project's performance.",
    },
    {
      id: 4,
      mentor: "Tania Rahman",
      title: "Portfolio Design Feedback",
      date: "Oct 18, 2023",
      time: "3:00 PM - 4:00 PM",
      status: "COMPLETED",
      rating: 4,
      feedback: "Tania provided detailed feedback on my portfolio design. I appreciated her attention to detail and practical suggestions.",
    },
  ];

  // Filter mentors based on search query
  const filteredMentors = mentors.filter(mentor => {
    return mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           mentor.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
           mentor.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
           mentor.expertise.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
  });

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
            {filteredMentors.length > 0 ? (
              filteredMentors.map((mentor) => (
                <Card key={mentor.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex flex-col items-center text-center">
                      <Avatar className="h-24 w-24 mb-4">
                        <AvatarImage src={mentor.image} />
                        <AvatarFallback>{mentor.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                      </Avatar>
                      <CardTitle>{mentor.name}</CardTitle>
                      <CardDescription className="pt-1">
                        {mentor.position} at {mentor.company}
                      </CardDescription>
                      <div className="flex items-center justify-center mt-1">
                        <span className="text-sm font-medium">⭐ {mentor.rating}/5</span>
                        <span className="mx-2">•</span>
                        <span className="text-sm text-muted-foreground">{mentor.totalSessions} sessions</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {mentor.bio}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {mentor.expertise.map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Experience</span>
                      <span className="font-medium">{mentor.experience} years</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-muted-foreground">Rate</span>
                      <span className="font-medium">${mentor.hourlyRate}/hour</span>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          className="w-full" 
                          onClick={() => setSelectedMentor(mentor)}
                        >
                          Book Session
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Book a Session with {selectedMentor?.name}</DialogTitle>
                          <DialogDescription>
                            Select a date and time for your mentorship session
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="space-y-2">
                            <h4 className="font-medium">Available slots</h4>
                            {selectedMentor?.availability.map((avail: any) => (
                              <div key={avail.day} className="space-y-1">
                                <p className="text-sm font-medium">{avail.day}</p>
                                <div className="flex flex-wrap gap-2">
                                  {avail.slots.map((slot: string) => (
                                    <Badge 
                                      key={slot} 
                                      variant="outline" 
                                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                                    >
                                      {slot}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Session Topic</label>
                            <Input placeholder="e.g. Career guidance, Project review, etc." />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Questions/Topics to discuss</label>
                            <textarea 
                              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              placeholder="Brief description of what you'd like to discuss"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="submit">Book Session (${selectedMentor?.hourlyRate})</Button>
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
            {upcomingSessions.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {upcomingSessions.map((session) => (
                  <Card key={session.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">{session.title}</CardTitle>
                          <CardDescription>with {session.mentor}</CardDescription>
                        </div>
                        <Badge className={session.status === "CONFIRMED" ? "bg-green-500 hover:bg-green-600" : "bg-yellow-500 hover:bg-yellow-600"}>
                          {session.status === "CONFIRMED" ? "Confirmed" : "Pending"}
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{session.time}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t pt-4">
                      <Button variant="outline">Reschedule</Button>
                      {session.status === "CONFIRMED" ? (
                        <Button>
                          Join Meeting
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
                  <p className="text-muted-foreground mb-4">You don't have any upcoming sessions</p>
                  <Button>Find a Mentor</Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Past Sessions */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Past Sessions</h3>
            {pastSessions.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {pastSessions.map((session) => (
                  <Card key={session.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">{session.title}</CardTitle>
                          <CardDescription>with {session.mentor}</CardDescription>
                        </div>
                        <div className="flex">
                          {Array(5).fill(null).map((_, i) => (
                            <svg 
                              key={i} 
                              className={`h-4 w-4 ${i < session.rating ? "text-yellow-400" : "text-gray-300"}`}
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{session.date}</span>
                          <span className="mx-2">•</span>
                          <span>{session.time}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          {session.feedback}
                        </p>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end border-t pt-4">
                      <Button variant="outline">Book Again</Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <p className="text-muted-foreground">You don't have any past sessions</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 