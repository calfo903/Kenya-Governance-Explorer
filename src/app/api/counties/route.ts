import { NextResponse } from 'next/server';
import { all47Governors } from '@/data/governors';
import { nationalSummary } from '@/data/national-summary';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const region = searchParams.get('region');
  const coalition = searchParams.get('coalition');

  let governors = [...all47Governors];

  if (code) {
    governors = governors.filter(g => g.code === code);
  }
  if (region) {
    governors = governors.filter(g => g.region === region);
  }
  if (coalition) {
    governors = governors.filter(g => g.coalition === coalition);
  }

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
    governors: governors.map(g => ({
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
    })),
  });
}
