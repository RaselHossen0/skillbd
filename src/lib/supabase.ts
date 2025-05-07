import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './env'

// Log if environment variables are missing
if (!SUPABASE_URL) {
  console.error('SUPABASE_URL is not defined - check your environment variables')
}

if (!SUPABASE_ANON_KEY) {
  console.error('SUPABASE_ANON_KEY is not defined - check your environment variables')
}

// Create Supabase client with explicit URLs and redirect configuration
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    flowType: 'pkce',
    // Using autoRefreshToken and persistSession to ensure session management
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    // Set the redirect URL in the global config
    fetch: (...args) => {
      // When in browser environment, set up the redirect
      if (typeof window !== 'undefined') {
        // Store redirect URL for authentication flows
        localStorage.setItem('supabaseRedirectUrl', `${window.location.origin}/auth/callback`);
      }
      return fetch(...args);
    }
  }
})

// Add a simple test function to check if Supabase is properly configured
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1)
    if (error) {
      console.error('Supabase connection test failed:', error)
      return false
    }
    console.log('Supabase connection successful')
    return true
  } catch (error) {
    console.error('Supabase connection test exception:', error)
    return false
  }
} 