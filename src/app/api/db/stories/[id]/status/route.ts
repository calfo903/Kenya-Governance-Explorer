/**
 * §4 — Update citizen story status (pending → reviewed → actioned → dismissed)
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { StoryStatusUpdateSchema, validateBody } from '@/lib/api-validation';
import { notFound, internalError, unprocessable } from '@/lib/api-errors';
import { createLogger } from '@/lib/api-logger';

const log = createLogger('/api/db/stories/[id]/status');

const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ['reviewed', 'dismissed'],
  reviewed: ['actioned', 'dismissed'],
  actioned: [],
  dismissed: [],
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const start = performance.now();
  const { id } = await params;

  const parsed = await validateBody(request, StoryStatusUpdateSchema);
  if (!parsed.success) return parsed.response;

  const { status: newStatus } = parsed.data;

  try {
    const existing = await db.citizenStory.findUnique({ where: { id } });
    if (!existing) {
      return notFound('Citizen Story', id);
    }

    const allowed = VALID_TRANSITIONS[existing.status] || [];
    if (!allowed.includes(newStatus)) {
      return unprocessable('status', `Cannot transition from "${existing.status}" to "${newStatus}". Allowed: ${allowed.length > 0 ? allowed.join(', ') : 'none (terminal state)'}`);
    }

    const updated = await db.citizenStory.update({
      where: { id },
      data: { status: newStatus },
    });

    const durationMs = Math.round(performance.now() - start);
    log.info('Story status updated', {
      storyId: id,
      from: existing.status,
      to: newStatus,
      durationMs,
    });

    return NextResponse.json({ success: true, story: updated });
  } catch (error) {
    log.error('Failed to update story status', { storyId: id, newStatus }, Math.round(performance.now() - start));
    return internalError('update story status');
  }
}
