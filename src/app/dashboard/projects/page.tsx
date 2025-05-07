"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPaid, setFilterPaid] = useState("all");

  const projects = [
    {
      id: 1,
      title: "E-commerce Website Development",
      company: "FashionBD Retail",
      description: "Develop a complete e-commerce platform with user authentication, product catalog, shopping cart, and payment integration.",
      isPaid: true,
      budget: "$500",
      deadline: "3 weeks",
      skills: ["React.js", "Node.js", "MongoDB", "Payment Gateway"],
      applicants: 12,
    },
    {
      id: 2,
      title: "Mobile App UI Design for Food Delivery",
      company: "Foodie Express",
      description: "Design a modern and intuitive UI for a food delivery mobile application. Include order tracking, restaurant browsing, and checkout flows.",
      isPaid: true,
      budget: "$300",
      deadline: "2 weeks",
      skills: ["UI/UX", "Figma", "Mobile Design", "Adobe XD"],
      applicants: 8,
    },
    {
      id: 3,
      title: "Social Media Marketing Campaign",
      company: "Tech Startup BD",
      description: "Create and execute a social media marketing campaign to increase brand awareness and user engagement for a new tech product.",
      isPaid: true,
      budget: "$250",
      deadline: "1 month",
      skills: ["Social Media Marketing", "Content Creation", "Analytics"],
      applicants: 5,
    },
    {
      id: 4,
      title: "Database Migration and Optimization",
      company: "HealthTech Solutions",
      description: "Migrate existing MySQL database to MongoDB and optimize for performance. Document the process and train the team on the new system.",
      isPaid: true,
      budget: "$400",
      deadline: "3 weeks",
      skills: ["MongoDB", "MySQL", "Database Architecture", "Documentation"],
      applicants: 3,
    },
    {
      id: 5,
      title: "Content Writing for Tech Blog",
      company: "TechNews BD",
      description: "Write engaging articles on the latest technology trends, product reviews, and tutorials for a popular tech blog.",
      isPaid: false,
      budget: null,
      deadline: "Ongoing",
      skills: ["Content Writing", "SEO", "Technical Knowledge"],
      applicants: 15,
    },
    {
      id: 6,
      title: "Brand Identity Design",
      company: "Green Earth NGO",
      description: "Design a complete brand identity including logo, color scheme, typography, and brand guidelines for an environmental NGO.",
      isPaid: false,
      budget: null,
      deadline: "2 weeks",
      skills: ["Graphic Design", "Branding", "Illustrator", "Typography"],
      applicants: 10,
    }
  ];

  // Filter projects based on search query and paid filter
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesPaidFilter = 
      filterPaid === "all" ? true :
      filterPaid === "paid" ? project.isPaid :
      !project.isPaid;
    
    return matchesSearch && matchesPaidFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Project Marketplace</h2>
          <p className="text-muted-foreground">
            Apply for real-world projects to gain experience and build your portfolio
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0">
        <div className="flex-1">
          <Input
            placeholder="Search projects, skills, companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-full md:w-[200px]">
          <Select value={filterPaid} onValueChange={setFilterPaid}>
            <SelectTrigger>
              <SelectValue placeholder="Payment" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Filter by payment</SelectLabel>
                <SelectItem value="all">All Projects</SelectItem>
                <SelectItem value="paid">Paid Only</SelectItem>
                <SelectItem value="unpaid">Unpaid Only</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full md:w-[200px]">
          <Select defaultValue="newest">
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Sort by</SelectLabel>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="budget_high">Budget (High to Low)</SelectItem>
                <SelectItem value="budget_low">Budget (Low to High)</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Project Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <Card key={project.id} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold">{project.title}</CardTitle>
                    <CardDescription>{project.company}</CardDescription>
                  </div>
                  {project.isPaid ? (
                    <Badge className="bg-green-500 hover:bg-green-600">Paid</Badge>
                  ) : (
                    <Badge variant="secondary">Volunteer</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground mb-4">
                  {project.description}
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Budget:</span>
                    <span className="font-medium">{project.budget || "Volunteer"}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Deadline:</span>
                    <span className="font-medium">{project.deadline}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Applicants:</span>
                    <span className="font-medium">{project.applicants}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 pt-3">
                    {project.skills.map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button className="w-full">Apply Now</Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full flex items-center justify-center p-12">
            <div className="text-center">
              <h3 className="text-lg font-medium">No projects found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center space-x-2">
        <Button variant="outline" size="sm" disabled>
          Previous
        </Button>
        <Button variant="outline" size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
          1
        </Button>
        <Button variant="outline" size="sm">
          2
        </Button>
        <Button variant="outline" size="sm">
          3
        </Button>
        <Button variant="outline" size="sm">
          Next
        </Button>
      </div>
    </div>
  );
} 