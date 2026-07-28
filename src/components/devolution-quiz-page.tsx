'use client';

import React, { useState } from 'react';
import {
  GraduationCap, CheckCircle2, XCircle, HelpCircle,
  ArrowRight, RotateCcw, Trophy, Lightbulb, BookOpen,
  Star, BarChart3, Scale, Users, Building2, Gavel,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  article: string; // Kenya Constitution article reference
  category: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'How many counties does the Constitution of Kenya 2010 establish?',
    options: ['44 counties', '46 counties', '47 counties', '50 counties'],
    correctIndex: 2,
    explanation: 'Article 6(1) of the Constitution establishes 47 counties as the units of devolution. These are based on the districts that existed at the promulgation of the Constitution in August 2010.',
    article: 'Article 6(1)',
    category: 'Devolution Basics',
  },
  {
    id: 'q2',
    question: 'What is the maximum term length for a county governor?',
    options: ['4 years with unlimited terms', '5 years with a maximum of 2 terms', '4 years with a maximum of 2 terms', '6 years with a maximum of 1 term'],
    correctIndex: 2,
    explanation: 'Under Article 182(2), a county governor holds office for one term of 4 years and is eligible for re-election for one final term. The maximum is therefore 2 terms (8 years total).',
    article: 'Article 182(2)',
    category: 'Governorship',
  },
  {
    id: 'q3',
    question: 'Who audits the accounts of county governments?',
    options: ['The Controller of Budget (CoB)', 'The Auditor-General', 'The Ethics and Anti-Corruption Commission (EACC)', 'The County Assembly'],
    correctIndex: 1,
    explanation: 'Article 229 establishes the Office of the Auditor-General, which audits and reports on the accounts of all public entities including county governments. The OAG produces annual audit opinions for all 47 counties.',
    article: 'Article 229',
    category: 'Oversight',
  },
  {
    id: 'q4',
    question: 'What is the minimum percentage of national revenue that MUST be allocated to county governments?',
    options: ['10%', '15%', '20%', '25%'],
    correctIndex: 1,
    explanation: 'Article 203(2) states that not less than fifteen percent (15%) of all national revenue shall be allocated to county governments. This is the constitutional minimum equitable share.',
    article: 'Article 203(2)',
    category: 'Finance',
  },
  {
    id: 'q5',
    question: 'Which body approves the budget of a county government?',
    options: ['The Senate', 'The County Executive Committee', 'The County Assembly', 'The Commission on Revenue Allocation'],
    correctIndex: 2,
    explanation: 'Article 196 vests the legislative authority of a county in the County Assembly. This includes the power to approve the county budget and appropriation bills before funds can be spent by the County Executive.',
    article: 'Article 196',
    category: 'Legislative',
  },
  {
    id: 'q6',
    question: 'Can a citizen recall their County Assembly Member (Ward Representative)?',
    options: ['No, recall only applies to MPs and Senators', 'Yes, under Article 104', 'Yes, under Article 174', 'No, county representatives serve full terms'],
    correctIndex: 1,
    explanation: 'Article 104 of the Constitution provides for the recall of a member of a county assembly. A recall petition requires at least 30% of registered voters in the ward to support it, and a vote by at least 50% of registered voters.',
    article: 'Article 104',
    category: 'Citizen Rights',
  },
  {
    id: 'q7',
    question: 'What does the Controller of Budget (CoB) do for county governments?',
    options: ['Approves county budgets before spending', 'Oversees implementation of budgets and authorizes withdrawals from public funds', 'Appoints county executives', 'Conducts procurement audits'],
    correctIndex: 1,
    explanation: 'Under Article 228, the CoB oversees the implementation of budgets and authorizes withdrawals from public funds. The CoB produces quarterly County Budget Implementation Review Reports tracking county spending performance.',
    article: 'Article 228',
    category: 'Finance',
  },
  {
    id: 'q8',
    question: 'Which county has the largest population according to the 2019 Kenya Population and Housing Census?',
    options: ['Mombasa', 'Nakuru', 'Nairobi', 'Kiambu'],
    correctIndex: 2,
    explanation: 'Nairobi City County has the largest population at 4,397,073 per the 2019 census. Kiambu is second (2,481,581) and Nakuru third (2,161,944). Nairobi holds about 9% of Kenya\'s total population.',
    article: 'KNBS 2019 Census',
    category: 'County Facts',
  },
  {
    id: 'q9',
    question: 'What is a County Public Accounts and Investments Committee (CPAIC)?',
    options: ['A committee that audits county finances independently', 'A committee of the County Assembly that examines county budgets and accounts', 'A national Senate committee for county oversight', 'An EACC unit investigating county corruption'],
    correctIndex: 1,
    explanation: 'Each County Assembly has a CPAIC that examines county budgets, accounts, and reports from the Auditor-General. This committee plays a critical role in legislative oversight of county executive spending.',
    article: 'County Assembly Standing Orders',
    category: 'Oversight',
  },
  {
    id: 'q10',
    question: 'Under which article of the Constitution does a citizen have the right to access information held by the state?',
    options: ['Article 19', 'Article 25', 'Article 33', 'Article 35'],
    correctIndex: 3,
    explanation: 'Article 35 guarantees every citizen the right to information held by the state, and the right to information held by another person that is required for the exercise or protection of any right. This is the constitutional basis for freedom of information.',
    article: 'Article 35',
    category: 'Citizen Rights',
  },
  {
    id: 'q11',
    question: 'What percentage of the County Assembly Budget goes to the Ward Development Fund in most counties?',
    options: ['20%', '30%', '40%', '50%'],
    correctIndex: 1,
    explanation: 'Most county assemblies allocate approximately 30% of the County Assembly budget to the Ward Development Fund. However, this varies by county. The Fund supports development projects at the ward level.',
    article: 'County Finance Act',
    category: 'Finance',
  },
  {
    id: 'q12',
    question: 'How many County Executive Committee Members (CECMs) does a county have, including the Deputy Governor?',
    options: ['5', '8', '10', '12'],
    correctIndex: 2,
    explanation: 'Article 179(2) states that a county executive committee consists of the county governor, the deputy county governor, and not more than ten other members appointed by the county governor with approval of the county assembly. Most counties have 10 CECMs.',
    article: 'Article 179(2)',
    category: 'Governorship',
  },
];

