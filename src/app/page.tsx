import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      {/* Navbar */}
      <nav className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 ">
            <Image src="/logo.svg" alt="IndustryHunt Logo" width={40} height={40} className="h-8 w-8 ml-4" />
            <span className="text-xl font-bold">IndustryHuntBD</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="outline">Log in</Button>
            </Link>
            <Link href="/auth/register">
              <Button>Sign up</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container flex flex-col items-center justify-center gap-6 pt-16 pb-8 md:pt-24 md:pb-12 lg:pt-32 lg:pb-16">
        <div className="flex max-w-[980px] flex-col items-center gap-4 text-center">
          <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:text-6xl">
            Connect, Learn, and Grow with <br />
            <span className="text-primary">IndustryHunt Bangladesh</span>
          </h1>
          <p className="max-w-[700px] text-lg text-muted-foreground sm:text-xl">
            Bridging the gap between education and employment by connecting students 
            with real-world projects and industry mentors.
          </p>
        </div>
        <div className="flex gap-4">
          <Link href="/auth/register?role=student">
            <Button size="lg">I'm a Student</Button>
          </Link>
          <Link href="/auth/register?role=mentor">
            <Button size="lg" variant="outline">I'm a Mentor</Button>
          </Link>
          <Link href="/auth/register?role=employer">
            <Button size="lg" variant="outline">I'm an Employer</Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container space-y-12 py-8 md:py-12 lg:py-16">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
          <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">
            How It Works
          </h2>
          <p className="max-w-[85%] text-muted-foreground">
            Our platform connects students, mentors, and employers to create a thriving skills ecosystem.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* For Students */}
          <div className="flex flex-col items-center space-y-4 rounded-lg border p-6">
            <div className="rounded-full bg-primary/10 p-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold">For Students</h3>
            <p className="text-center text-muted-foreground">
              Assess your skills, learn through micro-courses, work on real projects,
              and get mentored by industry professionals.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center">
                <svg className="mr-2 h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Skill Assessment Quizzes
              </li>
              <li className="flex items-center">
                <svg className="mr-2 h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Project Marketplace
              </li>
              <li className="flex items-center">
                <svg className="mr-2 h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Micro-Courses
              </li>
              <li className="flex items-center">
                <svg className="mr-2 h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Digital Portfolio
              </li>
            </ul>
          </div>

          {/* For Mentors */}
          <div className="flex flex-col items-center space-y-4 rounded-lg border p-6">
            <div className="rounded-full bg-primary/10 p-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path>
                <path d="M12 18V6"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold">For Mentors</h3>
            <p className="text-center text-muted-foreground">
              Guide students, review projects, host mentorship sessions,
              and earn additional income while finding promising talent.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center">
                <svg className="mr-2 h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Profile Builder
              </li>
              <li className="flex items-center">
                <svg className="mr-2 h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Mentorship Scheduler
              </li>
              <li className="flex items-center">
                <svg className="mr-2 h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Project Reviewer
              </li>
              <li className="flex items-center">
                <svg className="mr-2 h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Community Forum
              </li>
            </ul>
          </div>

          {/* For Employers */}
          <div className="flex flex-col items-center space-y-4 rounded-lg border p-6">
            <div className="rounded-full bg-primary/10 p-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary">
                <path d="M20 7h-9"></path>
                <path d="M14 17H5"></path>
                <circle cx="17" cy="17" r="3"></circle>
                <circle cx="7" cy="7" r="3"></circle>
              </svg>
            </div>
            <h3 className="text-xl font-bold">For Employers</h3>
            <p className="text-center text-muted-foreground">
              Post real-world challenges, find job-ready candidates,
              and verify their skills through certified projects.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center">
                <svg className="mr-2 h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Post Challenges
              </li>
              <li className="flex items-center">
                <svg className="mr-2 h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Talent Pool Access
              </li>
              <li className="flex items-center">
                <svg className="mr-2 h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Certification Verification
          </li>
              <li className="flex items-center">
                <svg className="mr-2 h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Hire Top Talent
          </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className=" py-16">
        <div className="container flex flex-col items-center justify-center gap-6 text-center">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Take Your Career to the Next Level
          </h2>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Join IndustryHunt Bangladesh today and connect with top employers, showcase your skills, 
            and discover exciting opportunities tailored to your expertise.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <Link href="/auth/register">
              <Button size="lg" className="font-medium">
                Sign up for free
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline" className="font-medium">
                Learn more
              </Button>
            </Link>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            Already have an account? <Link href="/auth/login" className="text-primary underline underline-offset-4">Sign in</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} SkillBridge Bangladesh. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/about" className="text-sm text-muted-foreground underline underline-offset-4">
              About
            </Link>
            <Link href="/contact" className="text-sm text-muted-foreground underline underline-offset-4">
              Contact
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground underline underline-offset-4">
              Terms
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground underline underline-offset-4">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
