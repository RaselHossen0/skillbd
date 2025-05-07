"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import StudentDashboard from "@/components/dashboard/StudentDashboard";
import MentorDashboard from "@/components/dashboard/MentorDashboard";
import EmployerDashboard from "@/components/dashboard/EmployerDashboard";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Check for success messages from URL parameters
  useEffect(() => {
    const signup = searchParams.get('signup');
    const login = searchParams.get('login');
    const reset = searchParams.get('reset');
    
    if (signup === 'success') {
      setSuccessMessage('Account created successfully! Welcome to SkillBD.');
    } else if (login === 'success') {
      setSuccessMessage('You have successfully logged in.');
    } else if (reset === 'success') {
      setSuccessMessage('Your password has been successfully reset.');
    }
    
    // Clear success message after 5 seconds
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [searchParams, successMessage]);

  // Show loading state when data is loading
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If no user (shouldn't happen due to ProtectedRoute), show error
  if (!user) {
    return (
      <div className="w-full px-4 py-6 md:px-6 lg:px-8">
        <Alert variant="destructive">
          <AlertTitle>Authentication Error</AlertTitle>
          <AlertDescription>
            Could not retrieve user information. Please try logging in again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-6 md:px-6 lg:px-8 space-y-8">
      {successMessage && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}
      
      {/* Render different dashboard based on user role */}
      {user.role === "STUDENT" && <StudentDashboard user={user} />}
      {user.role === "MENTOR" && <MentorDashboard user={user} />}
      {user.role === "EMPLOYER" && <EmployerDashboard user={user} />}
    </div>
  );
} 