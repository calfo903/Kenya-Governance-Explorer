import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createLogger } from '@/lib/api-logger';
import { notFound, internalError, unauthorized, forbidden } from '@/lib/api-errors';

const logger = createLogger('/api/db/tips/[id]');

/**
 * GET /api/db/tips/[id]
 * Retrieves the full encrypted payload package for a specific whistleblower tip.
 * Used exclusively by the Ombudsman Decryptor for browser-side local decryption.
 * Protected via Role-Based Access Control (RBAC) token header authentication.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const start = performance.now();
  const { id } = await params;

  try {
    // ═══════════════════════════════════════════════════════════════
    // Suggestion 5: Role-Based Access Control (RBAC) Security check
    // ═══════════════════════════════════════════════════════════════
    const secureToken = process.env.ADMIN_DECRYPTION_TOKEN;
    if (!secureToken) {
      // Route is locked out unless the environment is explicitly configured.
      logger.warn('Access blocked: ADMIN_DECRYPTION_TOKEN is not configured.', { id });
      return forbidden('Ombudsman decryption endpoint is not configured on this server.');
    }

    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      logger.warn('Access blocked: Missing Authorization header.', { id });
      return unauthorized('Ombudsman token credentials are required to fetch unredacted ciphers.');
    }

    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (token !== secureToken) {
      logger.warn('Access blocked: Invalid credentials token provided.', { id, tokenSnippet: token.slice(0, 5) });
      return forbidden('Access Denied: Invalid Ombudsman token credentials.');
    }

    const tip = await db.citizenTip.findUnique({
      where: { id }
    });

    if (!tip) {
      logger.warn('Tip not found', { id });
      return notFound('CitizenTip', id);
    }

    const durationMs = Math.round(performance.now() - start);
    logger.info('Retrieved full encrypted tip package with authorized RBAC check.', { id, durationMs });

    return NextResponse.json({
      success: true,
      tip: {
        id: tip.id,
        countyName: tip.countyName,
        category: tip.category,
        anonymous: tip.anonymous,
        status: tip.status,
        description: tip.description, // Full unaltered encrypted payload
        adminNotes: tip.adminNotes,
        createdAt: tip.createdAt,
        updatedAt: tip.updatedAt
      }
    });

  } catch (error) {
    logger.error('Failed to retrieve single tip', { id, error: String(error) });
    return internalError(`fetch tip details for id: ${id}`);
  }
}
