"use client";

import { useState, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Award, CheckCircle, XCircle, Clock } from "lucide-react";
import Replicate from "replicate";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
}

const mockAssessments = [
  {
    name: "JavaScript",
    category: "Programming",
    questions: 10,
    level: "medium",
  },
  {
    name: "TypeScript",
    category: "Programming",
    questions: 10,
    level: "medium",
  },
  {
    name: "React",
    category: "Frontend",
    questions: 8,
    level: "easy",
  },
  {
    name: "Node.js",
    category: "Backend",
    questions: 12,
    level: "difficult",
  },
  {
    name: "UI/UX Design",
    category: "Design",
    questions: 7,
    level: "easy",
  },
];

export default function SkillsPage() {
  const [activeQuizSkill, setActiveQuizSkill] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mySkills, setMySkills] = useState<any[]>([]);
  const [availableSkills, setAvailableSkills] = useState<any[]>([]);
  const [isCreatingAssessment, setIsCreatingAssessment] = useState(false);
  const [customAssessment, setCustomAssessment] = useState({
    topic: "",
    description: "",
    questionCount: 5,
    difficulty: "medium",
  });

  const replicate = new Replicate({
    auth: process.env.NEXT_PUBLIC_REPLICATE_API_TOKEN,
  });

  // Add a useEffect to fetch the real skills data
  useEffect(() => {
    async function fetchSkills() {
      try {
        // Get current user info
        const { data: userSession } = await supabase.auth.getSession();
        const userId = userSession?.session?.user?.id;

        if (!userId) {
          console.error("User not authenticated");
          return;
        }

        // Fetch user's existing skills
        const { data: skillsData, error: skillsError } = await supabase
          .from("user_skills")
          .select(
            `
            id,
            level,
            verified,
            skills (
              id,
              name,
              category
            )
          `
          )
          .eq("user_id", userId);

        if (skillsError) {
          console.error("Error fetching skills:", skillsError);
        } else {
          setMySkills(skillsData || []);
        }

        // Fetch available skills for assessment
        const { data: availableData, error: availableError } = await supabase
          .from("skills")
          .select("*")
          .not(
            "id",
            "in",
            (skillsData || []).map((s: any) => s.skills.id).join(",")
          );

        if (availableError) {
          console.error("Error fetching available skills:", availableError);
        } else {
          // Format the available skills data
          const formattedAvailable = (availableData || []).map(
            (skill: any) => ({
              name: skill.name,
              category: skill.category,
              questions: 10, // Default value
              level: "medium", // Default value
            })
          );
          setAvailableSkills(formattedAvailable);
        }
      } catch (error) {
        console.error("Error in fetchSkills:", error);
      }
    }

    fetchSkills();
  }, []);

  // Calculate duration based on question count and difficulty
  const calculateDuration = (questions: number, level: string) => {
    // Base time per question in minutes
    const baseTimePerQuestion = {
      easy: 1,
      medium: 1.5,
      difficult: 2,
    };

    // Calculate total minutes
    const totalMinutes = Math.ceil(
      questions * baseTimePerQuestion[level as keyof typeof baseTimePerQuestion]
    );

    // Format duration
    if (totalMinutes < 60) {
      return `${totalMinutes} min`;
    } else {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
  };

  // Function to generate questions using Claude
  const generateQuestions = async (skill: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Try to find the skill in availableSkills for question count, else use default
      const skillInfo = availableSkills.find((s) => s.name === skill);
      const questionCount = skillInfo ? skillInfo.questions : 10;

      const response = await fetch("/api/generate-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          skill,
          questionCount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate questions");
      }

      if (!data.questions || !Array.isArray(data.questions)) {
        throw new Error("Invalid response format from server");
      }

      setGeneratedQuestions(data.questions);
    } catch (error) {
      console.error("Error generating questions:", error);
      setError(
        error instanceof Error ? error.message : "Failed to generate questions"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for starting a quiz
  const startQuiz = async (skillName: string) => {
    setActiveQuizSkill(skillName);
    setCurrentQuestion(0);
    setAnswers([]);
    setQuizCompleted(false);
    setIsAnswerCorrect(null);
    await generateQuestions(skillName);
  };

  // Handler for answering a question
  const answerQuestion = (answer: string) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    // Check if answer is correct
    const isCorrect =
      answer === generatedQuestions[currentQuestion].correctAnswer;
    setIsAnswerCorrect(isCorrect);

    // Wait 1.5 seconds before moving to next question
    setTimeout(() => {
      setIsAnswerCorrect(null);

      // Check if we've reached the end of the quiz
      if (newAnswers.length >= generatedQuestions.length) {
        setQuizCompleted(true);
      } else {
        setCurrentQuestion((prev) => prev + 1);
      }
    }, 1500);
  };

  // Calculate the quiz result
  const calculateResult = () => {
    if (!activeQuizSkill || generatedQuestions.length === 0) return 0;

    let correctCount = 0;
    answers.forEach((answer, index) => {
      if (answer === generatedQuestions[index].correctAnswer) {
        correctCount++;
      }
    });

    // Calculate percentage first
    const percentage = (correctCount / generatedQuestions.length) * 100;

    // Convert percentage to 5-point scale
    // 90-100% = 5, 70-89% = 4, 50-69% = 3, 30-49% = 2, 0-29% = 1
    if (percentage >= 90) return 5;
    if (percentage >= 70) return 4;
    if (percentage >= 50) return 3;
    if (percentage >= 30) return 2;
    return 1;
  };

  // Reset quiz state
  const resetQuiz = () => {
    setActiveQuizSkill(null);
    setCurrentQuestion(0);
    setAnswers([]);
    setQuizCompleted(false);
  };

  // Function to get level color classes
  const getLevelColorClass = (level: string) => {
    switch (level) {
      case "easy":
        return "text-green-600";
      case "medium":
        return "text-yellow-600";
      case "difficult":
        return "text-red-600";
      default:
        return "";
    }
  };

  // Function to get skill level color for progress bars
  const getSkillLevelColor = (level: number) => {
    if (level >= 4) return "bg-green-500";
    if (level >= 3) return "bg-blue-500";
    if (level >= 2) return "bg-yellow-500";
    return "bg-red-500";
  };

  // Add new function to handle custom assessment creation
  const handleCreateCustomAssessment = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/generate-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          skill: customAssessment.topic,
          questionCount: customAssessment.questionCount,
          description: customAssessment.description,
          difficulty: customAssessment.difficulty,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate questions");
      }

      if (!data.questions || !Array.isArray(data.questions)) {
        throw new Error("Invalid response format from server");
      }

      setGeneratedQuestions(data.questions);
      setActiveQuizSkill(customAssessment.topic);
      setCurrentQuestion(0);
      setAnswers([]);
      setQuizCompleted(false);
      setIsAnswerCorrect(null);
      setIsCreatingAssessment(false);
    } catch (error) {
      console.error("Error creating custom assessment:", error);
      setError(
        error instanceof Error ? error.message : "Failed to create assessment"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">My Skills</h2>
          <p className="text-muted-foreground text-lg">
            Track your skill levels and take assessments to validate your
            expertise
          </p>
        </div>
        <Button className="px-6 py-5 font-medium" size="lg">
          <Award className="mr-2 h-5 w-5" />
          Download Skill Certificate
        </Button>
      </div>

      <Tabs defaultValue="my-skills" className="mb-6">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="my-skills">My Skills</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
        </TabsList>

        <TabsContent value="my-skills" className="space-y-8">
          {/* Skills Overview */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl mb-2">Skills Overview</CardTitle>
              <CardDescription className="text-base">
                Your current skill ratings and certifications
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="space-y-8">
                {mySkills.map((skill) => (
                  <div key={skill.name} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="font-medium text-lg">
                          {skill.name}
                        </span>
                        <Badge variant="outline" className="ml-3 px-3 py-1">
                          {skill.category}
                        </Badge>
                        {skill.verified && (
                          <Badge className="ml-3 bg-green-500 hover:bg-green-600 px-3 py-1">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      <span className="text-base font-semibold">
                        Level {skill.level}/5
                      </span>
                    </div>
                    <Progress
                      value={skill.level * 20}
                      className={`h-2.5 ${getSkillLevelColor(skill.level)}`}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="pt-2 pb-6 px-6">
              <Button variant="outline" className="w-full py-5 text-base">
                Add Manual Skill Entry
              </Button>
            </CardFooter>
          </Card>

          {/* Skill Recommendations */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl mb-2">Rated Assessments</CardTitle>
              <CardDescription className="text-base">
                These count towards your official skill rating
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="grid gap-6 md:grid-cols-3">
                {["TypeScript", "Docker", "AWS"].map((skill) => (
                  <Card
                    key={skill}
                    className="shadow-sm hover:shadow-md transition-shadow duration-300"
                  >
                    <CardHeader className="p-5">
                      <CardTitle className="text-lg">{skill}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 pt-0">
                      <p className="text-sm text-muted-foreground">
                        High demand in 85% of job listings in your target roles.
                      </p>
                    </CardContent>
                    <CardFooter className="p-5 pt-2">
                      <Button
                        variant="outline"
                        className="w-full py-4"
                        onClick={() => startQuiz(skill)}
                      >
                        <BookOpen className="mr-2 h-4 w-4" /> Take Assessment
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assessments" className="space-y-6">
          {/* Available Assessments */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl mb-2">
                Self-Testing Assessments
              </CardTitle>
              <CardDescription className="text-base">
                Practice and self-test your skills (not rated)
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {mockAssessments.map((skill) => (
                  <Card
                    key={skill.name}
                    className="shadow-sm hover:shadow-md transition-shadow duration-300"
                  >
                    <CardHeader className="p-5">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg mb-1">
                            {skill.name}
                          </CardTitle>
                          <CardDescription>{skill.category}</CardDescription>
                        </div>
                        <Badge
                          className={`${
                            skill.level === "easy"
                              ? "bg-green-500 hover:bg-green-600"
                              : skill.level === "medium"
                              ? "bg-yellow-500 hover:bg-yellow-600"
                              : "bg-red-500 hover:bg-red-600"
                          } px-3 py-1`}
                        >
                          {skill.level.charAt(0).toUpperCase() +
                            skill.level.slice(1)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-5 pt-2">
                      <div className="grid grid-cols-2 gap-5 text-sm mt-3">
                        <div className="flex items-center">
                          <BookOpen className="h-4 w-4 mr-2 text-muted-foreground" />
                          <div>
                            <p className="text-muted-foreground mb-1">
                              Questions
                            </p>
                            <p className="font-medium">{skill.questions}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                          <div>
                            <p className="text-muted-foreground mb-1">
                              Duration
                            </p>
                            <p className="font-medium">
                              {calculateDuration(skill.questions, skill.level)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="p-5 pt-2">
                      <Button
                        className="w-full py-4 font-medium"
                        onClick={() => startQuiz(skill.name)}
                      >
                        Start Assessment
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Create Custom Assessment */}
          <Card className="shadow-sm mt-8">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl mb-2">
                Create Custom Assessment
              </CardTitle>
              <CardDescription className="text-base">
                Create your own assessment topic and generate AI-powered
                questions
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="space-y-6">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="topic">Assessment Topic</Label>
                    <Input
                      id="topic"
                      placeholder="e.g., Advanced React Hooks, System Design Patterns"
                      value={customAssessment.topic}
                      onChange={(e) =>
                        setCustomAssessment({
                          ...customAssessment,
                          topic: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">
                      Topic Description (Optional)
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Provide more context about the topic to generate better questions"
                      value={customAssessment.description}
                      onChange={(e) =>
                        setCustomAssessment({
                          ...customAssessment,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="questionCount">Number of Questions</Label>
                      <Select
                        value={customAssessment.questionCount.toString()}
                        onValueChange={(value) =>
                          setCustomAssessment({
                            ...customAssessment,
                            questionCount: parseInt(value),
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select count" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 Questions</SelectItem>
                          <SelectItem value="10">10 Questions</SelectItem>
                          <SelectItem value="15">15 Questions</SelectItem>
                          <SelectItem value="20">20 Questions</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="difficulty">Difficulty Level</Label>
                      <Select
                        value={customAssessment.difficulty}
                        onValueChange={(value) =>
                          setCustomAssessment({
                            ...customAssessment,
                            difficulty: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="difficult">Difficult</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-2 pb-6 px-6">
              <Button
                className="w-full py-5 text-base"
                onClick={handleCreateCustomAssessment}
                disabled={!customAssessment.topic || isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating Questions...
                  </>
                ) : (
                  <>
                    <BookOpen className="mr-2 h-5 w-5" />
                    Create Assessment
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Skill Assessment Quiz Dialog */}
      <Dialog
        open={activeQuizSkill !== null}
        onOpenChange={(open) => !open && resetQuiz()}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-2xl">
              {isLoading
                ? "Loading Assessment"
                : error
                ? "Error"
                : quizCompleted
                ? "Assessment Complete"
                : `${activeQuizSkill} Skill Assessment`}
            </DialogTitle>
            {!isLoading && !error && !quizCompleted && (
              <DialogDescription className="text-base mt-2">
                Question {currentQuestion + 1} of {generatedQuestions.length}
              </DialogDescription>
            )}
          </DialogHeader>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <span className="ml-4 text-lg">Generating questions...</span>
            </div>
          ) : error ? (
            <div className="py-10 text-center">
              <div className="text-red-500 mb-6 text-lg">Error: {error}</div>
              <Button
                onClick={() => {
                  setError(null);
                  if (activeQuizSkill) {
                    generateQuestions(activeQuizSkill);
                  }
                }}
                className="px-6 py-2"
              >
                Try Again
              </Button>
            </div>
          ) : !quizCompleted ? (
            <>
              {generatedQuestions.length > 0 && (
                <div className="py-6">
                  <h3 className="font-medium text-lg mb-6">
                    {generatedQuestions[currentQuestion]?.question}
                  </h3>
                  <RadioGroup className="space-y-4">
                    {generatedQuestions[currentQuestion]?.options.map(
                      (option: string, index: number) => (
                        <div
                          key={index}
                          className={`flex items-center space-x-3 p-3 rounded-md border ${
                            isAnswerCorrect !== null &&
                            option ===
                              generatedQuestions[currentQuestion].correctAnswer
                              ? "border-green-500 bg-green-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <RadioGroupItem
                            id={`option-${index}`}
                            value={option}
                            onClick={() => answerQuestion(option)}
                            disabled={isAnswerCorrect !== null}
                            className="h-5 w-5"
                          />
                          <Label
                            htmlFor={`option-${index}`}
                            className="flex-1 cursor-pointer text-base"
                          >
                            {option}
                          </Label>
                        </div>
                      )
                    )}
                  </RadioGroup>
                  {isAnswerCorrect !== null && (
                    <div
                      className={`mt-6 p-4 rounded-md flex items-center ${
                        isAnswerCorrect
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {isAnswerCorrect ? (
                        <>
                          <CheckCircle className="h-5 w-5 mr-2" />
                          <span>Correct answer!</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-5 w-5 mr-2" />
                          <span>
                            Incorrect. The correct answer is:{" "}
                            {generatedQuestions[currentQuestion].correctAnswer}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
              <DialogFooter className="pt-4">
                <Button
                  variant="outline"
                  onClick={resetQuiz}
                  className="px-6 py-2"
                >
                  Cancel
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <div className="py-8 flex flex-col items-center justify-center">
                <div
                  className={`text-8xl font-bold mb-6 ${
                    calculateResult() >= 4
                      ? "text-green-500"
                      : calculateResult() >= 3
                      ? "text-blue-500"
                      : "text-yellow-500"
                  }`}
                >
                  {calculateResult()}/5
                </div>
                <p className="text-center text-lg mb-6 max-w-md mx-auto">
                  {calculateResult() >= 4
                    ? "Excellent! You've demonstrated advanced knowledge."
                    : calculateResult() >= 3
                    ? "Good job! You have solid foundational knowledge."
                    : "Keep learning! We recommend focusing on this skill more."}
                </p>
                <div className="text-base text-muted-foreground mb-6 flex items-center">
                  <span className="font-medium">
                    {
                      answers.filter(
                        (answer, index) =>
                          answer === generatedQuestions[index].correctAnswer
                      ).length
                    }{" "}
                    out of {generatedQuestions.length} questions correct
                  </span>
                  <span className="mx-2">•</span>
                  <span>
                    {Math.round(
                      (answers.filter(
                        (answer, index) =>
                          answer === generatedQuestions[index].correctAnswer
                      ).length /
                        generatedQuestions.length) *
                        100
                    )}
                    % accuracy
                  </span>
                </div>
                <Progress
                  value={calculateResult() * 20}
                  className={`h-3 w-full mb-6 ${
                    calculateResult() >= 4
                      ? "bg-green-500"
                      : calculateResult() >= 3
                      ? "bg-blue-500"
                      : calculateResult() >= 2
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                />
              </div>
              <DialogFooter className="pt-4">
                <Button variant="outline" className="mr-2 px-6 py-2">
                  View Details
                </Button>
                <Button onClick={resetQuiz} className="px-6 py-2">
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
