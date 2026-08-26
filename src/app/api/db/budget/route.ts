import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { validateQuery } from '@/lib/api-validation';
import { BudgetQuerySchema } from '@/lib/api-validation';
import { internalError } from '@/lib/api-errors';
import { createLogger } from '@/lib/api-logger';

const logger = createLogger('/api/db/budget');

export async function GET(request: Request) {
  const start = performance.now();

  const validation = validateQuery(request, BudgetQuerySchema);
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

    const records = await db.countyBudgetRecord.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      orderBy: [{ countyCode: 'asc' }, { financialYear: 'desc' }],
    });

    const durationMs = Math.round(performance.now() - start);
    logger.info('Budget records fetched from DB', { count: records.length, durationMs });

    return NextResponse.json({
      data: records,
      meta: { count: records.length, source: 'database' },
    });
  } catch (error) {
    logger.error('Failed to fetch budget records', { error: String(error) });
    return internalError('fetch budget records from database');
  }
}
