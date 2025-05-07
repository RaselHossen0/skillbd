// API route for fetching the current user
// This runs on the server and can safely use Supabase

import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_SERVICE_KEY } from '@/lib/env';
import { NextRequest, NextResponse } from 'next/server';

// Create admin client with service role key for operations that need to bypass RLS
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

export async function GET(request: NextRequest) {
  try {
    // Get the session token from cookies
    const accessToken = request.cookies.get('sb-access-token')?.value;
    const refreshToken = request.cookies.get('sb-refresh-token')?.value;

    if (!accessToken || !refreshToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Use the tokens to get the user session
    const { data: authData, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Get user profile from Supabase - use admin client to ensure we can bypass RLS if needed
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select(`
        *,
        students(*),
        mentors(*),
        employers(*)
      `)
      .eq('id', authData.user.id)
      .single();

    if (profileError || !profileData) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Return the combined user data
    return NextResponse.json({
      user: {
        ...profileData,
        id: authData.user.id,
        aud: authData.user.aud,
        email_confirmed_at: authData.user.email_confirmed_at,
      }
    });
  } catch (error: any) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: error.message || 'Error fetching user' },
      { status: 500 }
    );
  }
} 