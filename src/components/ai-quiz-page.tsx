'use client';

import React, { useState } from 'react';
import {
  GraduationCap, Loader2, AlertCircle, RotateCcw, Trophy,
  CheckCircle2, XCircle, ArrowRight, Sparkles, Brain,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

type Difficulty = 'easy' | 'medium' | 'hard';

type AnswerState = {
  selectedIndex: number | null;
  isCorrect: boolean | null;
};

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface QuizResult {
  questions: QuizQuestion[];
}

export default function AIQuizPage() {
  const [topic, setTopic] = useState('devolution');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [numQuestions, setNumQuestions] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<AnswerState>({ selectedIndex: null, isCorrect: null });
  const [finished, setFinished] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setQuiz(null);
    setFinished(false);
    setScore(0);
    setCurrentIndex(0);
    setAnswered({ selectedIndex: null, isCorrect: null });
    try {
      const res = await fetch('/api/ai/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, difficulty, numQuestions }),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data: QuizResult = await res.json();
      setQuiz(data.questions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (idx: number) => {
    if (answered.isCorrect !== null || !quiz) return;
    const q = quiz[currentIndex];
    const correct = idx === q.correctIndex;
    setAnswered({ selectedIndex: idx, isCorrect: correct });
    if (correct) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (!quiz) return;
    if (currentIndex + 1 >= quiz.length) {
      setFinished(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setAnswered({ selectedIndex: null, isCorrect: null });
    }
  };

  const handleRetry = () => {
    setQuiz(null);
    setFinished(false);
    setScore(0);
    setCurrentIndex(0);
    setAnswered({ selectedIndex: null, isCorrect: null });
  };

  const scorePercent = quiz ? Math.round((score / quiz.length) * 100) : 0;

  // Setup screen
  if (!quiz && !loading && !error) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 p-4 md:p-8">
        <div className="max-w-xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600 rounded-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                AI Devolution Quiz
              </h1>
              <p className="text-sm text-stone-500 dark:text-stone-400">
                Test your knowledge with AI-generated questions
              </p>
            </div>
          </div>

          <Card className="border-stone-200 dark:border-stone-800">
            <CardHeader>
              <CardTitle className="text-lg">Quiz Settings</CardTitle>
              <CardDescription>Configure your quiz parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Topic</Label>
                <Input
                  placeholder="e.g., devolution, county budgets, audit process..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <Select value={difficulty} onValueChange={(v) => setDifficulty(v as Difficulty)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Questions</Label>
                  <Select value={String(numQuestions)} onValueChange={(v) => setNumQuestions(Number(v))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 Questions</SelectItem>
                      <SelectItem value="5">5 Questions</SelectItem>
                      <SelectItem value="10">10 Questions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                onClick={handleGenerate}
                disabled={!topic.trim()}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Sparkles className="h-4 w-4 mr-2" /> Generate Quiz
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 p-4 md:p-8">
        <div className="max-w-xl mx-auto space-y-4">
          <Skeleton className="h-8 w-48" />
          <Card className="border-stone-200 dark:border-stone-800">
            <CardContent className="pt-6 space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 p-4 md:p-8">
        <div className="max-w-xl mx-auto">
          <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                <div className="space-y-3 flex-1">
                  <p className="text-red-700 dark:text-red-300 font-medium">Failed to generate quiz</p>
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  <Button variant="outline" size="sm" onClick={handleGenerate} className="border-red-300 text-red-600">
                    <RotateCcw className="h-3.5 w-3.5 mr-1" /> Retry
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Finished screen
  if (finished && quiz) {
    const emoji = scorePercent >= 80 ? '🏆' : scorePercent >= 50 ? '👍' : '📚';
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 p-4 md:p-8 flex items-center justify-center">
        <Card className="border-stone-200 dark:border-stone-800 w-full max-w-md">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <div className="text-5xl">{emoji}</div>
            <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Quiz Complete!</h2>
            <div className="text-4xl font-bold text-emerald-600">{score}/{quiz.length}</div>
            <p className="text-stone-500 dark:text-stone-400">{scorePercent}% correct</p>
            <Progress value={scorePercent} className="h-2" />
            <Separator />
            <p className="text-sm text-stone-600 dark:text-stone-400">
              {scorePercent >= 80
                ? 'Excellent! You have a strong understanding of this topic.'
                : scorePercent >= 50
                  ? 'Good effort! Review the topics you missed.'
                  : 'Keep learning! Try again after reviewing the material.'}
            </p>
            <Button onClick={handleRetry} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <RotateCcw className="h-4 w-4 mr-2" /> Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Quiz play screen
  if (!quiz) return null;
  const q = quiz[currentIndex];

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600 rounded-lg">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100">AI Quiz</h1>
              <p className="text-xs text-stone-500 dark:text-stone-400 capitalize">{topic} &middot; {difficulty}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-emerald-600" />
            <Badge variant="secondary" className="text-sm">
              {score}/{quiz.length}
            </Badge>
          </div>
        </div>

        <Progress value={((currentIndex + 1) / quiz.length) * 100} className="h-1.5" />

        <Card className="border-stone-200 dark:border-stone-800">
          <CardContent className="pt-6 space-y-5">
            <p className="text-xs text-stone-400 dark:text-stone-500 font-medium uppercase tracking-wide">
              Question {currentIndex + 1} of {quiz.length}
            </p>
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100 leading-relaxed">
              {q.question}
            </h2>

            <div className="space-y-2">
              {q.options.map((opt, i) => {
                const isSelected = answered.selectedIndex === i;
                const isCorrectOption = i === q.correctIndex;
                const showResult = answered.isCorrect !== null;
                let cls = 'w-full justify-start text-left h-auto py-3 px-4 whitespace-normal border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800';
                if (showResult && isCorrectOption) cls = 'w-full justify-start text-left h-auto py-3 px-4 whitespace-normal border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30';
                if (showResult && isSelected && !isCorrectOption) cls = 'w-full justify-start text-left h-auto py-3 px-4 whitespace-normal border-red-500 bg-red-50 dark:bg-red-950/30';
                return (
                  <Button key={i} variant="outline" className={cls} onClick={() => handleAnswer(i)} disabled={showResult}>
                    <span className="font-mono text-xs mr-2 text-stone-400">{String.fromCharCode(65 + i)}.</span>
                    {opt}
                    {showResult && isCorrectOption && <CheckCircle2 className="h-4 w-4 ml-auto text-emerald-600 shrink-0" />}
                    {showResult && isSelected && !isCorrectOption && <XCircle className="h-4 w-4 ml-auto text-red-500 shrink-0" />}
                  </Button>
                );
              })}
            </div>

            {answered.isCorrect !== null && (
              <div className={`rounded-lg p-4 text-sm ${answered.isCorrect ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-200' : 'bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-200'}`}>
                <p className="font-medium mb-1">{answered.isCorrect ? '✓ Correct!' : '✗ Incorrect'}</p>
                <p>{q.explanation}</p>
              </div>
            )}

            {answered.isCorrect !== null && (
              <Button onClick={handleNext} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                {currentIndex + 1 >= quiz.length ? 'See Results' : 'Next Question'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
