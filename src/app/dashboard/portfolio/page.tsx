"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/components/providers/AuthProvider";

export default function PortfolioPage() {
  const [isEditing, setIsEditing] = useState(false);
  const { user } = useAuth();

  // Mock data for skills and projects
  const mockSkills = [
    { name: "JavaScript", level: 4, category: "Programming", verified: true },
    { name: "React.js", level: 3, category: "Frontend", verified: true },
    { name: "Node.js", level: 3, category: "Backend", verified: false },
    { name: "UI/UX Design", level: 4, category: "Design", verified: true },
    { name: "MongoDB", level: 2, category: "Database", verified: false },
  ];

  const mockProjects = [
    {
      id: 1,
      title: "E-commerce Website UI Design",
      description:
        "Designed a modern and responsive UI for an e-commerce platform selling handcrafted items.",
      company: "FashionBD Retail",
      completionDate: "October 2023",
      skills: ["UI/UX", "Figma", "Responsive Design"],
      imageUrl: "",
      demoLink: "https://demo-ecommerce.example.com",
      featured: true,
    },
    {
      id: 2,
      title: "Task Management App",
      description:
        "Built a full-stack task management application with authentication, task tracking, and reporting features.",
      company: "Personal Project",
      completionDate: "August 2023",
      skills: ["React.js", "Node.js", "MongoDB", "Express"],
      imageUrl: "",
      demoLink: "https://tasks-app.example.com",
      featured: true,
    },
    {
      id: 3,
      title: "Restaurant Booking System",
      description:
        "Developed a booking system for a local restaurant with table management and reservation features.",
      company: "Local Business",
      completionDate: "May 2023",
      skills: ["JavaScript", "Firebase", "HTML/CSS"],
      imageUrl: "",
      demoLink: "https://booking-system.example.com",
      featured: false,
    },
  ];

  // Use authenticated user data with mock skills and projects
  const profile = {
    name: user?.name || "",
    title: user?.title || "",
    university: user?.university || "",
    graduationYear: user?.graduation_year || "",
    bio: user?.bio || "",
    image: user?.avatar_url || "",
    contact: {
      email: user?.email || "",
      phone: user?.phone || "",
      linkedIn: user?.linkedin_url || "",
      github: user?.github_url || "",
    },
    skills: mockSkills,
    projects: mockProjects,
    certifications: user?.certifications || [],
    mentorship: user?.mentorship || [],
    settings: {
      isPublic: user?.settings?.is_public || true,
      showContact: user?.settings?.show_contact || true,
      showProjects: user?.settings?.show_projects || true,
      showCertifications: user?.settings?.show_certifications || true,
      showMentorship: user?.settings?.show_mentorship || true,
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Digital Portfolio
          </h2>
          <p className="text-muted-foreground">
            Showcase your skills, projects, and achievements
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsEditing(false)}>Save Changes</Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                Edit Portfolio
              </Button>
              <Button>Share Portfolio</Button>
            </>
          )}
        </div>
      </div>

      <Tabs defaultValue="view" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="view">View Portfolio</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="view" className="space-y-6">
          {/* Profile Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                <div className="relative h-32 w-32 rounded-full overflow-hidden bg-muted">
                  {profile.image ? (
                    <Image
                      src={profile.image}
                      alt={profile.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-3xl font-bold text-muted-foreground">
                      {profile.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                  )}
                </div>
                <div className="text-center md:text-left">
                  <h3 className="text-2xl font-bold">{profile.name}</h3>
                  <p className="text-lg text-muted-foreground">
                    {profile.title}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    University of Dhaka, Class of 2025
                  </p>

                  {profile.settings.showContact && (
                    <div className="flex flex-wrap gap-3 mt-4">
                      <a
                        href={`mailto:${profile.contact.email}`}
                        className="text-sm text-blue-500 hover:underline"
                      >
                        {profile.contact.email}
                      </a>
                      <a
                        href={`https://${profile.contact.linkedIn}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-500 hover:underline"
                      >
                        LinkedIn
                      </a>
                      <a
                        href={`https://${profile.contact.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-500 hover:underline"
                      >
                        GitHub
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-medium mb-2">About Me</h4>
                <p className="text-muted-foreground">{profile.bio}</p>
              </div>
            </CardContent>
          </Card>

          {/* Skills Section */}
          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
              <CardDescription>
                My technical expertise and competencies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {profile.skills.map((skill) => (
                  <div
                    key={skill.name}
                    className="flex justify-between items-center p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{skill.name}</span>
                      <Badge variant="outline">{skill.category}</Badge>
                      {skill.verified && (
                        <Badge className="bg-green-500 hover:bg-green-600">
                          Verified
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center">
                      {Array(5)
                        .fill(null)
                        .map((_, i) => (
                          <svg
                            key={i}
                            className={`h-4 w-4 ${
                              i < skill.level ? "fill-primary" : "fill-muted"
                            }`}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                          >
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Projects Section */}
          {profile.settings.showProjects && (
            <Card>
              <CardHeader>
                <CardTitle>Projects</CardTitle>
                <CardDescription>
                  My completed projects and work samples
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  {profile.projects
                    .filter((project) => project.featured || isEditing)
                    .map((project) => (
                      <Card key={project.id}>
                        <div className="h-48 w-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-lg flex items-center justify-center text-white font-bold">
                          {project.title}
                        </div>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between">
                            <CardTitle className="text-base">
                              {project.title}
                            </CardTitle>
                            {project.featured && <Badge>Featured</Badge>}
                          </div>
                          <CardDescription>
                            {project.company} • {project.completionDate}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <p className="text-sm text-muted-foreground mb-4">
                            {project.description}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {project.skills.map((skill) => (
                              <Badge
                                key={skill}
                                variant="outline"
                                className="text-xs"
                              >
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                        <CardFooter>
                          <a
                            href={project.demoLink}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="outline" size="sm">
                              View Demo
                            </Button>
                          </a>
                        </CardFooter>
                      </Card>
                    ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  View All Projects
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Certifications Section */}
          {profile.settings.showCertifications &&
            profile.certifications.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Certifications</CardTitle>
                  <CardDescription>
                    My professional certifications and achievements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {profile.certifications.map((cert, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                          <div>
                            <h4 className="font-medium">{cert.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {cert.issuedBy} • {cert.date}
                            </p>
                          </div>
                          <div className="mt-2 md:mt-0">
                            <Badge variant="outline">
                              Credential ID: {cert.credentialId}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

          {/* Mentorship Section */}
          {profile.settings.showMentorship && profile.mentorship.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Mentorship</CardTitle>
                <CardDescription>
                  My learning journey with industry professionals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profile.mentorship.map((mentorship, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <h4 className="font-medium">
                        Mentored by {mentorship.mentor}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {mentorship.company} • {mentorship.duration}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {mentorship.topics.map((topic) => (
                          <Badge
                            key={topic}
                            variant="secondary"
                            className="text-xs"
                          >
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Settings</CardTitle>
              <CardDescription>
                Customize your public portfolio page
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="public-profile">Public Profile</Label>
                    <p className="text-sm text-muted-foreground">
                      Make your portfolio visible to others
                    </p>
                  </div>
                  <Switch
                    id="public-profile"
                    checked={profile.settings.isPublic}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="show-contact">
                      Show Contact Information
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Display your contact details on your public profile
                    </p>
                  </div>
                  <Switch
                    id="show-contact"
                    checked={profile.settings.showContact}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="show-projects">Show Projects</Label>
                    <p className="text-sm text-muted-foreground">
                      Display your projects on your public profile
                    </p>
                  </div>
                  <Switch
                    id="show-projects"
                    checked={profile.settings.showProjects}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="show-certifications">
                      Show Certifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Display your certifications on your public profile
                    </p>
                  </div>
                  <Switch
                    id="show-certifications"
                    checked={profile.settings.showCertifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="show-mentorship">Show Mentorship</Label>
                    <p className="text-sm text-muted-foreground">
                      Display your mentorship experiences on your public profile
                    </p>
                  </div>
                  <Switch
                    id="show-mentorship"
                    checked={profile.settings.showMentorship}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="portfolio-url">Your Portfolio URL</Label>
                <div className="flex items-center">
                  <span className="bg-muted px-3 py-2 rounded-l-md text-sm text-muted-foreground">
                    IndustryHuntBD.com/portfolio/
                  </span>
                  <Input
                    id="portfolio-url"
                    value="johndoe"
                    className="rounded-l-none"
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button className="w-full">Save Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
