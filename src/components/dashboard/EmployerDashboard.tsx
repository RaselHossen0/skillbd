import Link from "next/link";

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
}

export default function EmployerDashboard({ user }: EmployerDashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    jobs_count: 0,
    applications_count: 0,
    projects_count: 0,
    active_contracts: 0
  });
  const [jobs, setJobs] = useState<Job[]>([]);
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
        
        // Fetch employer-specific data if we have an employer record
        if (user.employers && user.employers.length > 0) {
          const employerId = user.employers[0].id;
          
          // Fetch jobs
          const jobsResponse = await fetch(`/api/dashboard/employers/jobs?employerId=${employerId}`);
          if (!jobsResponse.ok) throw new Error('Failed to fetch jobs');
          const jobsData = await jobsResponse.json();
          
          setJobs(jobsData.jobs || []);
        }
      } catch (error) {
        console.error('Error fetching employer dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [user]);
  
  // Render a session item
  const renderSession = (session: Session) => {
    const applicantName = session.applicants?.users?.name || session.applicant_name || "Applicant";
    const jobTitle = session.job?.title || "Job Interview";
    
    return (
      <div key={session.id} className="flex items-center justify-between border p-4 rounded-lg">
        <div>
          <h4 className="font-medium">{session.title || jobTitle}</h4>
          <p className="text-sm text-muted-foreground">with {applicantName}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline">{session.date}</Badge>
            <Badge variant="outline">{session.time}</Badge>
          </div>
        </div>
        {session.meeting_link && (
          <Link href={session.meeting_link} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">
              Join Meeting
            </Button>
          </Link>
        )}
      </div>
    );
  };
  
  // Mock data for sessions
  const mockSessions = [
    {
      id: 1,
      title: "Interview for Frontend Developer",
      applicant_name: "John Doe",
      date: "Tomorrow",
      time: "10:00 AM",
      status: "SCHEDULED",
      meeting_link: "https://zoom.us/j/123456789"
    },
    {
      id: 2,
      title: "Project Discussion",
      applicant_name: "Jane Smith",
      date: "Thursday",
      time: "2:00 PM",
      status: "SCHEDULED",
      meeting_link: "https://zoom.us/j/987654321"
    }
  ];
  
  // Use real data if available, otherwise fall back to mock data
  const displayJobs = jobs.length > 0 ? jobs : mockJobs;
  const displayActivities = activities.length > 0 ? activities : mockActivities;
  const displaySessions = sessions.length > 0 ? sessions : mockSessions;

  return (
    <div className="space-y-8">
      {/* ... existing code ... */}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* ... existing code ... */}
      </div>

      {/* Interview Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Interviews & Meetings</CardTitle>
          <CardDescription>Your scheduled appointments with applicants</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {displaySessions.map(session => renderSession(session))}
            <Button variant="outline" className="w-full mt-4">View All Sessions</Button>
          </div>
        </CardContent>
      </Card>

      {/* All Jobs */}
      {/* ... existing code ... */}
    </div>
  );
} 