import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { validateQuery } from '@/lib/api-validation';
import { CountiesQuerySchema } from '@/lib/api-validation';
import { internalError } from '@/lib/api-errors';
import { createLogger } from '@/lib/api-logger';

const logger = createLogger('/api/db/counties');

export async function GET(request: Request) {
  const start = performance.now();

  const validation = validateQuery(request, CountiesQuerySchema);
  if (!validation.success) return validation.response;

  try {
    const { code, region, coalition } = validation.data;

    const where: Record<string, unknown> = {};
    if (code) where.code = code;
    if (region) where.region = region;
    if (coalition) {
      where.governor = { coalition };
    }

    const counties = await db.county.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      include: {
        governor: true,
      },
      orderBy: { code: 'asc' },
    });

    const durationMs = Math.round(performance.now() - start);
    logger.info('Counties fetched from DB', { count: counties.length, durationMs });

    return NextResponse.json({
      data: counties,
      meta: { count: counties.length, source: 'database' },
    });
  } catch (error) {
    logger.error('Failed to fetch counties', { error: String(error) });
    return internalError('fetch counties from database');
  }
}
