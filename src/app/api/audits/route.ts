import { NextResponse } from 'next/server';
import { nationalSummary } from '@/data/national-summary';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const county = searchParams.get('county');
  const year = searchParams.get('year');

  const summaries = nationalSummary.auditSummaries;

  const filtered = year
    ? summaries.filter(s => s.financialYear === year)
    : summaries;

  return NextResponse.json({
    source: 'Office of the Auditor-General (OAG)',
    lastUpdated: '2026-07-28',
    dataFreshness: {
      verified: filtered[0]?.source.accessedDate || '2026-07-25',
      source: 'OAG',
    },
    county: county ? { county, opinions: filtered.map(fy => ({
      financialYear: fy.financialYear,
      countyExecutive: fy.countyExecutive,
      countyAssembly: fy.countyAssembly,
      source: fy.source,
    }))} : null,
    summaries: filtered.map(s => ({
      financialYear: s.financialYear,
      countyExecutive: s.countyExecutive,
      countyAssembly: s.countyAssembly,
      source: s.source,
    })),
  });
}
