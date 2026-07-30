import { NextResponse } from 'next/server';
import { all47Governors } from '@/data/governors';
import { nationalSummary } from '@/data/national-summary';
import { getCountyBudget } from '@/data/county-budget-data';
import { getCountyAuditRecords } from '@/data/county-audit-data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const region = searchParams.get('region');
  const coalition = searchParams.get('coalition');
  const year = searchParams.get('year') || 'FY 2024/25';

  let governors = [...all47Governors];

  if (code) governors = governors.filter(g => g.code === code);
  if (region) governors = governors.filter(g => g.region === region);
  if (coalition) governors = governors.filter(g => g.coalition === coalition);

  const latestAudit = nationalSummary.auditSummaries[0];
  const latestBudget = nationalSummary.budgetSummaries[0];

  return NextResponse.json({
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
        // Real budget data
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
        // Real audit data
        audit: latestAuditRecord ? {
          financialYear: latestAuditRecord.financialYear,
          executiveOpinion: latestAuditRecord.executiveOpinion,
          assemblyOpinion: latestAuditRecord.assemblyOpinion,
          keyFindings: latestAuditRecord.keyFindings,
          source: latestAuditRecord.source,
        } : null,
        // Audit trend (opinion change)
        auditTrend: prevAuditRecord && latestAuditRecord ? {
          previousOpinion: prevAuditRecord.executiveOpinion,
          currentOpinion: latestAuditRecord.executiveOpinion,
          improved: getOpinionRank(latestAuditRecord.executiveOpinion) < getOpinionRank(prevAuditRecord.executiveOpinion),
        } : null,
      };
    }),
  });
}

function getOpinionRank(opinion: string | null | undefined): number {
  const rank: Record<string, number> = { 'Unmodified': 0, 'Qualified': 1, 'Adverse': 2, 'Disclaimer': 3 };
  return opinion ? (rank[opinion] ?? 4) : 4;
}
