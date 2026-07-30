import { NextResponse } from 'next/server';
import { structuredCompletion } from '@/lib/ai';

interface QuizRequest {
  topic?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  count?: number;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface QuizResponse {
  questions: QuizQuestion[];
  topic: string;
  difficulty: string;
}

export async function POST(request: Request) {
  try {
    const body: QuizRequest = await request.json();

    const topic = body.topic ?? 'Kenyan devolution and county governance';
    const difficulty = ['easy', 'medium', 'hard'].includes(body.difficulty ?? '')
      ? (body.difficulty as 'easy' | 'medium' | 'hard')
      : 'medium';
    const count = typeof body.count === 'number' && body.count >= 1 && body.count <= 20
      ? body.count
      : 5;

    const difficultyGuidance: Record<string, string> = {
      easy: 'Basic factual questions suitable for beginners. Focus on well-known facts about Kenya\'s 47 counties, the 2010 Constitution, and devolution basics.',
      medium: 'Moderate difficulty questions requiring some knowledge of county structures, budgets, audits, and governance processes.',
      hard: 'Advanced questions about specific budget figures, audit findings, procurement law (PPA 2015), IEBC thresholds, and constitutional articles.',
    };

    const systemPrompt = `You are an expert educator on Kenya's devolution and county governance system.
Generate quiz questions that are accurate, educational, and unambiguous.
Each question must have exactly 4 options with exactly one correct answer.
The explanation should teach the user why the correct answer is right.`;

    const userMessage = `Generate ${count} quiz questions about "${topic}" at ${difficulty} difficulty level.

${difficultyGuidance[difficulty]}

Return a JSON object with this exact structure:
{
  "questions": [
    {
      "question": "The question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Brief explanation of the correct answer"
    }
  ]
}

Ensure correctIndex is 0-based (0 for first option, 3 for last option).
Do not include any text outside the JSON.`;

    const result = await structuredCompletion<QuizResponse>(userMessage, systemPrompt);

    const questions = (result.questions ?? []).slice(0, count).map((q) => ({
      question: String(q.question),
      options: Array.isArray(q.options) ? q.options.map(String) : [],
      correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0,
      explanation: String(q.explanation),
    }));

    return NextResponse.json({
      success: true,
      questions,
      topic,
      difficulty,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: `Failed to generate quiz: ${message}` },
      { status: 500 }
    );
  }
}
