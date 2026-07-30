/**
 * §4 — Persistent Citizen Stories API (Prisma-backed)
 *
 * POST: Create a citizen story, stored in SQLite via Prisma
 * GET: List stories with pagination, filter by county/sector/status
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  StoryCreateSchema, DbStoryQuerySchema,
  validateQuery, validateBody,
} from '@/lib/api-validation';
import { internalError, unprocessable } from '@/lib/api-errors';
import { createLogger } from '@/lib/api-logger';

const log = createLogger('/api/db/stories');

export async function GET(request: Request) {
  const start = performance.now();

  const validation = validateQuery(request, DbStoryQuerySchema);
  if (!validation.success) return validation.response;

  const { county, sector, status, from, to, page, limit } = validation.data;

  try {
    const where: Record<string, unknown> = {};
    if (county) where.countyName = county;
    if (sector) where.sector = sector;
    if (status) where.status = status;
    if (from || to) {
      const dateFilter: Record<string, Date> = {};
      if (from) dateFilter.gte = new Date(from);
      if (to) dateFilter.lte = new Date(to);
      where.createdAt = dateFilter;
    }

    const [stories, total] = await Promise.all([
      db.citizenStory.findMany({
        where: Object.keys(where).length > 0 ? where : undefined,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.citizenStory.count({
        where: Object.keys(where).length > 0 ? where : undefined,
      }),
    ]);

    const durationMs = Math.round(performance.now() - start);
    log.info('Stories fetched from DB', { total, returned: stories.length, page, limit, county, sector, status, durationMs });

    return NextResponse.json({
      count: total,
      page,
      limit,
      stories,
    });
  } catch (error) {
    log.error('Failed to fetch stories from DB', { county, sector, status }, Math.round(performance.now() - start));
    return internalError('fetch stories from database');
  }
}

export async function POST(request: Request) {
  const start = performance.now();

  const parsed = await validateBody(request, StoryCreateSchema);
  if (!parsed.success) return parsed.response;

  const { countyName, sector, title, experience, rating, anonymous } = parsed.data;

  try {
    const story = await db.citizenStory.create({
      data: { countyName, sector, title, experience, rating, anonymous },
    });

    const durationMs = Math.round(performance.now() - start);
    // Do NOT log experience (sensitive, redacted by logger anyway)
    log.info('Story created in DB', {
      storyId: story.id,
      county: countyName,
      sector,
      rating,
      anonymous,
      durationMs,
    });

    return NextResponse.json({ success: true, storyId: story.id, story }, { status: 201 });
  } catch (error) {
    log.error('Failed to create story in DB', { countyName, sector }, Math.round(performance.now() - start));
    return internalError('create story in database');
  }
}
