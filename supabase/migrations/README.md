# SkillBD Supabase Database Migrations

This directory contains SQL migration files for the SkillBD platform's Supabase PostgreSQL database.

## Migration Files

### 20240701_create_mentorship_sessions.sql
Creates the mentorship sessions table that connects students with mentors:
- Defines the schema with proper UUID references and timestamp columns
- Adds session-specific fields like title, description, status, etc.
- Establishes foreign key relationships to students and mentors
- Sets up Row Level Security (RLS) policies for proper access control
- Creates indexes for better query performance

### 20240701_create_project_tables.sql
Sets up all project-related tables for the SkillBD platform:
- Projects table for employer-posted projects
- Skills table for categorizing technical skills
- Join tables for many-to-many relationships (project_skills, student_skills, mentor_expertise)
- Project application and completion tracking tables
- Project review system
- RLS policies and indexes for security and performance

### 20240701_create_course_tables.sql
Creates the educational platform tables:
- Courses table for mentor-created educational content
- Course modules for structuring course content
- Course enrollment for tracking student progress
- Notification system for platform-wide alerts
- Messaging system for communication between users
- Complete RLS policies and performance indexes

### 20240701_add_seed_data.sql
Adds initial data to the database for testing and development:
- Inserts common skills across various categories (Programming, Frameworks, Databases, etc.)
- Creates sample projects with skill requirements (only if employers exist)
- Adds example courses with modules (only if mentors exist)
- Uses dynamic SQL to gracefully handle existing data

### 20240702_fix_relationships.sql
Fixes compatibility issues between the database schema and API expectations:
- Creates a `users` view that makes `profiles` data accessible in the expected format
- Adds a `date` column to mentorship_sessions with trigger sync to `start_time`
- Creates a comprehensive view for mentorship sessions that includes all related data
- Ensures proper foreign key constraints between tables
- Grants appropriate permissions to authenticated users

### 20240702_create_api_views.sql
Creates database views specifically optimized for API endpoints:
- `api_mentors` view with formatted skill information for the `/api/users/mentors` endpoint
- `api_students` view with skills and education details
- `api_employers` view with company and project information
- `api_projects` view with related skills and applicant counts
- `api_mentorship_sessions` view with complete mentor and student details
- Configures proper security and access controls for these views

### 20240702_fix_mentor_api.sql
Provides direct solutions for the mentors API endpoint issues:
- Creates a `users_to_mentors` view for direct access from user ID to mentor data
- Implements a `get_mentors()` function that returns properly formatted JSON data
- Creates a `users_mentors` view specifically formatted for the API expectations
- Sets up proper permissions and security settings for these resources

### 20240702_fix_session_api.sql
Implements backend functions to handle mentorship session operations:
- `create_mentorship_session()` function that properly handles all required fields 
- `get_user_sessions()` function that retrieves sessions based on user ID and role
- Returns properly formatted JSON data with all needed related information
- Handles permissions to ensure secure access to these functions

## How to Apply Migrations

To apply these migrations to your Supabase project:

1. Make sure you have the Supabase CLI installed:
   ```
   npm install -g supabase
   ```

2. Link your local project to your Supabase project:
   ```
   supabase link --project-ref your-project-ref
   ```

3. Run the migrations in the correct order:
   ```
   # Run these files in order one by one to avoid dependency issues
   supabase db push --db-url your-database-connection-string 20240701_create_mentorship_sessions.sql
   supabase db push --db-url your-database-connection-string 20240701_create_project_tables.sql
   supabase db push --db-url your-database-connection-string 20240701_create_course_tables.sql 
   supabase db push --db-url your-database-connection-string 20240702_fix_relationships.sql
   supabase db push --db-url your-database-connection-string 20240701_add_seed_data.sql
   supabase db push --db-url your-database-connection-string 20240702_create_api_views.sql
   supabase db push --db-url your-database-connection-string 20240702_fix_mentor_api.sql
   supabase db push --db-url your-database-connection-string 20240702_fix_session_api.sql
   ```

## Migration Order

**IMPORTANT**: The migration order is critical to avoid dependency errors. Please apply them in this exact sequence:

1. **20240701_create_mentorship_sessions.sql** - Creates base tables for mentorship
2. **20240701_create_project_tables.sql** - Adds project-related tables
3. **20240701_create_course_tables.sql** - Adds educational content tables
4. **20240702_fix_relationships.sql** - Adds the date column and fixes relationships
5. **20240701_add_seed_data.sql** - Populates sample data
6. **20240702_create_api_views.sql** - Creates views that depend on columns added in step 4
7. **20240702_fix_mentor_api.sql** - Implements mentor API support
8. **20240702_fix_session_api.sql** - Implements session API support

The migrations are designed to work with the base schema defined in `supabase_schema.sql`, which includes:
- Profiles table (linked to Supabase Auth)
- Basic student, mentor, and employer tables

## Troubleshooting

If you encounter any issues during migration:

1. Check the Supabase logs for detailed error messages
2. Verify that the database structure matches what's expected in the migrations
3. Run migrations individually if needed using:
   ```
   psql -h <host> -p <port> -U <user> -d <database> -f <migration-file>
   ```

## Notes

These migrations are designed to be safe and idempotent, meaning they can be run multiple times without causing issues. Each migration includes checks like `IF NOT EXISTS` to ensure it only makes changes when necessary.

The schema follows Supabase conventions with snake_case naming for columns and tables, and includes proper Row Level Security policies to ensure data protection. 