# SkillBD Mentorship Sessions Feature

This document provides an overview of the mentorship sessions functionality in the SkillBD platform.

## Overview

The mentorship sessions feature allows users to book, manage, and join one-on-one mentorship sessions based on their role in the system:

- **Students** can book sessions with mentors and manage their upcoming sessions
- **Mentors** can view sessions booked with them and manage their availability
- **Employers** can schedule interviews and project discussions

## Implementation Details

### Database Structure

The sessions are stored in the database with the following key fields:

- `id`: Unique identifier for the session
- `title`: Title/purpose of the session
- `description`: Detailed description of what will be covered
- `date`: The date of the session
- `time`: The time of the session
- `status`: Current status (PENDING, CONFIRMED, COMPLETED, CANCELLED)
- `zoom_link`: Link to join the virtual meeting
- `mentor_id`: Reference to the mentor
- `student_id`: Reference to the student

Additional timestamp fields:
- `start_time`: Combined date and time field
- `end_time`: End time of the session
- `created_at`: When the session was created

### Database Functions

The system uses the following Supabase database functions to handle session operations:

1. `get_dashboard_sessions(p_user_id, p_role)`: Retrieves sessions for a specific user based on their role
2. `create_mentorship_session(p_role, p_creator_id, p_mentor_id, p_student_id, p_title, p_description, p_date, p_time, p_zoom_link)`: Creates a new session
3. `update_mentorship_session(p_session_id, p_role, p_title, p_description, p_date, p_time, p_status, p_zoom_link)`: Updates an existing session

### API Routes

The session functionality is exposed through the following API routes:

- `GET /api/dashboard/sessions`: Retrieves sessions for the current user
- `POST /api/dashboard/sessions`: Creates a new session
- `PUT /api/dashboard/sessions`: Updates an existing session
- `DELETE /api/dashboard/sessions`: Cancels/deletes a session

### Frontend Components

The session UIs are implemented in:

1. `src/components/dashboard/StudentDashboard.tsx`: Shows upcoming sessions for students
2. `src/components/dashboard/MentorDashboard.tsx`: Shows upcoming sessions for mentors
3. `src/components/dashboard/EmployerDashboard.tsx`: Shows upcoming interviews/meetings for employers
4. `src/app/dashboard/mentorship/page.tsx`: Dedicated mentorship page with full session management

## User Flows

### Student Flow
1. Browse available mentors
2. Book a session by selecting a mentor, date, time, and topic
3. View upcoming sessions on dashboard
4. Join sessions via Zoom link when it's time
5. Edit or cancel sessions as needed

### Mentor Flow
1. Set availability (future enhancement)
2. View upcoming booked sessions
3. Join sessions via Zoom link
4. Provide session feedback (future enhancement)

### Employer Flow
1. Schedule interviews with applicants
2. View upcoming meetings
3. Join meetings at the scheduled time

## Future Enhancements

- Calendar integration
- Recurring sessions
- Session ratings and feedback
- Payment integration for premium sessions
- Session recording and archiving
- Group mentorship sessions 