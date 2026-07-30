import { NextResponse } from 'next/server';
import { webSearch, searchAndSummarize } from '@/lib/ai';

interface NewsRequestBody {
  topic?: string;
  countyName?: string;
  num?: number;
}

export async function POST(request: Request) {
  try {
    const body: NewsRequestBody = await request.json();
    const { topic, countyName, num } = body;

    // Build search query
    const baseTopic = topic ?? 'Kenya county governance';
    const query = countyName
      ? `${baseTopic} ${countyName} 2024 2025`
      : `${baseTopic} 2024 2025`;

    // First, do a broad web search for recent articles
    const searchResults = await webSearch(query, num ?? 10);

    if (searchResults.length === 0) {
      return NextResponse.json({
        success: true,
        briefing: 'No recent news articles found for the given topic. Try broadening your search terms.',
        sources: [],
        topic: query,
      });
    }

    // Use searchAndSummarize for a concise AI briefing
    const { summary, sources } = await searchAndSummarize(query);

    return NextResponse.json({
      success: true,
      briefing: summary,
      sources,
      topic: query,
    });
  } catch (error) {
    console.error('[AI News] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch or summarize news.' },
      { status: 500 }
    );
  }
}
