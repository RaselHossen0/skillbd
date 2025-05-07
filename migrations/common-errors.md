# Common Supabase Authentication Errors and Solutions

This document provides solutions for common errors encountered when setting up and using Supabase authentication.

## 1. "New row violates row-level security policy"

**Error Message:**
```
new row violates row-level security policy for table "profiles"
```

**Cause:** This happens because Row Level Security (RLS) is enabled on your tables, but you don't have the correct policies to allow INSERT operations.

**Solution:**
1. Add proper INSERT policies to your tables
2. Use the service role key for operations that need to bypass RLS

## 2. "Only WITH CHECK expression allowed for INSERT"

**Error Message:**
```
ERROR: 42601: only WITH CHECK expression allowed for INSERT
```

**Cause:** When creating RLS policies for INSERT operations, you must use WITH CHECK instead of USING.

**Solution:**
```sql
-- Incorrect
CREATE POLICY "Users can insert" 
  ON your_table FOR INSERT 
  USING (auth.uid() = user_id);

-- Correct
CREATE POLICY "Users can insert" 
  ON your_table FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
```

## 3. "supabaseKey is required"

**Error Message:**
```
Error: supabaseKey is required.
```

**Cause:** The Supabase client is being initialized without a valid API key.

**Solution:**
1. Add the missing environment variables to your `.env` or `.env.local` file:

```
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_from_dashboard
```

2. Make sure you're importing the key correctly in your code:

```typescript
import { SUPABASE_URL, SUPABASE_SERVICE_KEY } from '@/lib/env';
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
```

## 4. "Foreign key constraint violation"

**Error Message:**
```
insert or update on table "profiles" violates foreign key constraint "profiles_id_fkey"
```

**Cause:** This happens when attempting to create a profile with an ID that doesn't yet exist in the `auth.users` table. Supabase Auth creates users in two steps - first in their authentication system, then in the public schema's `auth.users` table, which can cause timing issues.

**Solution:**
Implement a retry mechanism with exponential backoff to handle this race condition:

```typescript
// Retry mechanism with exponential backoff
const createProfile = async (attempt = 1, maxAttempts = 5) => {
  try {
    // Try to create the profile
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .insert({ id: userId, /* other fields */ })
      .select()
      .single();
      
    if (error) {
      // Check specifically for foreign key constraint error
      if (error.code === '23503' && attempt < maxAttempts) {
        // Calculate delay with exponential backoff
        const delay = Math.pow(2, attempt) * 500; // 500ms, 1s, 2s, 4s, 8s
        console.log(`Foreign key error, retrying in ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return createProfile(attempt + 1, maxAttempts);
      }
      return { success: false, error };
    }
    
    return { success: true, data };
  } catch (err) {
    if (attempt < maxAttempts) {
      const delay = Math.pow(2, attempt) * 500;
      await new Promise(resolve => setTimeout(resolve, delay));
      return createProfile(attempt + 1, maxAttempts);
    }
    return { success: false, error: err };
  }
};

// Use the function
const result = await createProfile();
if (!result.success) {
  // Handle the error
}
```

This approach is more reliable than a simple delay because:
1. It adapts to varying conditions that might affect propagation time
2. It specifically targets the foreign key constraint error (code 23503)
3. It gives the system multiple chances to succeed with increasing delays

## 5. "User created but not found in auth system"

**Error Message:**
```
User created but not found in auth system. Please try again.
```

**Cause:** This can happen when trying to use admin methods like `auth.admin.getUserById` that might not be available in your current Supabase SDK version, or when you don't have the correct permissions.

**Solution:**
1. Skip the extra verification step and rely on the try/catch block to catch any errors
2. Upgrade to the latest Supabase SDK if you need admin functionality
3. Ensure your service role key has the necessary permissions

```typescript
// Instead of verification:
try {
  // Directly attempt the database operations
  const { data, error } = await supabaseAdmin.from('profiles').insert({
    // your data here
  });
  
  // Handle errors appropriately
} catch (error) {
  console.error('Database error:', error);
}
```

## 6. "Invalid JSON"

**Error Message:**
```
Unexpected token '<', "<!DOCTYPE "... is not valid JSON
```

**Cause:** This usually happens when your API is returning an HTML error page instead of JSON.

**Solution:**
1. Check your API request URL
2. Verify your API is properly handling errors
3. Ensure the Content-Type is set correctly to application/json

## General Troubleshooting Tips

1. **Check Environment Variables**
   - Ensure all required Supabase environment variables are set
   - Service role key is particularly important for bypassing RLS

2. **RLS Policy Issues**
   - Remember RLS denies all operations by default
   - You need explicit policies for SELECT, INSERT, UPDATE, DELETE
   - Service role bypasses RLS (use with caution)

3. **API Response Debugging**
   - Add console.log statements to see the exact responses
   - Check for error details in the Network tab of browser DevTools

4. **Database Schema Issues**
   - Verify table definitions match your requirements
   - Check foreign key constraints are correctly defined
   - Ensure the linking between auth.users and your profiles is correct 

5. **Supabase SDK Version Issues**
   - Different versions of the Supabase SDK may have different APIs
   - Admin methods in particular can change between versions
   - Check the Supabase documentation for your specific SDK version 