import { NextResponse } from 'next/server';

const stories: Array<{
  id: string;
  countyName: string;
  sector: string;
  title: string;
  experience: string;
  rating: number;
  anonymous: boolean;
  createdAt: string;
}> = [];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const county = searchParams.get('county');
  const sector = searchParams.get('sector');

  let filtered = [...stories];

  if (county) {
    filtered = filtered.filter(s => s.countyName === county);
  }
  if (sector) {
    filtered = filtered.filter(s => s.sector === sector);
  }

  return NextResponse.json({
    count: filtered.length,
    stories: filtered,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { countyName, sector, title, experience, rating = 3, anonymous = true } = body;

    if (!countyName || !sector || !title || !experience) {
      return NextResponse.json({ error: 'countyName, sector, title, and experience are required' }, { status: 400 });
    }

    const story = {
      id: `story-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      countyName,
      sector,
      title,
      experience,
      rating: Math.min(5, Math.max(1, rating)),
      anonymous,
      createdAt: new Date().toISOString(),
    };

    stories.push(story);

    return NextResponse.json({ success: true, storyId: story.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
