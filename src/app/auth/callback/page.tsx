'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Extract auth data from URL hash
    const processHashParams = async () => {
      try {
        // Parse hash parameters from URL (access_token, refresh_token, etc.)
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const expiresIn = params.get('expires_in');
        const tokenType = params.get('token_type');
        const type = params.get('type'); // 'signup' or 'recovery'
        
        if (!accessToken || !refreshToken) {
          console.error('Missing tokens in callback URL');
          return;
        }

        // Set the session manually
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });

        if (error) {
          console.error('Error setting session:', error);
          router.push('/auth/login?error=auth_callback_failed');
          return;
        }

        // Get the user data
        const { data: { user } } = await supabase.auth.getUser();

        // Redirect based on the auth action type
        if (type === 'signup') {
          router.push('/dashboard?signup=success');
        } else if (type === 'recovery') {
          router.push('/dashboard?reset=success');
        } else {
          router.push('/dashboard?login=success');
        }
      } catch (error) {
        console.error('Error processing auth callback:', error);
        router.push('/auth/login?error=auth_callback_failed');
      }
    };

    // Only process if there's a hash in the URL
    if (window.location.hash) {
      processHashParams();
    } else {
      // Check for error in search params
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');
      
      if (error) {
        console.error('Auth error:', error, errorDescription);
        router.push(`/auth/login?error=${error}`);
      } else {
        router.push('/dashboard');
      }
    }
  }, [router, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl mb-4">Processing your authentication...</h2>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      </div>
    </div>
  );
} 