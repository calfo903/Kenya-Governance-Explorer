/**
 * Server-side auth guard for protected API routes.
 *
 * Reads the JWT from the `auth-token` cookie or Authorization header,
 * verifies it, and returns the decoded payload.
 *
 * Usage in a route handler:
 *
 *   const auth = await requireAuth(request);
 *   if (auth.error) return auth.error;
 *   const { user } = auth;
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, type TokenPayload } from '@/lib/auth';

type AuthSuccess = { error: null; user: TokenPayload };
type AuthFailure = { error: NextResponse; user: null };

export type AuthResult = AuthSuccess | AuthFailure;

const UNAUTHORIZED = (message = 'Authentication required') =>
  NextResponse.json({ success: false, error: message }, { status: 401 });

const FORBIDDEN = (message = 'Insufficient permissions') =>
  NextResponse.json({ success: false, error: message }, { status: 403 });

/** Require a valid JWT. Returns user payload or a 401 response. */
export async function requireAuth(request: NextRequest): Promise<AuthResult> {
  const token =
    request.cookies.get('auth-token')?.value ??
    request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    return { error: UNAUTHORIZED(), user: null };
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return { error: UNAUTHORIZED('Invalid or expired session'), user: null };
  }

  return { error: null, user: payload };
}

/**
 * Require the ADMIN_EMAIL env var to match the authenticated user.
 * If ADMIN_EMAIL is not configured, the route is locked out entirely.
 *
 * Set ADMIN_EMAIL in your environment to the email you register with.
 */
export async function requireAdmin(request: NextRequest): Promise<AuthResult> {
  const auth = await requireAuth(request);
  if (auth.error) return auth;

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!adminEmail) {
    // No admin configured — lock the route down entirely
    return { error: FORBIDDEN('Admin access not configured on this server'), user: null };
  }

  if (auth.user.email.toLowerCase() !== adminEmail) {
    return { error: FORBIDDEN('Admin access required'), user: null };
  }

  return auth;
}
