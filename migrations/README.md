# Supabase Database Setup

This directory contains SQL migration files for setting up the necessary tables and relationships in your Supabase project.

## How to run migrations

1. Log in to your Supabase dashboard at [app.supabase.com](https://app.supabase.com)
2. Select your project
3. Navigate to the SQL Editor section
4. Create a new query
5. Copy and paste the contents of `supabase_schema.sql` into the editor
6. Run the query

## Database Structure

Our application uses the following tables:

- `profiles` - Stores user profile information (linked to auth.users)
- `students` - Stores student-specific information
- `mentors` - Stores mentor-specific information
- `employers` - Stores employer-specific information

Future migrations will add:
- Course management tables
- Project marketplace tables
- Skill assessment tables
- Mentorship session tables

## Row Level Security (RLS)

The SQL migrations include Row Level Security policies to ensure:

1. Any user can view profiles
2. Users can only update their own profiles
3. Users can only insert their own profiles (linked to their auth ID)
4. Related resources are protected by appropriate policies

### Important RLS Considerations

When enabling Row Level Security in Supabase, all operations are DENIED by default unless explicitly allowed by a policy. This is why we have:

- **SELECT policies** - To allow reading data
- **UPDATE policies** - To allow users to update their own data
- **INSERT policies** - To allow users to create their own data
- **Service role policies** - To allow admin operations

The service role key is critical for operations that need to bypass RLS, such as:
- Creating initial user profiles during signup
- Administrative operations
- Migrations and data seeding

Our API routes use the service role key when they need to create or access data that would otherwise be restricted by RLS.

## Environment Setup

Make sure your application's .env file includes:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

The service role key is used for administrative operations and should be kept secure. 