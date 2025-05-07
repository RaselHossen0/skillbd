'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User, UserRole } from '@/types';
import { 
  signIn, 
  signUp, 
  signOut, 
  getCurrentUser, 
  SignInCredentials, 
  SignUpCredentials,
  SignInResponse
} from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (credentials: SignInCredentials) => Promise<void>;
  register: (credentials: SignUpCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function loadUser() {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  const login = async (credentials: SignInCredentials) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await signIn(credentials);
      
      // Check if there's an unconfirmed email issue
      if (result.emailUnconfirmed) {
        setError("Please confirm your email address before logging in. Check your inbox for a confirmation link.");
        throw new Error("Email not confirmed");
      }
      
      // Make sure we have a user object before setting it
      if (!result.user) {
        throw new Error("Invalid response from server");
      }
      
      setUser(result.user);
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Failed to login');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (credentials: SignUpCredentials) => {
    try {
      setLoading(true);
      setError(null);
      
      const { user } = await signUp(credentials);
      setUser(user as User);
      
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Handle different error scenarios
      if (error.message && error.message.includes('already')) {
        setError('This email is already registered. Please try logging in instead.');
      } else if (error.message && error.message.includes('email')) {
        setError('Please check your email address and try again.');
      } else {
        setError(error.message || 'Failed to register. Please try again.');
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await signOut();
      setUser(null);
      router.push('/');
    } catch (error: any) {
      setError(error.message || 'Failed to logout');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 