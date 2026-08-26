/**
 * §4 — Update citizen tip status (pending → investigating → resolved → dismissed)
 * Requires admin authentication (ADMIN_EMAIL env var must match session user).
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { TipStatusUpdateSchema, validateBody } from '@/lib/api-validation';
import { notFound, internalError, unprocessable } from '@/lib/api-errors';
import { createLogger } from '@/lib/api-logger';
import { requireAdmin } from '@/lib/require-auth';

const log = createLogger('/api/db/tips/[id]/status');

const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ['investigating', 'dismissed'],
  investigating: ['resolved', 'dismissed'],
  resolved: [],
  dismissed: [],
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const start = performance.now();

  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const { id } = await params;

  const parsed = await validateBody(request, TipStatusUpdateSchema);
  if (!parsed.success) return parsed.response;

  const { status: newStatus, adminNotes } = parsed.data;

  try {
    const existing = await db.citizenTip.findUnique({ where: { id } });
    if (!existing) {
      return notFound('Citizen Tip', id);
    }

    const allowed = VALID_TRANSITIONS[existing.status] || [];
    if (!allowed.includes(newStatus)) {
      return unprocessable('status', `Cannot transition from "${existing.status}" to "${newStatus}". Allowed: ${allowed.length > 0 ? allowed.join(', ') : 'none (terminal state)'}`);
    }

    const updateData: Record<string, unknown> = { status: newStatus };
    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes;
    }

    const updated = await db.citizenTip.update({
      where: { id },
      data: updateData,
    });

    const durationMs = Math.round(performance.now() - start);
    // Do NOT log tip description
    log.info('Tip status updated', {
      tipId: id,
      from: existing.status,
      to: newStatus,
      hasAdminNotes: !!adminNotes,
      durationMs,
    });

    // Return safe version (no full description)
    const safeUpdated = {
      id: updated.id,
      countyName: updated.countyName,
      category: updated.category,
      anonymous: updated.anonymous,
      status: updated.status,
      adminNotes: updated.adminNotes,
      descriptionPreview: updated.description.length > 60
        ? updated.description.slice(0, 60) + '...'
        : updated.description,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };

    return NextResponse.json({ success: true, tip: safeUpdated });
  } catch (error) {
    log.error('Failed to update tip status', { tipId: id, newStatus }, Math.round(performance.now() - start));
    return internalError('update tip status');
  }
}
