/**
 * §2.1 + §5.1 — Audits API with Zod-validated query params and structured logging
 */

import { NextResponse } from 'next/server';
import { nationalSummary } from '@/data/national-summary';
import { countyAuditData, getCountyAuditRecords } from '@/data/county-audit-data';
import { AuditsQuerySchema, validateQuery } from '@/lib/api-validation';
import { internalError } from '@/lib/api-errors';
import { createLogger } from '@/lib/api-logger';

const log = createLogger('/api/audits');

export async function GET(request: Request) {
  const start = Date.now();
  const parsed = validateQuery(request, AuditsQuerySchema);
  if (!parsed.success) return parsed.response;

  const { county, year } = parsed.data;

  try {
    const summaries = nationalSummary.auditSummaries;
    const filtered = year
      ? summaries.filter(s => s.financialYear === year)
      : summaries;

    let countyData: typeof countyAuditData | null = null;
    if (county) {
      const countyCode = county.padStart(3, '0');
      let records = getCountyAuditRecords(countyCode);
      if (records.length === 0) {
        records = countyAuditData.filter(r =>
          r.countyName.toLowerCase() === county.toLowerCase()
        );
      }
      countyData = records.length > 0 ? records : null;
    }

    log.info('Audit data served', {
      county: county || 'all',
      year: year || 'all',
      countyRecordsFound: countyData?.length ?? 0,
      durationMs: Date.now() - start,
    });

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
  } catch (err) {
    log.error('Failed to serve audit data', { county, year }, Date.now() - start);
    return internalError('fetch audits');
  }
}
