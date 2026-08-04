/**
 * §2.1 + §3.1 + §5.1 — Tips API with Zod validation, structured errors, and logging
 *
 * POST: Rate-limited, validated whistleblower tips
 * GET: Tips listing with automatic anonymization
 */

import { NextResponse } from 'next/server';
import {
  TipCreateSchema, RATE_LIMITS,
  validateBody,
} from '@/lib/api-validation';
import { internalError, tooManyRequests } from '@/lib/api-errors';
import { createLogger } from '@/lib/api-logger';

const log = createLogger('/api/tips');

const tips: Array<{
  id: string;
  countyName: string;
  category: string;
  description: string;
  anonymous: boolean;
  status: string;
  createdAt: string;
}> = [];

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

export async function GET() {
  const start = Date.now();

  try {
    // §2.4 Secrets — Never expose tip descriptions in full; always anonymize
    const safeTips = tips.map(t => ({
      id: t.id,
      countyName: t.countyName,
      category: t.category,
      anonymous: t.anonymous,
      status: t.status,
      createdAt: t.createdAt,
      // Description is never returned in full via GET
      descriptionPreview: t.description.slice(0, 50) + (t.description.length > 50 ? '...' : ''),
    }));

    log.info('Tips listed', { total: tips.length, durationMs: Date.now() - start });

    return NextResponse.json({
      count: tips.length,
      tips: safeTips,
    });
  } catch (err) {
    log.error('Failed to list tips', undefined, Date.now() - start);
    return internalError('list tips');
  }
}

export async function POST(request: Request) {
  const start = Date.now();
  const ip = getClientIp(request);

  // §6.3 Abuse Prevention — Rate limit POSTs
  if (!checkRateLimit(ip, RATE_LIMITS.TIPS_POST)) {
    log.warn('Rate limit exceeded for tips POST', { ip });
    return tooManyRequests(3600, `${RATE_LIMITS.TIPS_POST} tips/hour`);
  }

  // §3.2 Scalability — Bound in-memory storage
  if (tips.length >= RATE_LIMITS.MAX_TIPS_STORED) {
    log.warn('Tips storage full', { count: tips.length, max: RATE_LIMITS.MAX_TIPS_STORED });
    return NextResponse.json(
      { error: 'Storage capacity reached. Tips are currently limited.', code: 'CAPACITY_REACHED' },
      { status: 507 },
    );
  }

  const parsed = await validateBody(request, TipCreateSchema);
  if (!parsed.success) return parsed.response;

  const { countyName, category, description, anonymous } = parsed.data;

  try {
    const tip = {
      id: `tip-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      countyName,
      category,
      description,
      anonymous,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    tips.push(tip);

    // §5.1 Logging — Do NOT log the description content
    log.info('Tip submitted', {
      tipId: tip.id,
      county: countyName,
      category,
      anonymous,
      descriptionLength: description.length,
      durationMs: Date.now() - start,
    });

    return NextResponse.json({
      success: true,
      message: 'Tip submitted successfully. Your identity is protected under the Protection of Whistleblowers Act, 2023.',
      tipId: tip.id,
    }, { status: 201 });
  } catch (err) {
    log.error('Failed to submit tip', { countyName, category }, Date.now() - start);
    return internalError('submit tip');
  }
}
