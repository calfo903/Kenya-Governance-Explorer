import { NextResponse } from 'next/server';
import { webSearch, chatCompletion } from '@/lib/ai';
import { db } from '@/lib/db';

interface SearchRequest {
  query: string;
}

export async function POST(request: Request) {
  try {
    const body: SearchRequest = await request.json();

    if (!body.query || typeof body.query !== 'string') {
      return NextResponse.json(
        { success: false, error: 'query is required' },
        { status: 400 }
      );
    }

    const query = body.query.trim();
    if (query.length < 2) {
      return NextResponse.json(
        { success: false, error: 'query must be at least 2 characters' },
        { status: 400 }
      );
    }

    // Run web search and DB queries in parallel
    const [webResults, countyMatches, governorMatches, projectMatches, budgetMatches] =
      await Promise.all([
        webSearch(`${query} Kenya county governance`, 6).catch(() => []),
        db.county.findMany({
          where: {
            OR: [
              { name: { contains: query } },
              { region: { contains: query } },
              { capital: { contains: query } },
            ],
          },
          include: { governor: true },
          take: 5,
        }).catch(() => []),
        db.governor.findMany({
          where: { fullName: { contains: query } },
          include: { county: true },
          take: 5,
        }).catch(() => []),
        db.projectRecord.findMany({
          where: {
            OR: [
              { name: { contains: query } },
              { category: { contains: query } },
            ],
          },
          take: 5,
        }).catch(() => []),
        db.countyBudgetRecord.findMany({
          where: { countyCode: { contains: query } },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }).catch(() => []),
      ]);

    // Build database context for LLM
    const dbParts: string[] = [];
    if (countyMatches.length > 0) {
      dbParts.push(
        'COUNTIES:\n' +
          countyMatches.map((c) => `  - ${c.name} (${c.code}, ${c.region}), Pop: ${c.population.toLocaleString()}, Area: ${c.areaSqKm} km²${c.governor ? `, Governor: ${c.governor.fullName} (${c.governor.party})` : ''}`).join('\n')
      );
    }
    if (governorMatches.length > 0) {
      dbParts.push(
        'GOVERNORS:\n' +
          governorMatches.map((g) => `  - ${g.fullName} (${g.party}${g.coalition ? `, ${g.coalition}` : ''}), County: ${g.county.name}`).join('\n')
      );
    }
    if (projectMatches.length > 0) {
      dbParts.push(
        'PROJECTS:\n' +
          projectMatches.map((p) => `  - ${p.name} [${p.category}] — Status: ${p.status}, Budget: KES ${p.budgetAllocated.toLocaleString()}, Spent: KES ${p.budgetSpent.toLocaleString()}`).join('\n')
      );
    }
    if (budgetMatches.length > 0) {
      dbParts.push(
        'BUDGETS:\n' +
          budgetMatches.map((b) => `  - FY ${b.financialYear} — Total: KES ${b.totalBudget.toLocaleString()}, Dev: KES ${b.developmentBudget.toLocaleString()}, Absorption: ${b.devAbsorptionRate}%`).join('\n')
      );
    }

    const webContext = webResults
      .slice(0, 4)
      .map((r, i) => `[${i + 1}] ${r.name}: ${r.snippet}`)
      .join('\n');

    const combinedContext = [
      webResults.length > 0 ? `WEB RESULTS:\n${webContext}` : '',
      dbParts.length > 0 ? `DATABASE RESULTS:\n${dbParts.join('\n\n')}` : '',
    ]
      .filter(Boolean)
      .join('\n\n');

    const answer = await chatCompletion(
      `A user is searching for: "${query}"\n\n${combinedContext}\n\nProvide a comprehensive, well-structured answer. Reference specific data points from the database results where relevant. If web results add useful context, incorporate those findings. Use markdown headers and bullet points for clarity.`,
      'You are a knowledgeable assistant for Kenya county governance data. Synthesise information from databases and web search results into clear, actionable answers. Always cite your data sources (DB = database, Web = web search).'
    );

    const sources = webResults.slice(0, 5).map((r) => ({
      title: r.name,
      url: r.url,
    }));

    const dbCount = countyMatches.length + governorMatches.length + projectMatches.length + budgetMatches.length;

    return NextResponse.json({
      success: true,
      answer,
      webResults: webResults.length,
      dbResults: dbCount,
      sources,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: `Search failed: ${message}` },
      { status: 500 }
    );
  }
}
