import { NextRequest, NextResponse } from 'next/server';
import { webSearch, structuredCompletion } from '@/lib/ai';
import { db } from '@/lib/db';
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit';

interface SentimentRequest {
  governorName?: string;
  countyName?: string;
}

interface SentimentResult {
  sentiment: 'positive' | 'negative' | 'mixed' | 'neutral';
  summary: string;
  themes: string[];
}

export async function POST(request: NextRequest) {

  const rl = rateLimit(request, { maxRequests: 20, windowMs: 60_000 });
  if (!rl.allowed) return rateLimitResponse(rl);
  try {
    const body: SentimentRequest = await request.json();

    const { governorName, countyName } = body;

    if (!governorName && !countyName) {
      return NextResponse.json(
        { success: false, error: 'Either governorName or countyName is required' },
        { status: 400 }
      );
    }

    // Build target description
    const target = governorName
      ? `Governor ${governorName}${countyName ? ` of ${countyName} County` : ''}`
      : `${countyName} County leadership`;

    // Look up governor in DB if we have a county name but no governor name
    let resolvedGovernor = governorName;
    if (!governorName && countyName) {
      const county = await db.county.findFirst({
        where: { name: { contains: countyName } },
        include: { governor: true },
      }).catch(() => null);
      if (county?.governor) {
        resolvedGovernor = county.governor.fullName;
      }
    }

    // Build search queries
    const searchTarget = resolvedGovernor ?? countyName ?? '';
    const queries = [
      `${searchTarget} news opinion 2024 2025 Kenya`,
      `${searchTarget} performance approval rating county governance`,
      `${searchTarget} criticism controversy audit Kenya county`,
    ];

    const allResults = await Promise.all(
      queries.map((q) => webSearch(q, 4).catch(() => []))
    );

    // Deduplicate by URL
    const seen = new Set<string>();
    const uniqueResults = allResults.flat().filter((r) => {
      if (seen.has(r.url)) return false;
      seen.add(r.url);
      return true;
    });

    if (uniqueResults.length === 0) {
      return NextResponse.json({
        success: true,
        sentiment: 'neutral' as const,
        summary: `Insufficient recent news coverage found online for ${target} to perform a reliable sentiment analysis. This may indicate limited media coverage or a relatively new administration.`,
        themes: [],
        sources: [],
      });
    }

    // Build context for LLM
    const context = uniqueResults
      .slice(0, 10)
      .map((r, i) => `[${i + 1}] ${r.name}\n    ${r.snippet}`)
      .join('\n\n');

    const systemPrompt = `You are a media analyst specialising in Kenyan county politics and governance.
Analyse news coverage sentiment objectively and fairly.
Consider: tone of headlines, language used, topics covered, and balance of positive vs negative reporting.`;

    const userMessage = `Analyse the media sentiment for ${target} based on these recent news results:

${context}

Return a JSON object with this exact structure:
{
  "sentiment": "positive" | "negative" | "mixed" | "neutral",
  "summary": "A 2-3 paragraph analysis of the overall media sentiment, citing specific coverage themes",
  "themes": ["theme1", "theme2", "theme3"]
}

Be objective. If coverage is balanced, use "mixed". If there is too little to judge, use "neutral".`;

    const result = await structuredCompletion<SentimentResult>(userMessage, systemPrompt);

    const validSentiments = ['positive', 'negative', 'mixed', 'neutral'] as const;
    const sentiment = validSentiments.includes(result.sentiment)
      ? result.sentiment
      : 'neutral';

    const sources = uniqueResults.slice(0, 5).map((r) => ({
      title: r.name,
      url: r.url,
    }));

    return NextResponse.json({
      success: true,
      sentiment,
      summary: String(result.summary),
      themes: Array.isArray(result.themes) ? result.themes.map(String) : [],
      sources,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: `Sentiment analysis failed: ${message}` },
      { status: 500 }
    );
  }
}
