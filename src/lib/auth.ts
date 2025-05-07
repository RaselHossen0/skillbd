import { User, UserRole } from '@/types';
import { supabase } from './supabase';

// Add this new interface for the signIn response
export interface SignInResponse {
  user?: User;
  error?: string;
  code?: string;
  message?: string;
  emailUnconfirmed?: boolean;
}

export type SignUpCredentials = {
  email: string;
  password: string;
  name: string;
  role: UserRole;
};

export type SignInCredentials = {
  email: string;
  password: string;
};

// New function to sign up with redirect
export const signUpWithRedirect = async ({ email, password }: { email: string, password: string }) => {
  try {
    const redirectTo = typeof window !== 'undefined' 
      ? `${window.location.origin}/auth/callback` 
      : 'http://localhost:3000/auth/callback';
      
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
      }
    });
    
    if (error) {
      console.error('Error during sign up with redirect:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error during sign up with redirect:', error);
    throw error;
  }
};

// New function to sign in with redirect
export const signInWithRedirect = async ({ email, password }: { email: string, password: string }) => {
  try {
    const redirectTo = typeof window !== 'undefined' 
      ? `${window.location.origin}/auth/callback` 
      : 'http://localhost:3000/auth/callback';
      
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error('Error during sign in with redirect:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error during sign in with redirect:', error);
    throw error;
  }
};

export const signUp = async ({ email, password, name, role }: SignUpCredentials) => {
  try {
    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'signup',
        email,
        password,
        name,
        role,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to register (HTTP ${response.status})`);
    }

    const data = await response.json();
    
    // Validate the response structure
    if (!data || !data.user) {
      console.error('Invalid response structure:', data);
      throw new Error('Server returned an invalid response structure');
    }

    return data;
  } catch (error) {
    console.error('Error during sign up:', error);
    // Add more detailed debugging
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    } else {
      console.error('Unknown error type:', typeof error);
    }
    throw error;
  }
};

export const signIn = async ({ email, password }: SignInCredentials): Promise<SignInResponse> => {
  try {
    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'signin',
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Check for the special case of unconfirmed email
      if (data.code === 'email_not_confirmed') {
        // Return the data with the error but in a structured way
        // so the UI can handle it appropriately
        return {
          error: data.error,
          code: data.code,
          message: data.message,
          emailUnconfirmed: true
        };
      }
      throw new Error(data.error || 'Failed to login');
    }

    return data;
  } catch (error) {
    console.error('Error during sign in:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'signout',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to logout');
    }

    return data;
  } catch (error) {
    console.error('Error during sign out:', error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await fetch('/api/user', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // If 401/403, user is not logged in
    if (response.status === 401 || response.status === 403) {
      return null;
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to get current user');
    }

    return data.user;
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
};

export const resetPassword = async (email: string) => {
  try {
    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to reset password');
    }

    return data;
  } catch (error) {
    console.error('Error during password reset:', error);
    throw error;
  }
};

export const updatePassword = async (password: string) => {
  try {
    const response = await fetch('/api/auth/update-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update password');
    }

    return data;
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  }
}; 