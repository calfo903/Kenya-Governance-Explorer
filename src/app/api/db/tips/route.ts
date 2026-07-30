/**
 * §4 — Persistent Citizen Tips API (Prisma-backed)
 *
 * POST: Create a whistleblower tip, stored in SQLite via Prisma
 * GET: List tips (NEVER returns full description, only preview)
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  TipCreateSchema, DbTipQuerySchema,
  validateQuery, validateBody,
} from '@/lib/api-validation';
import { internalError } from '@/lib/api-errors';
import { createLogger } from '@/lib/api-logger';

const log = createLogger('/api/db/tips');

export async function GET(request: Request) {
  const start = performance.now();

  const validation = validateQuery(request, DbTipQuerySchema);
  if (!validation.success) return validation.response;

  const { county, category, status, from, to, page, limit } = validation.data;

  try {
    const where: Record<string, unknown> = {};
    if (county) where.countyName = county;
    if (category) where.category = category;
    if (status) where.status = status;
    if (from || to) {
      const dateFilter: Record<string, Date> = {};
      if (from) dateFilter.gte = new Date(from);
      if (to) dateFilter.lte = new Date(to);
      where.createdAt = dateFilter;
    }

    const [tips, total] = await Promise.all([
      db.citizenTip.findMany({
        where: Object.keys(where).length > 0 ? where : undefined,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.citizenTip.count({
        where: Object.keys(where).length > 0 ? where : undefined,
      }),
    ]);

    // §2.4 — NEVER return full tip description in listing
    const safeTips = tips.map(t => ({
      id: t.id,
      countyName: t.countyName,
      category: t.category,
      anonymous: t.anonymous,
      status: t.status,
      adminNotes: t.adminNotes,
      descriptionPreview: t.description.length > 60
        ? t.description.slice(0, 60) + '...'
        : t.description,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }));

    const durationMs = Math.round(performance.now() - start);
    log.info('Tips fetched from DB', { total, returned: safeTips.length, page, limit, county, category, status, durationMs });

    return NextResponse.json({
      count: total,
      page,
      limit,
      tips: safeTips,
    });
  } catch (error) {
    log.error('Failed to fetch tips from DB', { county, category, status }, Math.round(performance.now() - start));
    return internalError('fetch tips from database');
  }
}

export async function POST(request: Request) {
  const start = performance.now();

  const parsed = await validateBody(request, TipCreateSchema);
  if (!parsed.success) return parsed.response;

  const { countyName, category, description, anonymous } = parsed.data;

  try {
    const tip = await db.citizenTip.create({
      data: { countyName, category, description, anonymous },
    });

    const durationMs = Math.round(performance.now() - start);
    // §5.1 — Do NOT log the description content (redacted by logger)
    log.info('Tip created in DB', {
      tipId: tip.id,
      county: countyName,
      category,
      anonymous,
      descriptionLength: description.length,
      durationMs,
    });

    return NextResponse.json({
      success: true,
      tipId: tip.id,
      message: 'Tip submitted successfully. Your identity is protected under the Protection of Whistleblowers Act, 2023.',
    }, { status: 201 });
  } catch (error) {
    log.error('Failed to create tip in DB', { countyName, category }, Math.round(performance.now() - start));
    return internalError('create tip in database');
  }
}
