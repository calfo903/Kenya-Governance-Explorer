import { NextResponse } from 'next/server';
import { nationalSummary } from '@/data/national-summary';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get('year');

  const summaries = nationalSummary.budgetSummaries;
  const target = year ? summaries.find(s => s.financialYear === year) : summaries[0];

  return NextResponse.json({
    lastUpdated: '2026-07-28',
    dataFreshness: {
      verified: target?.source.accessedDate || '2026-07-25',
      source: 'CoB',
    },
    summary: target ? {
      financialYear: target.financialYear,
      period: target.period,
      totalCountyBudget: target.totalCountyBudget,
      avgDevelopmentAbsorption: target.avgDevelopmentAbsorption,
      avgRecurrentAbsorption: target.avgRecurrentAbsorption,
      totalUnspentAmount: target.totalUnspentAmount,
      devRecurrentRatio: target.devRecurrentRatio,
      topPerformers: target.topPerformers,
      bottomPerformers: target.bottomPerformers,
      source: target.source,
    } : null,
    allSummaries: summaries.map(s => ({
      financialYear: s.financialYear,
      period: s.period,
      totalCountyBudget: s.totalCountyBudget,
      avgDevelopmentAbsorption: s.avgDevelopmentAbsorption,
      avgRecurrentAbsorption: s.avgRecurrentAbsorption,
      totalUnspentAmount: s.totalUnspentAmount,
    })),
  });
}
