import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { chatCompletion } from '@/lib/ai';
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit';

interface CompareInsightsRequestBody {
  county1: string;
  county2: string;
  metrics?: string[];
}

export async function POST(request: NextRequest) {

  const rl = rateLimit(request, { maxRequests: 20, windowMs: 60_000 });
  if (!rl.allowed) return rateLimitResponse(rl);
  try {
    const body: CompareInsightsRequestBody = await request.json();
    const { county1, county2, metrics } = body;

    if (!county1 || !county2) {
      return NextResponse.json(
        { success: false, error: 'county1 and county2 are required.' },
        { status: 400 }
      );
    }

    const selectedMetrics = metrics ?? ['budget', 'audit', 'leadership', 'projects'];

    // Fetch both counties' base info
    const counties = await db.county.findMany({
      where: { name: { in: [county1, county2] } },
      select: {
        id: true,
        name: true,
        code: true,
        region: true,
        population: true,
        areaSqKm: true,
        constituencies: true,
        wards: true,
      },
    });

    if (counties.length < 2) {
      return NextResponse.json(
        { success: false, error: 'One or both county names not found in the database.' },
        { status: 400 }
      );
    }

    const countyCodes = counties.map((c) => c.id);

    // Fetch budget records
    const budgets = selectedMetrics.includes('budget')
      ? await db.countyBudgetRecord.findMany({
          where: { countyCode: { in: countyCodes } },
          orderBy: { financialYear: 'desc' },
          take: 10,
        })
      : [];

    // Fetch audit records
    const audits = selectedMetrics.includes('audit')
      ? await db.countyAuditRecord.findMany({
          where: { countyCode: { in: countyCodes } },
          orderBy: { financialYear: 'desc' },
          take: 10,
        })
      : [];

    // Leadership: Governor is its own model; CountyLeadership only has cecms/mcas
    const [leadership, governors] = selectedMetrics.includes('leadership')
      ? await Promise.all([
          db.countyLeadership.findMany({
            where: { countyCode: { in: countyCodes } },
            include: {
              cecms: { select: { portfolio: true, fullName: true } },
            },
          }),
          db.governor.findMany({
            where: { countyCode: { in: countyCodes } },
          }),
        ])
      : [[], []];

    // Fetch project records
    const projects = selectedMetrics.includes('projects')
      ? await db.projectRecord.findMany({
          where: { countyCode: { in: countyCodes } },
          orderBy: { riskScore: 'desc' },
          take: 10,
        })
      : [];

    // Build context for LLM
    const countyInfo = counties
      .map(
        (c) =>
          `### ${c.name} (${c.code}) — ${c.region}\nPopulation: ${c.population.toLocaleString()} | Area: ${c.areaSqKm} km² | Constituencies: ${c.constituencies} | Wards: ${c.wards}`
      )
      .join('\n\n');

    const budgetInfo =
      budgets.length > 0
        ? '\n\n#### Budget Data\n' +
          budgets
            .map(
              (b) =>
                `- ${b.countyCode}: FY ${b.financialYear} — Total KES ${b.totalBudget.toLocaleString()}, Dev ${b.devAbsorptionRate}% absorbed, Recurrent ${b.recurrentAbsorptionRate}% absorbed, Pending Bills KES ${b.pendingBills.toLocaleString()}`
            )
            .join('\n')
        : '';

    const auditInfo =
      audits.length > 0
        ? '\n\n#### Audit Opinions\n' +
          audits
            .map(
              (a) =>
                `- ${a.countyCode}: FY ${a.financialYear} — Exec: ${a.executiveOpinion ?? 'N/A'}, Assembly: ${a.assemblyOpinion ?? 'N/A'}, Findings: ${a.keyFindings}`
            )
            .join('\n')
        : '';

    const governorByCode = new Map(governors.map((g) => [g.countyCode, g]));
    const leadershipInfo =
      leadership.length > 0 || governors.length > 0
        ? '\n\n#### Leadership\n' +
          countyCodes
            .map((code) => {
              const g = governorByCode.get(code);
              const l = leadership.find((x) => x.countyCode === code);
              return `- ${code}: Governor ${g?.fullName ?? 'N/A'} (${g?.party ?? ''}), Deputy ${l?.deputyGovernor ?? 'N/A'}, Senator ${l?.senator ?? 'N/A'}, Women Rep ${l?.womanRep ?? 'N/A'}`;
            })
            .join('\n')
        : '';

    const projectInfo =
      projects.length > 0
        ? '\n\n#### Projects (top by risk)\n' +
          projects
            .map(
              (p) =>
                `- ${p.countyCode}: ${p.name} [${p.category}] — Status: ${p.status}, Budget: KES ${p.budgetAllocated.toLocaleString()}, Spent: KES ${p.budgetSpent.toLocaleString()}, Risk: ${p.riskScore}/100`
            )
            .join('\n')
        : '';

    const prompt = `Compare the following two Kenyan counties across the requested metrics: ${selectedMetrics.join(', ')}.

${countyInfo}${budgetInfo}${auditInfo}${leadershipInfo}${projectInfo}

Provide a structured comparative analysis covering:
1. Key similarities and differences
2. Relative strengths and weaknesses of each county
3. Notable outliers or concerns
4. A brief summary recommendation

Use clear markdown formatting with tables or bullet points where helpful.`;

    const analysis = await chatCompletion(prompt);

    return NextResponse.json({
      success: true,
      analysis,
      county1,
      county2,
      metrics: selectedMetrics,
    });
  } catch (error) {
    console.error('[AI Compare Insights] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate comparison.' },
      { status: 500 }
    );
  }
}
