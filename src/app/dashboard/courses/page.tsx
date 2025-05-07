"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const allCourses = [
    {
      id: 1,
      title: "React.js Fundamentals",
      image: "/placeholder-image.jpg",
      mentor: "Sarah Johnson",
      mentorCompany: "TechVision Ltd",
      duration: "12 hours",
      level: "BEGINNER",
      price: "$49",
      rating: 4.8,
      studentsEnrolled: 342,
      description: "Master the fundamentals of React.js including components, props, state, hooks, and build your first React application.",
      tags: ["Frontend", "JavaScript", "React"],
    },
    {
      id: 2,
      title: "Advanced Node.js Development",
      image: "/placeholder-image.jpg",
      mentor: "Ahmed Khan",
      mentorCompany: "Brain Station 23",
      duration: "16 hours",
      level: "INTERMEDIATE",
      price: "$69",
      rating: 4.7,
      studentsEnrolled: 215,
      description: "Dive deep into Node.js, learn advanced concepts like streams, buffers, clusters, and build scalable backend applications.",
      tags: ["Backend", "JavaScript", "Node.js"],
    },
    {
      id: 3,
      title: "UI/UX Design Principles",
      image: "/placeholder-image.jpg",
      mentor: "Tania Rahman",
      mentorCompany: "DesignHub BD",
      duration: "10 hours",
      level: "BEGINNER",
      price: "$39",
      rating: 4.9,
      studentsEnrolled: 430,
      description: "Learn the core principles of UI/UX design, wireframing, prototyping, and user research to create intuitive user experiences.",
      tags: ["Design", "UI/UX", "Figma"],
    },
    {
      id: 4,
      title: "Full-Stack Web Development",
      image: "/placeholder-image.jpg",
      mentor: "Rafiq Islam",
      mentorCompany: "NewsCred",
      duration: "30 hours",
      level: "INTERMEDIATE",
      price: "$99",
      rating: 4.6,
      studentsEnrolled: 280,
      description: "Become a full-stack developer with this comprehensive course covering frontend, backend, databases, and deployment.",
      tags: ["Full-Stack", "JavaScript", "React", "Node.js", "MongoDB"],
    },
    {
      id: 5,
      title: "Mobile App Development with React Native",
      image: "/placeholder-image.jpg",
      mentor: "Maliha Kabir",
      mentorCompany: "AppLab BD",
      duration: "20 hours",
      level: "INTERMEDIATE",
      price: "$79",
      rating: 4.7,
      studentsEnrolled: 195,
      description: "Build cross-platform mobile apps for iOS and Android using React Native and JavaScript.",
      tags: ["Mobile", "React Native", "JavaScript"],
    },
    {
      id: 6,
      title: "Data Science with Python",
      image: "/placeholder-image.jpg",
      mentor: "Zafar Ahmed",
      mentorCompany: "DataSolve BD",
      duration: "24 hours",
      level: "ADVANCED",
      price: "$89",
      rating: 4.8,
      studentsEnrolled: 167,
      description: "Master data analysis, visualization, machine learning and more with Python, pandas, and scikit-learn.",
      tags: ["Data Science", "Python", "Machine Learning"],
    },
  ];

  const enrolledCourses = [
    {
      id: 1,
      title: "React.js Fundamentals",
      image: "/placeholder-image.jpg",
      mentor: "Sarah Johnson",
      progress: 65,
      lastAccessed: "2 days ago",
      nextLesson: "Working with React Hooks",
    },
    {
      id: 4,
      title: "Full-Stack Web Development",
      image: "/placeholder-image.jpg",
      mentor: "Rafiq Islam",
      progress: 25,
      lastAccessed: "1 week ago",
      nextLesson: "Building RESTful APIs with Express",
    },
  ];

  // Filter courses based on search query
  const filteredCourses = allCourses.filter(course => {
    return course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
           course.mentor.toLowerCase().includes(searchQuery.toLowerCase()) ||
           course.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Courses</h2>
          <p className="text-muted-foreground">
            Expand your skills with our industry-focused courses
          </p>
        </div>
      </div>

      <Tabs defaultValue="all-courses">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all-courses">All Courses</TabsTrigger>
          <TabsTrigger value="my-courses">My Courses</TabsTrigger>
        </TabsList>

        <TabsContent value="all-courses" className="space-y-6">
          {/* Search Bar */}
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0">
            <div className="flex-1">
              <Input
                placeholder="Search courses, topics, mentors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
              <Button variant="outline">Filter</Button>
              <Button variant="outline">Sort by: Popular</Button>
            </div>
          </div>

          {/* Course Listing */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course) => (
                <Card key={course.id} className="flex flex-col">
                  <div className="relative h-48 w-full">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-lg flex items-center justify-center text-white font-bold text-xl">
                      {course.title}
                    </div>
                  </div>
                  <CardHeader className="pb-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{course.title}</CardTitle>
                        <CardDescription className="pt-1">
                          by {course.mentor} • {course.mentorCompany}
                        </CardDescription>
                      </div>
                      <Badge className={
                        course.level === "BEGINNER" ? "bg-green-500 hover:bg-green-600" :
                        course.level === "INTERMEDIATE" ? "bg-yellow-500 hover:bg-yellow-600" :
                        "bg-red-500 hover:bg-red-600"
                      }>
                        {course.level.charAt(0) + course.level.slice(1).toLowerCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 pt-4">
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {course.description}
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Duration</p>
                        <p className="font-medium">{course.duration}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Price</p>
                        <p className="font-medium">{course.price}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Rating</p>
                        <p className="font-medium">{course.rating}/5 ⭐</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Students</p>
                        <p className="font-medium">{course.studentsEnrolled}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 pt-4">
                      {course.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-4">
                    <Button className="w-full">Enroll Now</Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full flex items-center justify-center p-12">
                <div className="text-center">
                  <h3 className="text-lg font-medium">No courses found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="my-courses" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {enrolledCourses.map((course) => (
              <Card key={course.id} className="flex flex-col">
                <div className="relative h-40 w-full">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-lg flex items-center justify-center text-white font-bold text-xl">
                    {course.title}
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <CardDescription className="pt-1">
                    Instructor: {course.mentor}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="mb-2">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Progress: {course.progress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div 
                        className="bg-primary h-2.5 rounded-full" 
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Last Accessed</p>
                      <p className="font-medium">{course.lastAccessed}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Next Lesson</p>
                      <p className="font-medium">{course.nextLesson}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="grid grid-cols-2 gap-2 border-t pt-4">
                  <Button variant="outline">View Certificate</Button>
                  <Button>Continue Learning</Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="pt-4">
            <h3 className="text-lg font-medium mb-4">Recommended Next Courses</h3>
            <div className="grid gap-6 md:grid-cols-3">
              {allCourses
                .filter(course => !enrolledCourses.some(enrolled => enrolled.id === course.id))
                .slice(0, 3)
                .map((course) => (
                  <Card key={course.id} className="flex flex-col">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{course.title}</CardTitle>
                      <CardDescription className="pt-1">
                        by {course.mentor}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {course.description}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <Badge className={
                          course.level === "BEGINNER" ? "bg-green-500 hover:bg-green-600" :
                          course.level === "INTERMEDIATE" ? "bg-yellow-500 hover:bg-yellow-600" :
                          "bg-red-500 hover:bg-red-600"
                        }>
                          {course.level.charAt(0) + course.level.slice(1).toLowerCase()}
                        </Badge>
                        <span className="font-medium">{course.price}</span>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t pt-4">
                      <Button className="w-full" variant="outline">View Course</Button>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 