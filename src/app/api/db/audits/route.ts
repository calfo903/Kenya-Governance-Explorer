import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { validateQuery } from '@/lib/api-validation';
import { AuditsQuerySchema } from '@/lib/api-validation';
import { internalError } from '@/lib/api-errors';
import { createLogger } from '@/lib/api-logger';

const logger = createLogger('/api/db/audits');

export async function GET(request: Request) {
  const start = performance.now();

  const validation = validateQuery(request, AuditsQuerySchema);
  if (!validation.success) return validation.response;

  try {
    const { county, year } = validation.data;

    const where: Record<string, unknown> = {};
    if (county) {
      // Resolve county name to code
      const match = await db.county.findFirst({
        where: { name: { contains: county } },
        select: { id: true },
      });
      if (match) {
        where.countyCode = match.id;
      } else {
        // Try matching as county code directly
        where.countyCode = county;
      }
    }
    if (year) {
      where.financialYear = year;
    }

    const records = await db.countyAuditRecord.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      orderBy: [{ countyCode: 'asc' }, { financialYear: 'desc' }],
    });

    // Parse keyFindings from JSON strings
    const parsed = records.map((r) => ({
      ...r,
      keyFindings: JSON.parse(r.keyFindings),
    }));

    const durationMs = Math.round(performance.now() - start);
    logger.info('Audit records fetched from DB', { count: parsed.length, durationMs });

    return NextResponse.json({
      data: parsed,
      meta: { count: parsed.length, source: 'database' },
    });
  } catch (error) {
    logger.error('Failed to fetch audit records', { error: String(error) });
    return internalError('fetch audit records from database');
  }
}
