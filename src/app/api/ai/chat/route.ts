import { NextResponse } from 'next/server';
import { chatCompletion } from '@/lib/ai';
import { countyAuditData } from '@/data/county-audit-data';
import { countyBudgetData } from '@/data/county-budget-data';
import { countyProjects } from '@/data/county-projects';
import { all47Governors } from '@/data/governors';
import { NATIONAL_OVERSIGHT_SNAPSHOT } from '@/data/oversight-sources';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequestBody {
  message: string;
  history?: ChatMessage[];
  systemContext?: string;
  /** County code e.g. "017" — injects structured audit/budget/project context */
  countyCode?: string;
}

function buildCountyContext(countyCode: string): string {
  const code = countyCode.trim().padStart(3, '0');
  const audits = countyAuditData.filter((r) => r.countyCode === code);
  const budgets = countyBudgetData.filter((b) => b.countyCode === code);
  const projects = (countyProjects ?? []).filter(
    (p: { countyCode?: string }) => p.countyCode === code,
  );
  const governor = all47Governors.find(
    (g) => g.countyCode === code || String(g.countyCode).padStart(3, '0') === code,
  );

  if (!audits.length && !budgets.length && !governor) {
    return `No structured in-app data for county code ${code}. Answer from general knowledge and cite OAG/CoB.`;
  }

  const name =
    audits[0]?.countyName ||
    budgets[0]?.countyName ||
    governor?.countyName ||
    `County ${code}`;

  const lines: string[] = [
    `ACTIVE COUNTY CONTEXT (use these facts; do not invent opposing numbers):`,
    `County: ${name} (code ${code})`,
  ];

  if (governor) {
    lines.push(
      `Governor: ${governor.name ?? 'n/a'} (${governor.party ?? 'n/a'} / ${governor.coalition ?? 'n/a'})`,
    );
  }

  for (const a of audits) {
    lines.push(
      `Audit ${a.financialYear}: executive=${a.executiveOpinion ?? 'n/a'}; assembly=${a.assemblyOpinion ?? 'n/a'}`,
    );
    for (const f of (a.keyFindings ?? []).slice(0, 4)) {
      lines.push(`  - Finding: ${f}`);
    }
  }

  for (const b of budgets) {
    lines.push(
      `Budget ${b.financialYear}: total=${b.totalBudget?.toLocaleString?.() ?? b.totalBudget} KES; dev absorption=${b.devAbsorptionRate}%; pending bills=${b.pendingBills?.toLocaleString?.() ?? b.pendingBills} KES`,
    );
  }

  for (const p of projects.slice(0, 5) as Array<{
    name?: string;
    status?: string;
    budgetKes?: number;
  }>) {
    lines.push(
      `Project: ${p.name ?? 'unnamed'} — status=${p.status ?? 'n/a'}${p.budgetKes != null ? `; budget=${p.budgetKes}` : ''}`,
    );
  }

  const snap = NATIONAL_OVERSIGHT_SNAPSHOT;
  if (snap) {
    lines.push(
      `National FY24/25 reference: OAG exec unmodified=${snap.oagFY202425?.executives?.unmodified}, adverse=${snap.oagFY202425?.executives?.adverse}; CoB dev absorption~${snap.cobFY202425?.developmentAbsorptionPct}%`,
    );
  }

  lines.push(
    'Structure answers: Summary → Evidence (from context above) → What citizens can do (RTI, MCA questions, CoB sections).',
  );
  return lines.join('\n');
}

export async function POST(request: Request) {
  try {
    const body: ChatRequestBody = await request.json();
    const { message, history, systemContext, countyCode } = body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'A non-empty message is required.' },
        { status: 400 },
      );
    }

    if (history && !Array.isArray(history)) {
      return NextResponse.json(
        { success: false, error: 'history must be an array of {role, content} objects.' },
        { status: 400 },
      );
    }

    const validHistory = (history ?? []).filter(
      (msg): msg is ChatMessage =>
        typeof msg.role === 'string' &&
        typeof msg.content === 'string' &&
        (msg.role === 'user' || msg.role === 'assistant'),
    );

    let system = systemContext || undefined;
    if (countyCode && typeof countyCode === 'string' && countyCode.trim()) {
      const countyBlock = buildCountyContext(countyCode);
      system = system ? `${system}\n\n${countyBlock}` : countyBlock;
    }

    const response = await chatCompletion(message.trim(), system, validHistory);
    const messageCount = validHistory.length + 1;

    return NextResponse.json({
      success: true,
      response,
      messageCount,
      countyCode: countyCode?.trim() || null,
    });
  } catch (error) {
    console.error('[AI Chat] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate a response. Please try again.' },
      { status: 500 },
    );
  }
}
