import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { CountyCodeSchema } from '@/lib/api-validation';
import { notFound, internalError } from '@/lib/api-errors';
import { createLogger } from '@/lib/api-logger';

const logger = createLogger('/api/db/counties/[code]');

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const start = performance.now();

  const { code } = await params;
  const parsed = CountyCodeSchema.safeParse(code);
  if (!parsed.success) {
    return notFound('County', code);
  }

  try {
    const county = await db.county.findUnique({
      where: { code: parsed.data },
      include: {
        governor: true,
        leadership: {
          include: {
            cecms: true,
            mcas: true,
          },
        },
        auditRecords: {
          orderBy: { financialYear: 'desc' },
        },
        budgetRecords: {
          orderBy: { financialYear: 'desc' },
        },
      },
    });

    if (!county) {
      return notFound('County', parsed.data);
    }

    const durationMs = Math.round(performance.now() - start);
    logger.info('County detail fetched from DB', { code: parsed.data, durationMs });

    return NextResponse.json({
      data: county,
      meta: { source: 'database' },
    });
  } catch (error) {
    logger.error('Failed to fetch county detail', { code, error: String(error) });
    return internalError('fetch county detail from database');
  }
}
