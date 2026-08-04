/**
 * §2.1 + §5.1 — Mzalendo API with Zod-validated query params and structured logging
 */

import { NextResponse } from 'next/server';
import { mzalendoMembers } from '@/data/mzalendo-members';
import { MzalendoQuerySchema, validateQuery } from '@/lib/api-validation';
import { internalError } from '@/lib/api-errors';
import { createLogger } from '@/lib/api-logger';

const log = createLogger('/api/mzalendo');

export async function GET(request: Request) {
  const start = Date.now();
  const parsed = validateQuery(request, MzalendoQuerySchema);
  if (!parsed.success) return parsed.response;

  const { gender, county, coalition } = parsed.data;

  try {
    let filtered = [...mzalendoMembers];

    if (gender) {
      filtered = filtered.filter(m => m.gender === gender);
    }
    if (county) {
      filtered = filtered.filter(m => m.county.toLowerCase().includes(county.toLowerCase()));
    }
    if (coalition) {
      filtered = filtered.filter(m => m.coalition === coalition);
    }

    log.info('Mzalendo members served', {
      filters: { gender, county, coalition },
      total: filtered.length,
      durationMs: Date.now() - start,
    });

    return NextResponse.json({ members: filtered, total: filtered.length });
  } catch (err) {
    log.error('Failed to serve mzalendo members', { gender, county, coalition }, Date.now() - start);
    return internalError('fetch mzalendo members');
  }
}
