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
import Replicate from "replicate";
import { supabase } from "@/lib/supabase";

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
}

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
          console.error('User not authenticated');
          return;
        }
        
        // Fetch user's existing skills
        const { data: skillsData, error: skillsError } = await supabase
          .from('user_skills')
          .select(`
            id,
            level,
            verified,
            skills (
              id,
              name,
              category
            )
          `)
          .eq('user_id', userId);
          
        if (skillsError) {
          console.error('Error fetching skills:', skillsError);
        } else {
          setMySkills(skillsData || []);
        }
        
        // Fetch available skills for assessment
        const { data: availableData, error: availableError } = await supabase
          .from('skills')
          .select('*')
          .not('id', 'in', (skillsData || []).map((s: any) => s.skills.id).join(','));
          
        if (availableError) {
          console.error('Error fetching available skills:', availableError);
        } else {
          // Format the available skills data
          const formattedAvailable = (availableData || []).map((skill: any) => ({
            name: skill.name,
            category: skill.category,
            questions: 10, // Default value
            level: 'medium' // Default value
          }));
          setAvailableSkills(formattedAvailable);
        }
      } catch (error) {
        console.error('Error in fetchSkills:', error);
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
      // Find the skill in availableSkills to get the question count
      const skillInfo = availableSkills.find((s) => s.name === skill);
      if (!skillInfo) {
        throw new Error("Skill not found");
      }

      const response = await fetch("/api/generate-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          skill,
          questionCount: skillInfo.questions,
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Skills</h2>
          <p className="text-muted-foreground">
            Track your skill levels and take assessments to validate your
            expertise
          </p>
        </div>
        <Button>Download Skill Certificate</Button>
      </div>

      <Tabs defaultValue="my-skills">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-skills">My Skills</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
        </TabsList>

        <TabsContent value="my-skills" className="space-y-6">
          {/* Skills Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Skills Overview</CardTitle>
              <CardDescription>
                Your current skill ratings and certifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mySkills.map((skill) => (
                  <div key={skill.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="font-medium">{skill.name}</span>
                        <Badge variant="outline" className="ml-2">
                          {skill.category}
                        </Badge>
                        {skill.verified && (
                          <Badge className="ml-2 bg-green-500 hover:bg-green-600">
                            Verified
                          </Badge>
                        )}
                      </div>
                      <span className="text-sm font-medium">
                        Level {skill.level}/5
                      </span>
                    </div>
                    <Progress value={skill.level * 20} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Add Manual Skill Entry
              </Button>
            </CardFooter>
          </Card>

          {/* Skill Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Recommended Skills</CardTitle>
              <CardDescription>
                Based on your profile and industry demand
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {["TypeScript", "Docker", "AWS"].map((skill) => (
                  <Card key={skill}>
                    <CardHeader className="p-4">
                      <CardTitle className="text-base">{skill}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-sm text-muted-foreground">
                        High demand in 85% of job listings in your target roles.
                      </p>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => startQuiz(skill)}
                      >
                        Take Assessment
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
          <Card>
            <CardHeader>
              <CardTitle>Available Skill Assessments</CardTitle>
              <CardDescription>
                Take assessments to verify your skill levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {availableSkills.map((skill) => (
                  <Card key={skill.name}>
                    <CardHeader className="p-4">
                      <CardTitle className="text-base">{skill.name}</CardTitle>
                      <CardDescription>{skill.category}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Questions</p>
                          <p className="font-medium">{skill.questions}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Level</p>
                          <p className="font-medium capitalize">
                            {skill.level}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-muted-foreground">Duration</p>
                          <p className="font-medium">
                            {calculateDuration(skill.questions, skill.level)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <Button
                        className="w-full"
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
        </TabsContent>
      </Tabs>

      {/* Skill Assessment Quiz Dialog */}
      <Dialog
        open={activeQuizSkill !== null}
        onOpenChange={(open) => !open && resetQuiz()}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {isLoading
                ? "Loading Assessment"
                : error
                ? "Error"
                : quizCompleted
                ? "Assessment Complete"
                : `${activeQuizSkill} Skill Assessment`}
            </DialogTitle>
            {!isLoading && !error && !quizCompleted && (
              <DialogDescription>
                Question {currentQuestion + 1} of {generatedQuestions.length}
              </DialogDescription>
            )}
          </DialogHeader>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Generating questions...</span>
            </div>
          ) : error ? (
            <div className="py-8 text-center">
              <div className="text-red-500 mb-4">Error: {error}</div>
              <Button
                onClick={() => {
                  setError(null);
                  if (activeQuizSkill) {
                    generateQuestions(activeQuizSkill);
                  }
                }}
              >
                Try Again
              </Button>
            </div>
          ) : !quizCompleted ? (
            <>
              {generatedQuestions.length > 0 && (
                <div className="py-4">
                  <h3 className="font-medium mb-4">
                    {generatedQuestions[currentQuestion]?.question}
                  </h3>
                  <RadioGroup className="space-y-3">
                    {generatedQuestions[currentQuestion]?.options.map(
                      (option: string, index: number) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2"
                        >
                          <RadioGroupItem
                            id={`option-${index}`}
                            value={option}
                            onClick={() => answerQuestion(option)}
                            disabled={isAnswerCorrect !== null}
                          />
                          <Label htmlFor={`option-${index}`}>{option}</Label>
                        </div>
                      )
                    )}
                  </RadioGroup>
                  {isAnswerCorrect !== null && (
                    <div
                      className={`mt-4 p-3 rounded-md ${
                        isAnswerCorrect
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {isAnswerCorrect
                        ? "✓ Correct!"
                        : "✗ Incorrect. Try again!"}
                    </div>
                  )}
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={resetQuiz}>
                  Cancel
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <div className="py-6 flex flex-col items-center justify-center">
                <div className="text-7xl font-bold text-primary mb-4">
                  {calculateResult()}/5
                </div>
                <p className="text-center text-muted-foreground mb-4">
                  {calculateResult() >= 4
                    ? "Excellent! You've demonstrated advanced knowledge."
                    : calculateResult() >= 3
                    ? "Good job! You have solid foundational knowledge."
                    : "Keep learning! We recommend focusing on this skill more."}
                </p>
                <div className="text-sm text-muted-foreground mb-4">
                  You got{" "}
                  {
                    answers.filter(
                      (answer, index) =>
                        answer === generatedQuestions[index].correctAnswer
                    ).length
                  }{" "}
                  out of {generatedQuestions.length} questions correct.
                </div>
                <Progress
                  value={calculateResult() * 20}
                  className="h-2 w-full mb-4"
                />
              </div>
              <DialogFooter>
                <Button onClick={resetQuiz}>Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
