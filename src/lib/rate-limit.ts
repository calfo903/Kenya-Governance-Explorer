/**
 * In-memory sliding-window rate limiter for AI API routes.
 *
 * Limits each IP to `maxRequests` calls within `windowMs`.
 * For production at scale, replace the Map with Upstash Redis +
 * @upstash/ratelimit — the interface below stays the same.
 *
 * Usage:
 *   const result = rateLimit(request, { maxRequests: 10, windowMs: 60_000 });
 *   if (!result.allowed) return rateLimitResponse(result);
 */

import { NextRequest, NextResponse } from 'next/server';

interface Window {
  timestamps: number[];
}

const store = new Map<string, Window>();

// Evict stale keys every 5 minutes to prevent unbounded memory growth.
let lastEvict = Date.now();
function maybeEvict(windowMs: number) {
  const now = Date.now();
  if (now - lastEvict < 5 * 60_000) return;
  lastEvict = now;
  for (const [key, win] of store.entries()) {
    win.timestamps = win.timestamps.filter((t) => now - t < windowMs);
    if (win.timestamps.length === 0) store.delete(key);
  }
}

export interface RateLimitOptions {
  /** Maximum requests allowed within the window. Default: 20 */
  maxRequests?: number;
  /** Window duration in milliseconds. Default: 60 000 (1 minute) */
  windowMs?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number; // Unix epoch ms when the oldest request drops off
}

/**
 * Extract a stable key from the request.
 * Uses x-forwarded-for (set by Vercel/Caddy) then falls back to a constant
 * so local dev always passes without needing a real IP.
 */
function getKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return 'local';
}

export function rateLimit(
  request: NextRequest,
  options: RateLimitOptions = {},
): RateLimitResult {
  const maxRequests = options.maxRequests ?? 20;
  const windowMs = options.windowMs ?? 60_000;

  maybeEvict(windowMs);

  const key = getKey(request);
  const now = Date.now();
  const cutoff = now - windowMs;

  const win = store.get(key) ?? { timestamps: [] };
  // Drop timestamps outside the sliding window
  win.timestamps = win.timestamps.filter((t) => t > cutoff);

  if (win.timestamps.length >= maxRequests) {
    const oldestInWindow = win.timestamps[0];
    store.set(key, win);
    return {
      allowed: false,
      remaining: 0,
      resetAt: oldestInWindow + windowMs,
    };
  }

  win.timestamps.push(now);
  store.set(key, win);

  return {
    allowed: true,
    remaining: maxRequests - win.timestamps.length,
    resetAt: (win.timestamps[0] ?? now) + windowMs,
  };
}

/** Returns a 429 JSON response with standard Retry-After header. */
export function rateLimitResponse(result: RateLimitResult): NextResponse {
  const retryAfterSec = Math.ceil((result.resetAt - Date.now()) / 1000);
  return NextResponse.json(
    { success: false, error: 'Too many requests. Please wait before trying again.' },
    {
      status: 429,
      headers: {
        'Retry-After': String(Math.max(retryAfterSec, 1)),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(result.resetAt),
      },
    },
  );
}
