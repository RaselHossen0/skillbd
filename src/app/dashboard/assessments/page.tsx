"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface AssessmentQuestion {
  id: string;
  question: string;
  options: string[];
  correct_option: number;
}

export default function AssessmentsPage() {
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctOption, setCorrectOption] = useState(0);

  const handleAddQuestion = () => {
    if (!question.trim() || options.some((opt) => !opt.trim())) return;
    setQuestions([
      ...questions,
      {
        id: Math.random().toString(36).slice(2),
        question,
        options: [...options],
        correct_option: correctOption,
      },
    ]);
    setQuestion("");
    setOptions(["", "", "", ""]);
    setCorrectOption(0);
  };

  const handleDelete = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Assessment Questions
        </h2>
        <p className="text-muted-foreground mt-1.5">
          Create and manage assessment questions for your job applicants
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Add New Question</CardTitle>
          <CardDescription>
            Fill in the question and options. Mark the correct answer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="question">Question</Label>
              <Input
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Enter your question here"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...options];
                      newOpts[idx] = e.target.value;
                      setOptions(newOpts);
                    }}
                    placeholder={`Option ${idx + 1}`}
                  />
                  <input
                    type="radio"
                    name="correctOption"
                    checked={correctOption === idx}
                    onChange={() => setCorrectOption(idx)}
                  />
                  <span className="text-xs">Correct</span>
                </div>
              ))}
            </div>
            <Button
              onClick={handleAddQuestion}
              disabled={!question.trim() || options.some((opt) => !opt.trim())}
            >
              Add Question
            </Button>
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-6">
        {questions.length > 0 ? (
          questions.map((q, idx) => (
            <Card key={q.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Q{idx + 1}: {q.question}
                  </CardTitle>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(q.id)}
                  >
                    Delete
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {q.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Badge
                        variant={q.correct_option === i ? "default" : "outline"}
                      >
                        {String.fromCharCode(65 + i)}
                      </Badge>
                      <span>{opt}</span>
                      {q.correct_option === i && (
                        <span className="text-xs text-green-600 ml-2">
                          (Correct)
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <p className="text-muted-foreground text-center mb-6">
                No assessment questions added yet.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
