import { NextResponse } from 'next/server';
import { chatCompletion } from '@/lib/ai';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequestBody {
  message: string;
  history?: ChatMessage[];
}

export async function POST(request: Request) {
  try {
    const body: ChatRequestBody = await request.json();
    const { message, history } = body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'A non-empty message is required.' },
        { status: 400 }
      );
    }

    // Validate history entries if provided
    if (history && !Array.isArray(history)) {
      return NextResponse.json(
        { success: false, error: 'history must be an array of {role, content} objects.' },
        { status: 400 }
      );
    }

    const validHistory = (history ?? []).filter(
      (msg): msg is ChatMessage =>
        typeof msg.role === 'string' &&
        typeof msg.content === 'string' &&
        (msg.role === 'user' || msg.role === 'assistant')
    );

    // Use the default governance system prompt from the AI service
    const response = await chatCompletion(message.trim(), undefined, validHistory);
    const messageCount = validHistory.length + 1; // existing history + new message

    return NextResponse.json({
      success: true,
      response,
      messageCount,
    });
  } catch (error) {
    console.error('[AI Chat] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate a response. Please try again.' },
      { status: 500 }
    );
  }
}
