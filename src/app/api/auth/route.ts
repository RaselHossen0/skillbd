// API routes for authentication operations: signup, signin, signout
// These run on the server and can safely use Supabase

import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_SERVICE_KEY } from '@/lib/env';
import { UserRole } from '@/types';
import { NextRequest, NextResponse } from 'next/server';

interface SignUpRequest {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

interface SignInRequest {
  email: string;
  password: string;
}

// Create admin client with service role key for operations that need to bypass RLS
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

export async function POST(request: NextRequest) {
  const { action, ...data } = await request.json();

  try {
    switch (action) {
      case 'signup':
        return await handleSignUp(data as SignUpRequest);
      case 'signin':
        return await handleSignIn(data as SignInRequest);
      case 'signout':
        return await handleSignOut();
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: error.message || 'Authentication error' },
      { status: 500 }
    );
  }
}

async function handleSignUp(data: SignUpRequest) {
  const { email, password, name, role } = data;

  try {
    // Create user in Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (!authData || !authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      );
    }

    // Implement a retry mechanism with exponential backoff for profile creation
    const createProfile = async (attempt = 1, maxAttempts = 5) => {
      try {
        console.log(`Attempting to create profile, attempt ${attempt} of ${maxAttempts}`);
        
        // Store additional user profile data in Supabase profiles table using admin client to bypass RLS
        const { data: profileData, error: profileError } = await supabaseAdmin
          .from('profiles')
          .insert({
            id: authData.user!.id,
            name,
            email,
            role,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (profileError) {
          // If it's a foreign key constraint error, we can retry
          if (profileError.code === '23503' && attempt < maxAttempts) {
            // Foreign key constraint error - auth.users record not yet available
            const delay = Math.pow(2, attempt) * 500; // Exponential backoff
            console.log(`Foreign key constraint error, retrying in ${delay}ms`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return createProfile(attempt + 1, maxAttempts);
          }
          
          console.error('Error creating profile:', profileError);
          return { success: false, error: profileError.message || 'Failed to create user profile' };
        }

        return { success: true, data: profileData };
      } catch (error) {
        console.error(`Profile creation attempt ${attempt} failed:`, error);
        if (attempt < maxAttempts) {
          const delay = Math.pow(2, attempt) * 500; // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay));
          return createProfile(attempt + 1, maxAttempts);
        }
        return { success: false, error: 'Failed to create profile after multiple attempts' };
      }
    };

    // Create the profile with retry mechanism
    const profileResult = await createProfile();
    
    if (!profileResult.success) {
      return NextResponse.json(
        { error: profileResult.error },
        { status: 500 }
      );
    }

    try {
      // Create role-specific profile using admin client
      if (role === 'STUDENT') {
        const { error: studentError } = await supabaseAdmin
          .from('students')
          .insert({
            user_id: authData.user.id
          });

        if (studentError) {
          console.error('Error creating student profile:', studentError);
        }
      } else if (role === 'MENTOR') {
        const { error: mentorError } = await supabaseAdmin
          .from('mentors')
          .insert({
            user_id: authData.user.id
          });

        if (mentorError) {
          console.error('Error creating mentor profile:', mentorError);
        }
      } else if (role === 'EMPLOYER') {
        const { error: employerError } = await supabaseAdmin
          .from('employers')
          .insert({
            user_id: authData.user.id,
            company_name: name
          });

        if (employerError) {
          console.error('Error creating employer profile:', employerError);
        }
      }

      // Get complete user profile with role data
      const { data: fullProfileData, error: fetchError } = await supabaseAdmin
        .from('profiles')
        .select(`
          *,
          students(*),
          mentors(*),
          employers(*)
        `)
        .eq('id', authData.user.id)
        .single();

      if (fetchError) {
        console.error('Error fetching complete profile:', fetchError);
      }

      // If there's a session, set cookies
      const userData = {
        ...fullProfileData,
        id: authData.user.id,
        aud: authData.user.aud,
        email_confirmed_at: authData.user.email_confirmed_at,
      };

      const response = NextResponse.json({
        user: userData
      });

      if (authData.session) {
        response.cookies.set('sb-access-token', authData.session.access_token, {
          maxAge: 60 * 60 * 24 * 7, // 1 week
          path: '/',
        });
        response.cookies.set('sb-refresh-token', authData.session.refresh_token, {
          maxAge: 60 * 60 * 24 * 30, // 30 days
          path: '/',
        });
      }

      return response;
    } catch (dbError: any) {
      console.error('Database operation error:', dbError);
      return NextResponse.json(
        { error: dbError.message || 'Error creating user profile' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error in signup flow:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to complete signup process' },
      { status: 500 }
    );
  }
}

async function handleSignIn(data: SignInRequest) {
  const { email, password } = data;

  try {
    // Sign in with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // Check for any error other than email confirmation
    if (authError && !authError.message.includes('Email not confirmed')) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }
    
    // Flag to track if email is unconfirmed
    const emailUnconfirmed = authError && authError.message.includes('Email not confirmed');
    
    // If we have an email confirmation error, we need to handle login differently
    // For now, we'll just return a special response indicating the issue
    if (emailUnconfirmed) {
      return NextResponse.json(
        { 
          error: 'Email not confirmed', 
          message: 'Please confirm your email address to login',
          code: 'email_not_confirmed'
        }, 
        { status: 401 }
      );
    }

    if (!authData || !authData.user) {
      return NextResponse.json(
        { error: 'Failed to sign in' },
        { status: 500 }
      );
    }

    try {
      // Check if email is confirmed
      const emailConfirmed = authData.user.email_confirmed_at !== null;

      // Get the user profile from Supabase
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
          *,
          students(*),
          mentors(*),
          employers(*)
        `)
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        return NextResponse.json(
          { error: 'User profile not found' },
          { status: 404 }
        );
      }

      // Create user data object
      const userData = {
        ...profileData,
        id: authData.user.id,
        aud: authData.user.aud,
        email_confirmed_at: authData.user.email_confirmed_at,
        email_verified: emailConfirmed
      };

      // Create response with user data
      const response = NextResponse.json({
        user: userData,
        email_verified: emailConfirmed
      });

      // Set session cookies
      response.cookies.set('sb-access-token', authData.session.access_token, {
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
      });
      response.cookies.set('sb-refresh-token', authData.session.refresh_token, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      });

      return response;
    } catch (error: any) {
      console.error('Error getting user profile:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to get user profile' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error during sign in:', error);
    return NextResponse.json(
      { error: error.message || 'Authentication error' },
      { status: 500 }
    );
  }
}

async function handleSignOut() {
  // Sign out from Supabase
  const { error } = await supabase.auth.signOut();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Create response and clear cookies
  const response = NextResponse.json({ success: true });
  response.cookies.delete('sb-access-token');
  response.cookies.delete('sb-refresh-token');

  return response;
} 