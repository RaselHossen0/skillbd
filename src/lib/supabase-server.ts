import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_SERVICE_KEY } from './env';

// Create a Supabase client with the service role key for server operations
// This bypasses RLS policies and should ONLY be used in server-side code
export const createServerSupabaseClient = () => {
  if (!SUPABASE_URL) {
    throw new Error('SUPABASE_URL is not defined');
  }

  if (!SUPABASE_SERVICE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined');
  }

  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}; 