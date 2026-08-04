/**
 * §2.1 + §5.1 — Counties API with Zod-validated query params and structured logging
 */

import { NextResponse } from 'next/server';
import { all47Governors } from '@/data/governors';
import { nationalSummary } from '@/data/national-summary';
import { getCountyBudget } from '@/data/county-budget-data';
import { getCountyAuditRecords } from '@/data/county-audit-data';
import { CountiesQuerySchema, validateQuery } from '@/lib/api-validation';
import { internalError } from '@/lib/api-errors';
import { createLogger } from '@/lib/api-logger';

const log = createLogger('/api/counties');

function getOpinionRank(opinion: string | null | undefined): number {
  const rank: Record<string, number> = { 'Unmodified': 0, 'Qualified': 1, 'Adverse': 2, 'Disclaimer': 3 };
  return opinion ? (rank[opinion] ?? 4) : 4;
}

export async function GET(request: Request) {
  const start = Date.now();
  const parsed = validateQuery(request, CountiesQuerySchema);
  if (!parsed.success) return parsed.response;

  const { code, region, coalition, year } = parsed.data;

  try {
    let governors = [...all47Governors];

    if (code) governors = governors.filter(g => g.code === code);
    if (region) governors = governors.filter(g => g.region === region);
    if (coalition) governors = governors.filter(g => g.coalition === coalition);

    const latestAudit = nationalSummary.auditSummaries[0];
    const latestBudget = nationalSummary.budgetSummaries[0];

    const result = {
      count: governors.length,
      total: 47,
      financialYear: latestAudit?.financialYear,
      budgetYear: latestBudget?.financialYear,
      lastUpdated: '2026-07-28',
      dataFreshness: {
        governors: { verified: '2026-07-28', source: 'IEBC' },
        audit: { verified: latestAudit?.source.accessedDate, source: 'OAG' },
        budget: { verified: latestBudget?.source.accessedDate, source: 'CoB' },
      },
      governors: governors.map(g => {
        const budget = getCountyBudget(g.code, year);
        const audits = getCountyAuditRecords(g.code);
        const latestAuditRecord = audits.find(a => a.financialYear === year);
        const prevAuditRecord = audits.find(a => a.financialYear !== year);

        return {
          code: g.code,
          name: g.name,
          county: g.county,
          party: g.party,
          coalition: g.coalition,
          region: g.region,
          capital: g.capital,
          population: g.population,
          areaSqKm: g.areaSqKm,
          constituenciesCount: g.constituenciesCount,
          wardsCount: g.wardsCount,
          termStart: g.termStart,
          termEnd: g.termEnd,
          budget: budget ? {
            financialYear: budget.financialYear,
            period: budget.period,
            totalBudget: budget.totalBudget,
            developmentBudget: budget.developmentBudget,
            recurrentBudget: budget.recurrentBudget,
            devAbsorptionRate: budget.devAbsorptionRate,
            recurrentAbsorptionRate: budget.recurrentAbsorptionRate,
            ownSourceRevenue: budget.ownSourceRevenue,
            pendingBills: budget.pendingBills,
            source: budget.source,
          } : null,
          audit: latestAuditRecord ? {
            financialYear: latestAuditRecord.financialYear,
            executiveOpinion: latestAuditRecord.executiveOpinion,
            assemblyOpinion: latestAuditRecord.assemblyOpinion,
            keyFindings: latestAuditRecord.keyFindings,
            source: latestAuditRecord.source,
          } : null,
          auditTrend: prevAuditRecord && latestAuditRecord ? {
            previousOpinion: prevAuditRecord.executiveOpinion,
            currentOpinion: latestAuditRecord.executiveOpinion,
            improved: getOpinionRank(latestAuditRecord.executiveOpinion) < getOpinionRank(prevAuditRecord.executiveOpinion),
          } : null,
        };
      }),
    };

    log.info('Counties data served', {
      filters: { code, region, coalition, year },
      count: governors.length,
      durationMs: Date.now() - start,
    });

    return NextResponse.json(result);
  } catch (err) {
    log.error('Failed to serve counties data', { code, region, coalition, year }, Date.now() - start);
    return internalError('fetch counties');
  }
}
