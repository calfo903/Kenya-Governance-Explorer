import { NextResponse } from 'next/server';
import { nationalSummary } from '@/data/national-summary';

export async function GET() {
  return NextResponse.json({
    source: 'Controller of Budget (CoB)',
    lastUpdated: '2026-07-28',
    dataFreshness: {
      verified: nationalSummary.budgetSummaries[0]?.source.accessedDate || '2026-07-25',
      source: 'CoB',
    },
    summaries: nationalSummary.budgetSummaries.map(s => ({
      financialYear: s.financialYear,
      period: s.period,
      totalCountyBudget: s.totalCountyBudget,
      avgDevelopmentAbsorption: s.avgDevelopmentAbsorption,
      avgRecurrentAbsorption: s.avgRecurrentAbsorption,
      totalUnspentAmount: s.totalUnspentAmount,
      devRecurrentRatio: s.devRecurrentRatio,
      topPerformers: s.topPerformers,
      bottomPerformers: s.bottomPerformers,
    })),
  });
}
