"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User } from "@/types";

interface DashboardStats {
  skills_count: number;  // Number of expertise areas
  projects_count: number;  // Projects reviewed
  courses_count: number;  // Courses created
  sessions_count: number;  // Mentorship sessions
}

interface Expertise {
  id: string;
  skill: {
    id: string;
    name: string;
    category: string;
  };
  level: number;
  verified: boolean;
}

interface Session {
  id: string | number;
  title: string;
  student_name?: string;
  date: string;
  time: string;
  status: string;
  zoom_link?: string;
  students?: {
    users?: {
      name: string;
    };
  };
  student?: {
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

interface MentorDashboardProps {
  user: User;
}

export default function MentorDashboard({ user }: MentorDashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    skills_count: 0,
    projects_count: 0,
    courses_count: 0,
    sessions_count: 0
  });
  const [expertise, setExpertise] = useState<Expertise[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch stats
        const statsResponse = await fetch(`/api/dashboard/stats?userId=${user.id}&userRole=${user.role}`);
        if (!statsResponse.ok) throw new Error('Failed to fetch stats');
        const statsData = await statsResponse.json();
        
        // Fetch activities
        const activitiesResponse = await fetch(`/api/dashboard/activities?userId=${user.id}`);
        if (!activitiesResponse.ok) throw new Error('Failed to fetch activities');
        const activitiesData = await activitiesResponse.json();
        
        // Fetch sessions
        const sessionsResponse = await fetch(`/api/dashboard/sessions?userId=${user.id}&userRole=${user.role}`);
        if (!sessionsResponse.ok) throw new Error('Failed to fetch sessions');
        const sessionsData = await sessionsResponse.json();
        
        // Set initial data
        setStats(statsData);
        setActivities(activitiesData.activities || []);
        setSessions(sessionsData.sessions || []);
        
        // Fetch mentor-specific data if we have a mentor record
        if (user.mentors && user.mentors.length > 0) {
          const mentorId = user.mentors[0].id;
          
          // Fetch expertise areas
          const expertiseResponse = await fetch(`/api/dashboard/mentors/expertise?mentorId=${mentorId}`);
          if (!expertiseResponse.ok) throw new Error('Failed to fetch expertise areas');
          const expertiseData = await expertiseResponse.json();
          
          setExpertise(expertiseData.expertise || []);
        }
      } catch (error) {
        console.error('Error fetching mentor dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [user]);
  
  // Render an expertise item
  const renderExpertise = (skill: Expertise, index: number) => {
    const skillName = skill.skill?.name || `Skill ${index + 1}`;
    const category = skill.skill?.category || 'General';
    const level = skill.level || 1;
    
    return (
      <div key={skill.id || index} className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium leading-none">
            {skillName}
            <Badge variant="outline" className="ml-2">
              {category}
            </Badge>
          </p>
          <p className="text-sm text-muted-foreground">
            Level {level}/5
          </p>
        </div>
        <div className="flex items-center">
          {Array(5)
            .fill(null)
            .map((_, i) => (
              <svg
                key={i}
                className={`h-4 w-4 ${
                  i < level ? "fill-primary" : "fill-muted"
                }`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            ))}
        </div>
      </div>
    );
  };
  
  // Render a session item
  const renderSession = (session: Session) => {
    // The enhanced API now returns student data in a more standardized format
    const studentName = session.student?.name || "Student";
    
    return (
      <div key={session.id} className="flex items-center justify-between border p-4 rounded-lg">
        <div>
          <h4 className="font-medium">{session.title}</h4>
          <p className="text-sm text-muted-foreground">with {studentName}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline">{session.date}</Badge>
            <Badge variant="outline">{session.time}</Badge>
          </div>
        </div>
        {session.zoom_link && (
          <Link href={session.zoom_link} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">
              Join Zoom
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
  
  // Mock data for fallback when API data is not available
  const mockExpertise = [
    { id: '1', skill: { id: '1', name: 'JavaScript', category: 'Programming' }, level: 5, verified: true },
    { id: '2', skill: { id: '2', name: 'React', category: 'Frontend' }, level: 4, verified: true },
    { id: '3', skill: { id: '3', name: 'Node.js', category: 'Backend' }, level: 4, verified: true },
    { id: '4', skill: { id: '4', name: 'System Design', category: 'Architecture' }, level: 5, verified: true },
    { id: '5', skill: { id: '5', name: 'Database Design', category: 'Database' }, level: 3, verified: true },
  ];
  
  const mockSessions = [
    {
      id: 1,
      title: "Career Guidance Session",
      student_name: "Student 1",
      date: "Tomorrow",
      time: "10:00 AM",
      status: "SCHEDULED",
      zoom_link: "https://zoom.us/j/123456789"
    },
    {
      id: 2,
      title: "React Project Review",
      student_name: "Student 2",
      date: "Thursday",
      time: "2:00 PM",
      status: "SCHEDULED",
      zoom_link: "https://zoom.us/j/987654321"
    },
    {
      id: 3,
      title: "Interview Preparation",
      student_name: "Student 3",
      date: "Friday",
      time: "11:30 AM",
      status: "SCHEDULED",
      zoom_link: "https://zoom.us/j/567891234"
    }
  ];
  
  const mockActivities = [
    {
      id: 1,
      type: "SESSION_COMPLETED",
      title: "Career Guidance with Student 4",
      date: "2 days ago",
      status: "COMPLETED",
    },
    {
      id: 2,
      type: "COURSE_UPDATED",
      title: "JavaScript Fundamentals Course",
      date: "5 days ago",
      progress: 100,
    },
    {
      id: 3,
      type: "PROJECT_REVIEWED",
      title: "E-commerce Website Review",
      date: "1 week ago",
      status: "COMPLETED",
    },
    {
      id: 4,
      type: "SESSION_SCHEDULED",
      title: "System Design Workshop",
      date: "2 weeks ago",
      status: "PENDING",
    },
  ];
  
  // Use real data if available, otherwise fall back to mock data
  const displayExpertise = expertise.length > 0 ? expertise : mockExpertise;
  const displaySessions = sessions.length > 0 ? sessions : mockSessions;
  const displayActivities = activities.length > 0 ? activities : mockActivities;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-gradient-to-r from-background via-background to-background/80 p-6 rounded-lg border shadow-sm">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">Mentor Dashboard</h2>
          <p className="text-muted-foreground mt-1">
            Welcome back, <span className="font-medium text-foreground">{user.name}</span>! Here's an overview of your mentoring activities.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 shadow-sm border-primary/20 hover:bg-primary/5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 text-primary"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            View Calendar
          </Button>
          <Button className="gap-2 shadow-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M12 20v-6M12 8V4" />
              <path d="M15.5 13.5a3.5 3.5 0 1 0-7 0 3.5 3.5 0 0 0 7 0Z" />
              <path d="M19.29 12.29a2.5 2.5 0 0 0-3.5-3.5" />
              <path d="M4.71 12.29a2.5 2.5 0 0 1 3.5-3.5" />
            </svg>
            Update Availability
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expertise Areas</CardTitle>
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
            <div className="text-2xl font-bold">{stats.skills_count}</div>
            <p className="text-xs text-muted-foreground">
              Areas of professional expertise
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projects Reviewed</CardTitle>
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
            <div className="text-2xl font-bold">{stats.projects_count}</div>
            <p className="text-xs text-muted-foreground">
              Reviewed and provided feedback
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Courses Created</CardTitle>
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
            <div className="text-2xl font-bold">{stats.courses_count}</div>
            <p className="text-xs text-muted-foreground">
              Educational content published
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mentorship Sessions</CardTitle>
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
            <div className="text-2xl font-bold">{stats.sessions_count}</div>
            <p className="text-xs text-muted-foreground">
              Total mentoring appointments
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Expertise Areas */}
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>Expertise Areas</CardTitle>
            <CardDescription>
              Your professional skills and competencies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {displayExpertise.slice(0, 5).map((skill, index) => renderExpertise(skill, index))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Your latest interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {displayActivities.map((activity) => (
                <div key={activity.id} className="flex items-center p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                  <div className="space-y-1 w-full">
                    <p className="text-sm font-medium leading-none">
                      {activity.title}
                    </p>
                    <div className="flex items-center pt-2 justify-between">
                      <div className="flex items-center gap-2">
                        {activity.type === "SESSION_COMPLETED" && (
                          <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>
                        )}
                        {activity.type === "SESSION_SCHEDULED" && (
                          <Badge className="bg-yellow-500 hover:bg-yellow-600">Scheduled</Badge>
                        )}
                        {activity.type === "COURSE_UPDATED" && (
                          <Badge className="bg-blue-500 hover:bg-blue-600">Course</Badge>
                        )}
                        {activity.type === "PROJECT_REVIEWED" && (
                          <Badge className="bg-purple-500 hover:bg-purple-600">Review</Badge>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {activity.date}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" className="ml-auto">View</Button>
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

      {/* Upcoming Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Mentorship Sessions</CardTitle>
          <CardDescription>Your scheduled mentoring appointments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {displaySessions.map(session => renderSession(session))}
            <Button variant="outline" className="w-full mt-4">View All Sessions</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 