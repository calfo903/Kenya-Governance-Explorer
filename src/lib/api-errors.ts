/**
 * §3.1 Error Handling — Structured error responses for API routes
 *
 * All errors must be handled explicitly and preserve actionable context.
 * Silent failures are prohibited.
 */

import { NextResponse } from 'next/server';

export interface ApiErrorDetails {
  code: string;
  message: string;
  field?: string;
  action?: string;
}

/**
 * Build a standardized error response with actionable context.
 * Preserves the error's structure while never leaking internals.
 */
export function errorResponse(status: number, error: ApiErrorDetails): NextResponse {
  return NextResponse.json(
    {
      error: {
        code: error.code,
        message: error.message,
        ...(error.field && { field: error.field }),
        ...(error.action && { action: error.action }),
        timestamp: new Date().toISOString(),
      },
    },
    { status },
  );
}

/** 400 — Bad Request: client sent invalid input */
export function badRequest(field: string, message: string) {
  return errorResponse(400, {
    code: 'BAD_REQUEST',
    message,
    field,
    action: 'Check the field and try again.',
  });
}

/** 401 — Unauthorized: authentication required */
export function unauthorized(message = 'Authentication is required for this endpoint.') {
  return errorResponse(401, {
    code: 'UNAUTHORIZED',
    message,
    action: 'Provide valid authentication credentials.',
  });
}

/** 403 — Forbidden: authenticated but not authorized */
export function forbidden(message = 'You do not have permission to perform this action.') {
  return errorResponse(403, {
    code: 'FORBIDDEN',
    message,
    action: 'Contact an administrator if you believe this is an error.',
  });
}

/** 404 — Not Found */
export function notFound(resource: string, identifier?: string) {
  return errorResponse(404, {
    code: 'NOT_FOUND',
    message: `${resource}${identifier ? ` "${identifier}"` : ''} was not found.`,
    action: 'Verify the identifier and try again.',
  });
}

/** 409 — Conflict: duplicate or state conflict */
export function conflict(resource: string, message: string) {
  return errorResponse(409, {
    code: 'CONFLICT',
    message: `${resource}: ${message}`,
    action: 'Check for duplicates or resolve the conflict.',
  });
}

/** 422 — Unprocessable Entity: semantically invalid */
export function unprocessable(field: string, message: string) {
  return errorResponse(422, {
    code: 'UNPROCESSABLE_ENTITY',
    message,
    field,
    action: 'Check the field constraints and try again.',
  });
}

/** 429 — Too Many Requests: rate limit exceeded */
export function tooManyRequests(retryAfterSeconds: number, limit: string) {
  return errorResponse(429, {
    code: 'RATE_LIMITED',
    message: `Rate limit exceeded: ${limit}. Try again after ${retryAfterSeconds} seconds.`,
    action: 'Reduce request frequency or contact support for higher limits.',
  });
}

/** 500 — Internal Server Error: unexpected failure */
export function internalError(operation: string) {
  return errorResponse(500, {
    code: 'INTERNAL_ERROR',
    message: `An unexpected error occurred during "${operation}".`,
    action: 'Retry later. If the problem persists, contact support.',
  });
}
