import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { chatCompletion } from '@/lib/ai';

interface ProfileRequest {
  countyCode: string;
}

export async function POST(request: Request) {
  try {
    const body: ProfileRequest = await request.json();

    if (!body.countyCode || typeof body.countyCode !== 'string') {
      return NextResponse.json(
        { success: false, error: 'countyCode is required' },
        { status: 400 }
      );
    }

    const countyCode = body.countyCode.trim();

    // Fetch all related data in parallel
    const [
      county,
      governor,
      leadership,
      cecms,
      mcas,
      budgets,
      audits,
      projects,
      whistleblowerReports,
      citizenStories,
    ] = await Promise.all([
      db.county.findUnique({ where: { code: countyCode } }),
      db.governor.findUnique({ where: { countyCode } }),
      db.countyLeadership.findUnique({
        where: { countyCode },
        include: { cecms: true, mcas: true },
      }),
      db.countyCECM.findMany({
        where: { leadership: { countyCode } },
      }),
      db.countyMCA.findMany({
        where: { leadership: { countyCode } },
      }),
      db.countyBudgetRecord.findMany({
        where: { countyCode },
        orderBy: { financialYear: 'desc' },
        take: 3,
      }),
      db.countyAuditRecord.findMany({
        where: { countyCode },
        orderBy: { financialYear: 'desc' },
        take: 3,
      }),
      db.projectRecord.findMany({
        where: { countyCode },
        take: 10,
      }),
      db.whistleblowerReport.findMany({
        where: { countyCode },
        take: 5,
      }),
      db.citizenStory.findMany({
        where: { countyName: county?.name ?? '' },
        take: 5,
      }),
    ]);

    if (!county) {
      return NextResponse.json(
        { success: false, error: `No county found with code "${countyCode}"` },
        { status: 404 }
      );
    }

    // Assemble data context for LLM
    const sections: string[] = [];
    const dataParts: string[] = [];

    // County overview
    dataParts.push(
      `COUNTY OVERVIEW: ${county.name} (${county.code}), Region: ${county.region}, Capital: ${county.capital}, Population: ${county.population.toLocaleString()}, Area: ${county.areaSqKm} km², Constituencies: ${county.constituencies}, Wards: ${county.wards}`
    );
    sections.push('Overview');

    // Leadership
    if (governor || leadership) {
      const leadershipInfo = [
        governor ? `Governor: ${governor.fullName} (${governor.party}${governor.coalition ? `, ${governor.coalition}` : ''}), Term: ${governor.termStart.getFullYear()}-${governor.termEnd.getFullYear()}` : 'Governor: Not recorded',
        leadership?.deputyGovernor ? `Deputy Governor: ${leadership.deputyGovernor}` : null,
        leadership?.senator ? `Senator: ${leadership.senator}` : null,
        leadership?.womanRep ? `Women Rep: ${leadership.womanRep}` : null,
        leadership?.assemblySpeaker ? `Assembly Speaker: ${leadership.assemblySpeaker}` : null,
      ].filter(Boolean).join('\n');
      dataParts.push(`LEADERSHIP:\n${leadershipInfo}`);
      sections.push('Leadership');
    }

    // CECMs
    if (cecms.length > 0) {
      dataParts.push(
        `CECMs (${cecms.length}):\n` +
          cecms.map((c) => `  - ${c.fullName} — ${c.portfolio}${c.qualification ? ` (${c.qualification})` : ''}`).join('\n')
      );
      sections.push('County Executive');
    }

    // Budgets
    if (budgets.length > 0) {
      dataParts.push(
        `BUDGETS (last 3 years):\n` +
          budgets.map((b) => `  - FY ${b.financialYear}: Total KES ${b.totalBudget.toLocaleString()}, Development KES ${b.developmentBudget.toLocaleString()}, Recurrent KES ${b.recurrentBudget.toLocaleString()}, Dev Absorption: ${b.devAbsorptionRate}%, Own Revenue: KES ${b.ownSourceRevenue.toLocaleString()}, Pending Bills: KES ${b.pendingBills.toLocaleString()}`).join('\n')
      );
      sections.push('Budget Health');
    }

    // Audits
    if (audits.length > 0) {
      dataParts.push(
        `AUDITS (last 3 years):\n` +
          audits.map((a) => `  - FY ${a.financialYear}: Executive Opinion: ${a.executiveOpinion ?? 'N/A'}, Assembly Opinion: ${a.assemblyOpinion ?? 'N/A'}, Findings: ${a.keyFindings}`).join('\n')
      );
      sections.push('Audit Status');
    }

    // Projects
    if (projects.length > 0) {
      dataParts.push(
        `PROJECTS (${projects.length}):\n` +
          projects.map((p) => `  - ${p.name} [${p.category}] — ${p.status}, Budget: KES ${p.budgetAllocated.toLocaleString()}, Spent: KES ${p.budgetSpent.toLocaleString()}, Risk: ${p.riskScore}/10`).join('\n')
      );
      sections.push('Project Pipeline');
    }

    // Whistleblower reports
    if (whistleblowerReports.length > 0) {
      dataParts.push(`WHISTLEBLOWER REPORTS: ${whistleblowerReports.length} filed (${whistleblowerReports.filter((r) => r.status === 'pending').length} pending)`);
      sections.push('Whistleblower Intelligence');
    }

    // Citizen stories
    if (citizenStories.length > 0) {
      dataParts.push(
        `CITIZEN STORIES (${citizenStories.length}):\n` +
          citizenStories.map((s) => `  - [${s.sector}] ${s.title} (Rating: ${s.rating}/5)`).join('\n')
      );
      sections.push('Citizen Feedback');
    }

    const dataContext = dataParts.join('\n\n');

    const profile = await chatCompletion(
      `Using the following governance data for ${county.name} County, generate a comprehensive, well-written county governance profile suitable for a public dashboard.

DATA:
${dataContext}

Write the profile with the following sections: ${sections.join(', ')}.
Each section should be 2-4 sentences of analysis. Highlight strengths, weaknesses, and notable patterns.
End with a "Key Challenges" subsection that identifies 2-3 pressing issues based on the data.
Use clear, professional language. Format in markdown.`,

      'You are a governance analyst writing county profiles for the Kenya Governance Explorer platform. Your profiles are factual, balanced, and insightful. Use data to support your analysis.'
    );

    return NextResponse.json({
      success: true,
      profile,
      countyCode,
      countyName: county.name,
      sections,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: `Failed to generate county profile: ${message}` },
      { status: 500 }
    );
  }
}
