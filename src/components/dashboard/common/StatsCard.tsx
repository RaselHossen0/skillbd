import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: number | string;
  description: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
}

export function StatsCard({ 
  title, 
  value, 
  description, 
  icon,
  trend 
}: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && React.cloneElement(icon as React.ReactElement, {
          className: "h-4 w-4 text-muted-foreground"
        })}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center">
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
          {trend && (
            <span 
              className={`ml-2 text-xs ${
                trend.direction === 'up' 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}
            >
              {trend.direction === 'up' ? '▲' : '▼'} {trend.value}%
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 