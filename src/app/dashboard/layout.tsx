"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/components/providers/AuthProvider";

type UserRole = "STUDENT" | "MENTOR" | "EMPLOYER" | "ADMIN";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  
  // Role-specific navigation items
  const studentNavItems = [
    { name: "Overview", href: "/dashboard" },
    { name: "Projects", href: "/dashboard/projects" },
    { name: "Courses", href: "/dashboard/courses" },
    { name: "Skills", href: "/dashboard/skills" },
    { name: "Mentorship", href: "/dashboard/mentorship" },
    { name: "Portfolio", href: "/dashboard/portfolio" },
    { name: "Messages", href: "/dashboard/messages" },
  ];
  
  const mentorNavItems = [
    { name: "Overview", href: "/dashboard" },
    { name: "Sessions", href: "/dashboard/mentorship" },
    { name: "My Courses", href: "/dashboard/courses" },
    { name: "Reviews", href: "/dashboard/reviews" },
    { name: "Calendar", href: "/dashboard/calendar" },
    { name: "Messages", href: "/dashboard/messages" },
  ];
  
  const employerNavItems = [
    { name: "Overview", href: "/dashboard" },
    { name: "My Projects", href: "/dashboard/projects" },
    { name: "Talent Pool", href: "/dashboard/talent" },
    { name: "Applications", href: "/dashboard/applications" },
    { name: "Messages", href: "/dashboard/messages" },
  ];
  
  // Select navigation items based on user role
  const getNavItems = () => {
    if (!user) return studentNavItems;
    
    switch (user.role) {
      case 'MENTOR':
        return mentorNavItems;
      case 'EMPLOYER':
        return employerNavItems;
      case 'STUDENT':
      default:
        return studentNavItems;
    }
  };
  
  const navItems = getNavItems();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-40 border-b bg-background">
          <div className="container flex h-16 items-center justify-between py-4">
            <div className="flex items-center gap-2 md:gap-4">
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="md:hidden">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                    >
                      <line x1="3" x2="21" y1="6" y2="6" />
                      <line x1="3" x2="21" y1="12" y2="12" />
                      <line x1="3" x2="21" y1="18" y2="18" />
                    </svg>
                    <span className="sr-only">Toggle navigation menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="pr-0">
                  <Link
                    href="/"
                    className="flex items-center gap-2 font-semibold"
                  >
                    <Image
                      src="/logo.svg"
                      alt="SkillBridge BD Logo"
                      width={24}
                      height={24}
                      className="h-6 w-6"
                    />
                    <span className="font-bold">SkillBridge BD</span>
                  </Link>
                  <div className="grid gap-2 py-6">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                          pathname === item.href
                            ? "bg-muted font-medium text-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                        onClick={() => setOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
              <Link
                href="/"
                className="flex items-center gap-2 font-semibold"
              >
                <Image
                  src="/logo.svg"
                  alt="SkillBridge BD Logo"
                  width={24}
                  height={24}
                  className="h-6 w-6"
                />
                <span className="hidden font-bold md:inline-block">
                  SkillBridge BD
                </span>
              </Link>
              <nav className="hidden md:flex md:gap-2 lg:gap-6">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`text-sm font-medium ${
                      pathname === item.href
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/dashboard/notifications">
                <Button variant="ghost" size="icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                  </svg>
                  <span className="sr-only">Notifications</span>
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <div className="hidden text-right md:block">
                  <p className="text-sm font-medium leading-none">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user?.role || "Unknown"} Account
                  </p>
                </div>
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full border"
                    onClick={handleLogout}
                  >
                    <Avatar>
                      <AvatarImage
                        src={user?.image || ""}
                        alt={user?.name || "User"}
                      />
                      <AvatarFallback>
                        {user?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 container py-6">{children}</main>
        <footer className="py-6 md:px-8 md:py-0">
          <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              © 2023 SkillBridge Bangladesh. All rights reserved.
            </p>
            <div className="flex gap-4">
              <Link
                href="/terms"
                className="text-sm text-muted-foreground underline-offset-4 hover:underline"
              >
                Terms
              </Link>
              <Link
                href="/privacy"
                className="text-sm text-muted-foreground underline-offset-4 hover:underline"
              >
                Privacy
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </ProtectedRoute>
  );
} 