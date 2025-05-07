'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      // No authenticated user, redirect to login page
      router.push('/auth/login');
    } else if (!loading && user && allowedRoles && !allowedRoles.includes(user.role)) {
      // User doesn't have the required role, redirect to dashboard
      router.push('/dashboard');
    }
  }, [user, loading, router, allowedRoles]);

  // Show loading state
  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is authenticated and has the right role, render children
  return <>{children}</>;
} 