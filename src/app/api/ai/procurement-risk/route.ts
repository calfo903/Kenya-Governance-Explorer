import { NextResponse } from 'next/server';
import { webSearch, structuredCompletion } from '@/lib/ai';
import { db } from '@/lib/db';

interface ProcurementRiskRequest {
  countyCode?: string;
  category?: string;
}

interface ProcurementRiskResult {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  analysis: string;
  redFlags: string[];
  recommendations: string[];
}

export async function POST(request: Request) {
  try {
    const body: ProcurementRiskRequest = await request.json();

    const { countyCode, category } = body;

    // Determine county name for searches
    let countyName: string | null = null;
    if (countyCode) {
      const county = await db.county.findUnique({
        where: { code: countyCode },
      }).catch(() => null);
      countyName = county?.name ?? null;
    }

    // Fetch projects and budgets from DB for context
    const projectFilter: Record<string, unknown> = {};
    if (countyCode) projectFilter.countyCode = countyCode;
    if (category) projectFilter.category = category;

    const projects = await db.projectRecord.findMany({
      where: Object.keys(projectFilter).length > 0 ? projectFilter : undefined,
      take: 15,
    }).catch(() => []);

    // Build web search queries
    const searchTarget = countyName ?? 'Kenya county';
    const categorySuffix = category ?? 'procurement';
    const queries = [
      `${searchTarget} ${categorySuffix} irregularities corruption 2024 2025`,
      `${searchTarget} procurement single sourcing inflated costs audit`,
      `${searchTarget} ${categorySuffix} tender scandal investigation EACC`,
    ];

    const searchBatches = await Promise.all(
      queries.map((q) => webSearch(q, 5).catch(() => []))
    );

    // Deduplicate results
    const seen = new Set<string>();
    const uniqueResults = searchBatches.flat().filter((r) => {
      if (seen.has(r.url)) return false;
      seen.add(r.url);
      return true;
    });

    // Build context
    const contextParts: string[] = [];

    if (projects.length > 0) {
      contextParts.push(
        `PROJECT DATA FROM DATABASE (${projects.length} projects):\n` +
          projects
            .map((p) => {
              const absorption = p.budgetAllocated > 0
                ? ((p.budgetSpent / p.budgetAllocated) * 100).toFixed(1)
                : '0';
              return `  - ${p.name} [${p.category}]: Status=${p.status}, Allocated=KES ${p.budgetAllocated.toLocaleString()}, Spent=KES ${p.budgetSpent.toLocaleString()} (${absorption}%), Risk=${p.riskScore}/10`;
            })
            .join('\n')
      );
    }

    if (uniqueResults.length > 0) {
      contextParts.push(
        `WEB SEARCH RESULTS (${uniqueResults.length} articles):\n` +
          uniqueResults
            .slice(0, 8)
            .map((r, i) => `[${i + 1}] ${r.name}: ${r.snippet}`)
            .join('\n')
      );
    }

    const contextStr = contextParts.length > 0
      ? contextParts.join('\n\n')
      : 'No specific data available. Provide a general analysis based on common procurement risks in Kenyan county governments.';

    const systemPrompt = `You are a forensic procurement analyst specialising in Kenyan county government spending.
Assess procurement risk objectively based on available data.
Focus on: single sourcing patterns, inflated contract values, missing documentation, 
related-party transactions, and deviation from PPA 2015 (Public Procurement Act) requirements.`;

    const userMessage = `Analyse procurement risk for ${countyName ? `${countyName} County` : 'Kenya counties'}${category ? ` in the "${category}" category` : ''}.

${contextStr}

Return a JSON object with this exact structure:
{
  "riskLevel": "low" | "medium" | "high" | "critical",
  "analysis": "A detailed 2-3 paragraph analysis of the procurement risk situation",
  "redFlags": ["flag1", "flag2", "flag3"],
  "recommendations": ["rec1", "rec2", "rec3"]
}

Risk levels: low = no concerns found, medium = some irregular patterns, high = significant red flags, critical = evidence of systemic issues.
Provide 3-6 red flags and 3-6 actionable recommendations.`;

    const result = await structuredCompletion<ProcurementRiskResult>(userMessage, systemPrompt);

    const validLevels = ['low', 'medium', 'high', 'critical'] as const;
    const riskLevel = validLevels.includes(result.riskLevel) ? result.riskLevel : 'medium';

    return NextResponse.json({
      success: true,
      riskLevel,
      analysis: String(result.analysis),
      redFlags: Array.isArray(result.redFlags) ? result.redFlags.map(String) : [],
      recommendations: Array.isArray(result.recommendations) ? result.recommendations.map(String) : [],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: `Procurement risk analysis failed: ${message}` },
      { status: 500 }
    );
  }
}
