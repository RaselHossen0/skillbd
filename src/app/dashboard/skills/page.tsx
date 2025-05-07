"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

export default function SkillsPage() {
  const [activeQuizSkill, setActiveQuizSkill] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Mock data for existing skills
  const mySkills = [
    { name: "JavaScript", level: 4, category: "Programming", verified: true },
    { name: "React.js", level: 3, category: "Frontend", verified: true },
    { name: "Node.js", level: 3, category: "Backend", verified: false },
    { name: "UI/UX Design", level: 4, category: "Design", verified: true },
    { name: "MongoDB", level: 2, category: "Database", verified: false },
  ];

  // Mock data for available skill assessments
  const availableSkills = [
    { name: "TypeScript", category: "Programming", questions: 10, duration: "15 min" },
    { name: "Next.js", category: "Frontend", questions: 12, duration: "20 min" },
    { name: "Python", category: "Programming", questions: 15, duration: "25 min" },
    { name: "Data Structures", category: "Computer Science", questions: 15, duration: "30 min" },
    { name: "PostgreSQL", category: "Database", questions: 10, duration: "15 min" },
    { name: "DevOps", category: "Infrastructure", questions: 12, duration: "20 min" },
  ];

  // Mock quiz questions for a skill assessment
  const quizQuestions = [
    {
      skill: "TypeScript",
      questions: [
        {
          question: "What is the correct way to define a variable with a string type in TypeScript?",
          options: [
            "var name: String = 'John'",
            "let name: string = 'John'",
            "const name = 'John'",
            "let name = String('John')"
          ],
          correctAnswer: "let name: string = 'John'"
        },
        {
          question: "Which of the following is a TypeScript-specific file extension?",
          options: [
            ".jsx",
            ".js",
            ".ts",
            ".tsx",
          ],
          correctAnswer: ".ts"
        },
        {
          question: "What is an interface in TypeScript?",
          options: [
            "A class that cannot be instantiated",
            "A way to define the structure of an object",
            "A function that implements multiple inheritance",
            "A type of module system"
          ],
          correctAnswer: "A way to define the structure of an object"
        },
      ]
    }
  ];

  // Handler for starting a quiz
  const startQuiz = (skillName: string) => {
    setActiveQuizSkill(skillName);
    setCurrentQuestion(0);
    setAnswers([]);
    setQuizCompleted(false);
  };

  // Handler for answering a question
  const answerQuestion = (answer: string) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);
    
    // Check if we've reached the end of the quiz
    const currentSkillQuiz = quizQuestions.find(q => q.skill === activeQuizSkill);
    if (currentSkillQuiz && newAnswers.length >= currentSkillQuiz.questions.length) {
      setQuizCompleted(true);
    } else {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  // Calculate the quiz result (simplified version)
  const calculateResult = () => {
    if (!activeQuizSkill) return 0;
    
    const currentSkillQuiz = quizQuestions.find(q => q.skill === activeQuizSkill);
    if (!currentSkillQuiz) return 0;
    
    let correctCount = 0;
    answers.forEach((answer, index) => {
      if (index < currentSkillQuiz.questions.length && answer === currentSkillQuiz.questions[index].correctAnswer) {
        correctCount++;
      }
    });
    
    return Math.round((correctCount / currentSkillQuiz.questions.length) * 5);
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
            Track your skill levels and take assessments to validate your expertise
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
              <CardDescription>Your current skill ratings and certifications</CardDescription>
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
                      <span className="text-sm font-medium">Level {skill.level}/5</span>
                    </div>
                    <Progress value={skill.level * 20} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">Add Manual Skill Entry</Button>
            </CardFooter>
          </Card>

          {/* Skill Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Recommended Skills</CardTitle>
              <CardDescription>Based on your profile and industry demand</CardDescription>
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
                      <Button variant="outline" className="w-full" onClick={() => startQuiz(skill)}>
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
              <CardDescription>Take assessments to verify your skill levels</CardDescription>
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
                          <p className="text-muted-foreground">Duration</p>
                          <p className="font-medium">{skill.duration}</p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <Button className="w-full" onClick={() => startQuiz(skill.name)}>
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
      <Dialog open={activeQuizSkill !== null} onOpenChange={(open) => !open && resetQuiz()}>
        <DialogContent className="sm:max-w-[600px]">
          {!quizCompleted ? (
            <>
              <DialogHeader>
                <DialogTitle>{activeQuizSkill} Skill Assessment</DialogTitle>
                <DialogDescription>
                  Question {currentQuestion + 1} of {
                    quizQuestions.find(q => q.skill === activeQuizSkill)?.questions.length || 0
                  }
                </DialogDescription>
              </DialogHeader>
              {activeQuizSkill && quizQuestions.find(q => q.skill === activeQuizSkill) && (
                <div className="py-4">
                  <h3 className="font-medium mb-4">
                    {quizQuestions.find(q => q.skill === activeQuizSkill)?.questions[currentQuestion]?.question}
                  </h3>
                  <RadioGroup className="space-y-3">
                    {quizQuestions.find(q => q.skill === activeQuizSkill)?.questions[currentQuestion]?.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <RadioGroupItem 
                          id={`option-${index}`} 
                          value={option}
                          onClick={() => answerQuestion(option)}
                        />
                        <Label htmlFor={`option-${index}`}>{option}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={resetQuiz}>Cancel</Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Assessment Complete!</DialogTitle>
                <DialogDescription>
                  You've completed the {activeQuizSkill} skill assessment
                </DialogDescription>
              </DialogHeader>
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
                <Progress value={calculateResult() * 20} className="h-2 w-full mb-4" />
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