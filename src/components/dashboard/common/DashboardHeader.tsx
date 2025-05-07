import { Button } from "@/components/ui/button";
import { User } from "@/types";

interface DashboardHeaderProps {
  user: User;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function DashboardHeader({ 
  user, 
  title, 
  description, 
  actions 
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
        <p className="text-muted-foreground mt-1">
          {description || `Welcome back, ${user.name}! Here's an overview of your activities.`}
        </p>
      </div>
      {actions && (
        <div className="flex items-center gap-3">
          {actions}
        </div>
      )}
    </div>
  );
} 