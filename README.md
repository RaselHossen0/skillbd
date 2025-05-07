# SkillBridge Bangladesh

SkillBridge Bangladesh is a platform designed to bridge the gap between education and employment by connecting students with real-world projects and industry mentors in Bangladesh.

## Features

### Student Features
- **Skill Assessment Quiz** - Personalized learning path based on skills
- **Project Marketplace** - Apply for real-world tasks (paid/unpaid)
- **Micro-Courses** - Certifications from industry partners
- **Mentorship Hub** - Book 1:1 sessions with professionals
- **Digital Portfolio** - Auto-generated from completed projects
- **Job Matcher** - AI-recommended entry-level roles

### Mentor Features
- **Profile Builder** - List expertise and experience
- **Mentorship Scheduler** - Set availability for sessions
- **Project Reviewer** - Grade student submissions, give feedback
- **Community Forum** - Answer Q&A, host AMAs

### Employer Features
- **Post Challenges** - Define tasks for students
- **Talent Pool Access** - Filter students by skills, project history
- **Certification Verification** - Check badges

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **UI Components**: Shadcn UI
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL (via Supabase)
- **Storage**: Supabase Storage
- **Deployment**: Vercel

## Implemented Features

### Authentication System
- **Role-based Authentication** - Student, Mentor, and Employer roles
- **Protected Routes** - Access control based on user roles
- **Authentication Context** - Global auth state management
- **User Profiles** - Role-specific user profiles and data

### Dashboard System
- **Role-specific Dashboards** - Tailored views for different user types
- **Dashboard Stats** - User-specific metrics and analytics
- **Activity Tracking** - Recent user activities display
- **Dynamic Navigation** - Role-based navigation menus

### Skills Assessment Module
- **Skill Quizzes** - Interactive skill assessment
- **Skill Ratings** - Skill level tracking and verification
- **Skill Recommendations** - Personalized skill suggestions

### Portfolio Generator
- **Project Showcase** - Display completed projects
- **Skill Display** - Visualize skill ratings and verifications
- **Portfolio Customization** - User-controlled profile visibility
- **Portfolio Sharing** - Public portfolio URLs

## API Implementation

The platform implements the following key APIs:

### Authentication Services
- `signUp` - Register new users with role-specific profiles
- `signIn` - Authenticate users with email/password
- `signOut` - Log users out of the platform
- `getCurrentUser` - Fetch current user data with role details
- `resetPassword` - Handle password reset flows

### Dashboard Services
- `getDashboardStats` - Fetch user-specific dashboard metrics
- `getStudentSkills` - Retrieve skills for student profiles
- `getRecommendedProjects` - Get projects matching student skills
- `getEnrolledCourses` - Fetch courses a student is enrolled in
- `getUpcomingMentorshipSessions` - Show scheduled mentorship sessions
- `getRecentActivities` - Retrieve user activity history

## Local Development

### Prerequisites
- Node.js (v20 or later)
- npm/yarn
- PostgreSQL database

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/skillbd.git
cd skillbd
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

4. Initialize the database:
```bash
# Run the migration script in Supabase SQL Editor
# Copy and paste the contents of migrations/supabase_schema.sql
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at http://localhost:3000.

## Project Structure

```
skillbd/
├── migrations/           # SQL migration scripts for Supabase
├── public/               # Static assets
├── src/
│   ├── app/              # App router pages and layouts
│   │   ├── auth/         # Authentication pages
│   │   ├── dashboard/    # Dashboard pages and features
│   │   ├── components/   # UI components
│   │   ├── lib/          # Utility functions
│   │   └── types/        # TypeScript type definitions
│   ├── .env              # Environment variables
│   └── package.json      # Project dependencies
```

## User Roles

1. **Student** - Learn skills, complete projects, build portfolio
2. **Mentor** - Guide students, review projects, host mentorship sessions
3. **Employer** - Post projects, hire talent, verify skills

## Roadmap

- [x] Implement user authentication with Supabase
- [x] Create skill assessment module
- [x] Build portfolio generation system
- [ ] Complete project marketplace
- [ ] Add mentor-student matching algorithm
- [ ] Integrate payment system for paid projects

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Shadcn UI for the beautiful component library
- Next.js team for the amazing framework
- Supabase for authentication and database services
