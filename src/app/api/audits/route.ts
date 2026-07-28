import { NextResponse } from 'next/server';
import { nationalSummary } from '@/data/national-summary';
import { countyAuditData, getCountyAuditRecords } from '@/data/county-audit-data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const county = searchParams.get('county');
  const year = searchParams.get('year');

  const summaries = nationalSummary.auditSummaries;

  const filtered = year
    ? summaries.filter(s => s.financialYear === year)
    : summaries;

  // If a specific county is requested, include per-county audit opinions
  let countyData: typeof countyAuditData | null = null;
  if (county) {
    const countyCode = county.padStart(3, '0');
    // Try to match by code
    let records = getCountyAuditRecords(countyCode);
    if (records.length === 0) {
      // Try matching by county name (case insensitive)
      records = countyAuditData.filter(r =>
        r.countyName.toLowerCase() === county.toLowerCase()
      );
    }
    countyData = records.length > 0 ? records : null;
  }

  return NextResponse.json({
    source: 'Office of the Auditor-General (OAG)',
    lastUpdated: '2026-07-28',
    dataFreshness: {
      verified: filtered[0]?.source.accessedDate || '2026-07-25',
      source: 'OAG',
    },
    county: countyData,
    summaries: filtered.map(s => ({
      financialYear: s.financialYear,
      countyExecutive: s.countyExecutive,
      countyAssembly: s.countyAssembly,
      source: s.source,
    })),
  });
}
