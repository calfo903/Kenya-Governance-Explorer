/**
 * §2.1 + §3.1 + §5.1 — Stories API with Zod validation, structured errors, and logging
 *
 * POST: Rate-limited, validated citizen experience stories
 * GET: Paginated, filterable story listing
 */

import { NextResponse } from 'next/server';
import {
  StoryCreateSchema, StoryQuerySchema, RATE_LIMITS,
  validateQuery, validateBody,
} from '@/lib/api-validation';
import { badRequest, internalError, tooManyRequests } from '@/lib/api-errors';
import { createLogger } from '@/lib/api-logger';

const log = createLogger('/api/stories');

// In-memory storage (production: migrate to database)
const stories: Array<{
  id: string;
  countyName: string;
  sector: string;
  title: string;
  experience: string;
  rating: number;
  anonymous: boolean;
  createdAt: string;
}> = [];

// Simple IP-based rate limiter (production: use Redis or dedicated middleware)
const postTimestamps: Map<string, number[]> = new Map();

function getClientIp(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}

function checkRateLimit(ip: string, limit: number, windowMs: number = 3600000): boolean {
  const now = Date.now();
  const timestamps = postTimestamps.get(ip) || [];
  const recent = timestamps.filter(t => now - t < windowMs);
  if (recent.length >= limit) {
    return false;
  }
  recent.push(now);
  postTimestamps.set(ip, recent);
  return true;
}

export async function GET(request: Request) {
  const start = Date.now();
  const parsed = validateQuery(request, StoryQuerySchema);

  if (!parsed.success) return parsed.response;

  const { county, sector, page, limit } = parsed.data;

  try {
    let filtered = [...stories];

    if (county) filtered = filtered.filter(s => s.countyName === county);
    if (sector) filtered = filtered.filter(s => s.sector === sector);

    const total = filtered.length;
    const offset = (page - 1) * limit;
    const paginated = filtered.slice(offset, offset + limit);

    log.info('Stories listed', {
      total, returned: paginated.length, page, limit, county, sector,
      durationMs: Date.now() - start,
    });

    return NextResponse.json({
      count: total,
      page,
      limit,
      stories: paginated,
    });
  } catch (err) {
    log.error('Failed to list stories', { county, sector }, Date.now() - start);
    return internalError('list stories');
  }
}

export async function POST(request: Request) {
  const start = Date.now();
  const ip = getClientIp(request);

  // §6.3 Abuse Prevention — Rate limit POSTs
  if (!checkRateLimit(ip, RATE_LIMITS.STORIES_POST)) {
    log.warn('Rate limit exceeded for stories POST', { ip });
    return tooManyRequests(3600, `${RATE_LIMITS.STORIES_POST} posts/hour`);
  }

  // §3.2 Scalability — Bound in-memory storage
  if (stories.length >= RATE_LIMITS.MAX_STORIES_STORED) {
    log.warn('Stories storage full', { count: stories.length, max: RATE_LIMITS.MAX_STORIES_STORED });
    return NextResponse.json(
      { error: 'Storage capacity reached. Stories are currently limited.', code: 'CAPACITY_REACHED' },
      { status: 507 },
    );
  }

  const parsed = await validateBody(request, StoryCreateSchema);
  if (!parsed.success) return parsed.response;

  const { countyName, sector, title, experience, rating, anonymous } = parsed.data;

  try {
    const story = {
      id: `story-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      countyName,
      sector,
      title,
      experience,
      rating,
      anonymous,
      createdAt: new Date().toISOString(),
    };

    stories.push(story);

    log.info('Story created', {
      storyId: story.id,
      county: countyName,
      sector,
      anonymous,
      durationMs: Date.now() - start,
    });

    return NextResponse.json({ success: true, storyId: story.id }, { status: 201 });
  } catch (err) {
    log.error('Failed to create story', { countyName, sector }, Date.now() - start);
    return internalError('create story');
  }
}