export default function DevolutionQuizPage() {
  const [started, setStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<Record<string, number>>({});
  const [finished, setFinished] = useState(false);

  const question = QUIZ_QUESTIONS[currentQ];
  const totalAnswered = Object.keys(answered).length;
  const progressPct = Math.round((totalAnswered / QUIZ_QUESTIONS.length) * 100);

  const handleAnswer = (index: number) => {
    if (showExplanation) return;
    setSelectedAnswer(index);
    setShowExplanation(true);
    if (index === question.correctIndex) {
      setScore(s => s + 1);
    }
    setAnswered(prev => ({ ...prev, [question.id]: index }));
  };

  const nextQuestion = () => {
    if (currentQ + 1 >= QUIZ_QUESTIONS.length) {
      setFinished(true);
    } else {
      setCurrentQ(q => q + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const restart = () => {
    setStarted(true);
    setCurrentQ(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setAnswered({});
    setFinished(false);
  };

  const getScoreLabel = () => {
    const pct = Math.round((score / QUIZ_QUESTIONS.length) * 100);
    if (pct >= 80) return { label: 'Expert', color: 'text-green-600', emoji: '🏆' };
    if (pct >= 60) return { label: 'Knowledgeable', color: 'text-blue-600', emoji: '📚' };
    if (pct >= 40) return { label: 'Developing', color: 'text-yellow-600', emoji: '🌱' };
    return { label: 'Needs Study', color: 'text-red-600', emoji: '📖' };
  };

  if (!started) {
    return (
      <div className="space-y-5">
        <div className="text-center max-w-lg mx-auto py-8">
          <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">Know Your Devolution Rights</h2>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-2">
            Test your knowledge of Kenya&apos;s devolved governance system, county structures, and your constitutional rights as a citizen.
          </p>
          <div className="grid grid-cols-3 gap-3 mt-6 mb-6">
            <div className="bg-stone-50 dark:bg-stone-800 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-stone-900 dark:text-stone-100">{QUIZ_QUESTIONS.length}</p>
              <p className="text-[10px] text-stone-500 dark:text-stone-400">Questions</p>
            </div>
            <div className="bg-stone-50 dark:bg-stone-800 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-stone-900 dark:text-stone-100">6</p>
              <p className="text-[10px] text-stone-500 dark:text-stone-400">Categories</p>
            </div>
            <div className="bg-stone-50 dark:bg-stone-800 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-stone-900 dark:text-stone-100">Constitution</p>
              <p className="text-[10px] text-stone-500 dark:text-stone-400">Source</p>
            </div>
          </div>
          <Button onClick={() => setStarted(true)} size="lg" className="gap-2">
            Start Quiz <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  if (finished) {
    const sl = getScoreLabel();
    return (
      <div className="space-y-5 max-w-lg mx-auto text-center py-6">
        <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
          <Trophy className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">Quiz Complete!</h2>
        <p className="text-4xl font-bold mt-3">
          <span className="text-emerald-600 dark:text-emerald-400">{score}</span>
          <span className="text-stone-300 dark:text-stone-600">/{QUIZ_QUESTIONS.length}</span>
        </p>
        <p className={`text-lg font-semibold ${sl.color} mt-1`}>{sl.label}</p>
        <Progress value={Math.round((score / QUIZ_QUESTIONS.length) * 100)} className="h-2 mt-4" />
        <Card className="border-stone-200 dark:border-stone-700 dark:bg-stone-900 text-left mt-6">
          <CardContent className="pt-4 space-y-2">
            <p className="text-xs font-semibold text-stone-700 dark:text-stone-300">Summary</p>
            <div className="space-y-1">
              {QUIZ_QUESTIONS.map((q, i) => {
                const wasCorrect = answered[q.id] === q.correctIndex;
                return (
                  <div key={q.id} className="flex items-center gap-2 text-xs">
                    {wasCorrect ? <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0" /> : <XCircle className="h-3 w-3 text-red-500 shrink-0" />}
                    <span className="text-stone-600 dark:text-stone-400">Q{i + 1}: {q.question.slice(0, 50)}...</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        <Button onClick={restart} className="mt-4 gap-2">
          <RotateCcw className="h-4 w-4" /> Retake Quiz
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-lg mx-auto">
      {/* Progress */}
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="text-[10px]">{question.category}</Badge>
        <span className="text-xs text-stone-500 dark:text-stone-400">{currentQ + 1} of {QUIZ_QUESTIONS.length}</span>
      </div>
      <Progress value={progressPct} className="h-1.5" />

      {/* Question */}
      <Card className="border-stone-200 dark:border-stone-700 dark:bg-stone-900">
        <CardContent className="pt-5">
          <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 leading-relaxed">{question.question}</h3>

          <div className="space-y-2 mt-4">
            {question.options.map((option, i) => {
              const isSelected = selectedAnswer === i;
              const isCorrect = i === question.correctIndex;
              let btnClass = 'border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300';
              if (showExplanation) {
                if (isCorrect) btnClass = 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20 text-green-800 dark:text-green-200';
                else if (isSelected && !isCorrect) btnClass = 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20 text-red-800 dark:text-red-200';
              }

              return (
                <button key={i} onClick={() => handleAnswer(i)}
                  className={`w-full text-left px-4 py-3 rounded-lg border text-xs font-medium transition-colors ${btnClass}`}>
                  <div className="flex items-center gap-2.5">
                    <span className="h-6 w-6 rounded-full border flex items-center justify-center text-[10px] font-bold shrink-0
                      ${showExplanation && isCorrect ? 'border-green-500 bg-green-500 text-white' : ''} 
                      ${showExplanation && isSelected && !isCorrect ? 'border-red-500 bg-red-500 text-white' : ''}
                    ">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span>{option}</span>
                    {showExplanation && isCorrect && <CheckCircle2 className="h-4 w-4 text-green-600 ml-auto shrink-0" />}
                    {showExplanation && isSelected && !isCorrect && <XCircle className="h-4 w-4 text-red-600 ml-auto shrink-0" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {showExplanation && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
              <div className="flex items-start gap-2">
                <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-blue-800 dark:text-blue-300">Explanation</p>
                  <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">{question.explanation}</p>
                  <p className="text-[10px] text-blue-500 dark:text-blue-500 mt-1">Reference: {question.article}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Button onClick={nextQuestion} className="w-full gap-2" disabled={!showExplanation}>
        {currentQ + 1 >= QUIZ_QUESTIONS.length ? 'See Results' : 'Next Question'} <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
