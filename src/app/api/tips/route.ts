import { NextResponse } from 'next/server';

// In-memory storage for citizen tips (would be database in production)
const tips: Array<{
  id: string;
  countyName: string;
  category: string;
  description: string;
  anonymous: boolean;
  status: string;
  createdAt: string;
}> = [];

export async function GET() {
  return NextResponse.json({
    count: tips.length,
    tips: tips.map(t => t.anonymous ? { ...t, description: '[ANONYMOUS - CONTENT HIDDEN]' } : t),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { countyName, category, description, anonymous = true } = body;

    if (!countyName || !category || !description) {
      return NextResponse.json({ error: 'countyName, category, and description are required' }, { status: 400 });
    }

    const tip = {
      id: `tip-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      countyName,
      category,
      description,
      anonymous,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    tips.push(tip);

    return NextResponse.json({
      success: true,
      message: 'Tip submitted successfully. Your identity is protected under the Protection of Whistleblowers Act, 2023.',
      tipId: tip.id,
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
