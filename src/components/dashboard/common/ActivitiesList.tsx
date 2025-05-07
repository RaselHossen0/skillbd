import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface Activity {
  id: number | string;
  title: string;
  date: string;
  type: string;
  status?: string;
  progress?: number;
}

interface ActivitiesListProps {
  activities: Activity[];
  maxItems?: number;
  onViewAll?: () => void;
}

export function ActivitiesList({ 
  activities, 
  maxItems = 5,
  onViewAll 
}: ActivitiesListProps) {
  // Map activity types to badge styles
  const getActivityBadge = (type: string) => {
    switch (type) {
      case 'PROJECT_SUBMISSION':
        return { text: 'Completed', className: 'bg-green-500 hover:bg-green-600' };
      case 'PROJECT_APPLICATION':
        return { text: 'Pending', className: 'bg-yellow-500 hover:bg-yellow-600' };
      case 'MENTORSHIP_SESSION':
        return { text: 'Session', className: 'bg-blue-500 hover:bg-blue-600' };
      case 'COURSE_PROGRESS':
        return { text: 'Course', className: 'bg-purple-500 hover:bg-purple-600' };
      case 'JOB_POSTED':
        return { text: 'Posted', className: 'bg-green-500 hover:bg-green-600' };
      case 'APPLICATION_RECEIVED':
        return { text: 'New Application', className: 'bg-blue-500 hover:bg-blue-600' };
      case 'PROJECT_STARTED':
        return { text: 'Project', className: 'bg-purple-500 hover:bg-purple-600' };
      default:
        return { text: 'Activity', className: 'bg-gray-500 hover:bg-gray-600' };
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
        <CardDescription>Your latest interactions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {activities.slice(0, maxItems).map((activity) => {
            const badge = getActivityBadge(activity.type);
            return (
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
                      <Badge className={badge.className}>
                        {badge.text}
                      </Badge>
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
            );
          })}
        </div>
        {onViewAll && activities.length > maxItems && (
          <div className="mt-6">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={onViewAll}
            >
              View All Activities
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 