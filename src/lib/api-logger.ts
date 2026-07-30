/**
 * §5.1 Structured Logging — Redacted production logging for API routes
 *
 * - Logs are structured JSON (timestamp, level, route, context)
 * - Sensitive values are automatically redacted
 * - Supports triage and incident analysis
 */

type LogLevel = 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  route: string;
  message: string;
  context?: Record<string, unknown>;
  durationMs?: number;
}

/** Fields whose values should never appear in logs */
const SENSITIVE_KEYS = [
  'password', 'token', 'secret', 'authorization', 'cookie',
  'description', // tips/stories may contain sensitive personal data
  'experience',
  'x-api-key', 'apikey', 'api_key',
];

/** Redact values of sensitive fields from any object */
function redact(obj: Record<string, unknown>): Record<string, unknown> {
  const redacted: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const lower = key.toLowerCase();
    if (SENSITIVE_KEYS.some(s => lower.includes(s))) {
      redacted[key] = '[REDACTED]';
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      redacted[key] = redact(value as Record<string, unknown>);
    } else {
      redacted[key] = value;
    }
  }
  return redacted;
}

/** Format a structured log entry as JSON string */
function format(entry: LogEntry): string {
  const output = { ...entry };
  if (output.context) {
    output.context = redact(output.context);
  }
  return JSON.stringify(output);
}

/** Create a route-scoped logger */
export function createLogger(route: string) {
  return {
    info(message: string, context?: Record<string, unknown>) {
      console.info(format({ timestamp: new Date().toISOString(), level: 'info', route, message, context }));
    },
    warn(message: string, context?: Record<string, unknown>) {
      console.warn(format({ timestamp: new Date().toISOString(), level: 'warn', route, message, context }));
    },
    error(message: string, context?: Record<string, unknown>, durationMs?: number) {
      console.error(format({ timestamp: new Date().toISOString(), level: 'error', route, message, context, durationMs }));
    },
  };
}

export type Logger = ReturnType<typeof createLogger>;
