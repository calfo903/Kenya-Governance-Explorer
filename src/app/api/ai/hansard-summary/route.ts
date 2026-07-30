import { NextResponse } from 'next/server';
import { webSearch, chatCompletion } from '@/lib/ai';

interface HansardSummaryRequest {
  countyName: string;
  topic?: string;
}

export async function POST(request: Request) {
  try {
    const body: HansardSummaryRequest = await request.json();

    const { countyName, topic } = body;

    if (!countyName || typeof countyName !== 'string') {
      return NextResponse.json(
        { success: false, error: 'countyName is required' },
        { status: 400 }
      );
    }

    // Build search query for Hansard / assembly transcripts
    const topicSuffix = topic ? ` ${topic}` : '';
    const searchQuery = `${countyName} county assembly Hansard debate${topicSuffix} Kenya 2024 2025`;

    const searchResults = await webSearch(searchQuery, 8);

    if (searchResults.length === 0) {
      return NextResponse.json({
        success: true,
        summary: `No recent Hansard records or assembly debate transcripts were found online for ${countyName} County${topic ? ` regarding ${topic}` : ''}. This could mean transcripts have not been published digitally yet. Try consulting the county assembly clerk's office or the Kenya National Assembly's Hansard portal.`,
        countyName,
        topic: topic ?? null,
        sources: [],
      });
    }

    // Build context for LLM
    const context = searchResults
      .map((r, i) => `[${i + 1}] ${r.name}\n    ${r.snippet}`)
      .join('\n\n');

    const systemPrompt = `You are a Kenyan legislative analyst specialising in county assembly proceedings.
Summarise Hansard transcripts and assembly debates in clear, factual language.
Highlight: key motions debated, resolutions passed, budget allocations discussed, 
leaders' positions, and any contentious issues. Use markdown formatting.`;

    const userMessage = `Summarise the following recent assembly Hansard / debate results for ${countyName} County${topic ? ` on the topic of "${topic}"` : ''}.

Search results:
${context}

Provide a structured summary with sections for: Key Debates, Motions & Resolutions, Budget Discussions, and Notable Positions.`;

    const summary = await chatCompletion(userMessage, systemPrompt);

    const sources = searchResults.slice(0, 5).map((r) => ({
      title: r.name,
      url: r.url,
    }));

    return NextResponse.json({
      success: true,
      summary,
      countyName,
      topic: topic ?? null,
      sources,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: `Failed to generate Hansard summary: ${message}` },
      { status: 500 }
    );
  }
}
