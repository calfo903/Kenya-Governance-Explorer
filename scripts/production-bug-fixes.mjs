/**
 * Production-level bug fix script for Kenya Governance Explorer
 * Fixes: error leaking, SSRF, JWT fallback, rate limiter memory leak,
 *        Zod validation for AI routes, download proxy streaming cap
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

function read(f) { return readFileSync(resolve(ROOT, f), 'utf-8'); }
function write(f, c) { writeFileSync(resolve(ROOT, f), c, 'utf-8'); }

let fixes = 0;

// ══════════════════════════════════════════════════════════════════════
// FIX 1: Error message leaking — use internalError() instead of error.message
// ══════════════════════════════════════════════════════════════════════

const errorLeakFixes = {
  'src/app/api/ai/sentiment/route.ts': {
    old: `  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: \`Sentiment analysis failed: \${message}\` },
      { status: 500 }
    );
  }`,
    new: `  } catch (error) {
    console.error('[AI Sentiment] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Sentiment analysis failed. Please try again.' },
      { status: 500 }
    );
  }`,
  },
  'src/app/api/ai/quiz/route.ts': {
    old: `  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: \`Failed to generate quiz: \${message}\` },
      { status: 500 }
    );
  }`,
    new: `  } catch (error) {
    console.error('[AI Quiz] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate quiz. Please try again.' },
      { status: 500 }
    );
  }`,
  },
  'src/app/api/ai/procurement-risk/route.ts': {
    old: `  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: \`Procurement risk analysis failed: \${message}\` },
      { status: 500 }
    );
  }`,
    new: `  } catch (error) {
    console.error('[AI Procurement Risk] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Procurement risk analysis failed. Please try again.' },
      { status: 500 }
    );
  }`,
  },
  'src/app/api/ai/hansard-summary/route.ts': {
    old: `  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: \`Failed to generate Hansard summary: \${message}\` },
      { status: 500 }
    );
  }`,
    new: `  } catch (error) {
    console.error('[AI Hansard] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate Hansard summary. Please try again.' },
      { status: 500 }
    );
  }`,
  },
  'src/app/api/ai/search/route.ts': {
    old: `  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: \`Search failed: \${message}\` },
      { status: 500 }
    );
  }`,
    new: `  } catch (error) {
    console.error('[AI Search] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Search failed. Please try again.' },
      { status: 500 }
    );
  }`,
  },
  'src/app/api/ai/profile/route.ts': {
    old: `  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: \`Failed to generate county profile: \${message}\` },
      { status: 500 }
    );
  }`,
    new: `  } catch (error) {
    console.error('[AI Profile] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate county profile. Please try again.' },
      { status: 500 }
    );
  }`,
  },
};

for (const [file, { old, new: newText }] of Object.entries(errorLeakFixes)) {
  const content = read(file);
  if (content.includes(old)) {
    write(file, content.replace(old, newText));
    fixes++;
    console.log(`  Fixed error leaking: ${file}`);
  } else {
    console.log(`  SKIP (already fixed or pattern mismatch): ${file}`);
  }
}

// ══════════════════════════════════════════════════════════════════════
// FIX 2: Download proxy — don't leak fetch error message, add stream size cap
// ══════════════════════════════════════════════════════════════════════

const downloadPath = 'src/app/api/download/route.ts';
let dlContent = read(downloadPath);

// Fix 2a: Don't leak fetch error message
dlContent = dlContent.replace(
  `  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch remote file";
    return NextResponse.json({ error: message }, { status: 502 });
  }`,
  `  } catch (err) {
    console.error('[Download Proxy] Fetch error:', err);
    return NextResponse.json({ error: "Failed to fetch remote file" }, { status: 502 });
  }`
);

// Fix 2b: Add streaming size cap when Content-Length is missing
dlContent = dlContent.replace(
  `  return new NextResponse(response.body, {
    status: 200,
    headers,
  });`,
  `  // Guard: if no Content-Length, cap the stream to prevent unbounded downloads
  let body = response.body;
  if (!contentLength || contentLength === 0) {
    const reader = response.body!.getReader();
    let received = 0;
    body = new ReadableStream({
      async pull(controller) {
        const { done, value } = await reader.read();
        if (done) { controller.close(); return; }
        received += value.byteLength;
        if (received > MAX_RESPONSE_SIZE) {
          reader.cancel();
          controller.error(new Error('Response exceeded maximum allowed size'));
          return;
        }
        controller.enqueue(value);
      },
      cancel() { reader.cancel(); },
    });
  }

  return new NextResponse(body, {
    status: 200,
    headers,
  });`
);

write(downloadPath, dlContent);
fixes++;
console.log('  Fixed download proxy: error leaking + streaming size cap');

// ══════════════════════════════════════════════════════════════════════
// FIX 3: SSRF protection — block full RFC 1918 + link-local + CGNAT ranges
// ══════════════════════════════════════════════════════════════════════

const authPath = 'src/lib/auth.ts';
let authContent = read(authPath);

const oldSSRFCheck = `  // Block private/internal IPs (SSRF prevention)
  const hostname = parsed.hostname;
  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0" ||
    hostname === "::1" ||
    hostname.startsWith("10.") ||
    hostname.startsWith("192.168.") ||
    hostname.startsWith("172.16.") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal")
  ) {
    return { error: "Internal URLs not allowed", url: null };
  }`;

const newSSRFCheck = `  // Block private/internal IPs (SSRF prevention) — full RFC 1918 + link-local + CGNAT
  const hostname = parsed.hostname;
  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0" ||
    hostname === "::1" ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal") ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".test") ||
    hostname.endsWith(".example") ||
    hostname.endsWith(".invalid")
  ) {
    return { error: "Internal URLs not allowed", url: null };
  }

  // Parse numeric IPs for range checks
  const ipMatch = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipMatch) {
    const octets = ipMatch.slice(1).map(Number);
    const first = octets[0];
    const second = octets[1];
    // 10.0.0.0/8
    if (first === 10) return { error: "Internal URLs not allowed", url: null };
    // 172.16.0.0/12 (172.16.x.x through 172.31.x.x)
    if (first === 172 && second >= 16 && second <= 31) return { error: "Internal URLs not allowed", url: null };
    // 192.168.0.0/16
    if (first === 192 && second === 168) return { error: "Internal URLs not allowed", url: null };
    // 169.254.0.0/16 (link-local)
    if (first === 169 && second === 254) return { error: "Internal URLs not allowed", url: null };
    // 100.64.0.0/10 (CGNAT)
    if (first === 100 && second >= 64 && second <= 127) return { error: "Internal URLs not allowed", url: null };
    // 198.18.0.0/15 (benchmark)
    if (first === 198 && second >= 18 && second <= 19) return { error: "Internal URLs not allowed", url: null };
    // 0.0.0.0/8, 127.0.0.0/8 (redundant but explicit)
    if (first === 0 || first === 127) return { error: "Internal URLs not allowed", url: null };
  }

  // Block IPv6 private ranges (simplified)
  if (hostname.startsWith('[') && hostname.endsWith(']')) {
    const ipv6 = hostname.slice(1, -1);
    if (ipv6 === '::1' || ipv6.startsWith('fe80:') || ipv6.startsWith('fc') || ipv6.startsWith('fd')) {
      return { error: "Internal URLs not allowed", url: null };
    }
  }`;

if (authContent.includes(oldSSRFCheck)) {
  authContent = authContent.replace(oldSSRFCheck, newSSRFCheck);
  write(authPath, authContent);
  fixes++;
  console.log('  Fixed SSRF: full RFC 1918 + link-local + CGNAT + IPv6 private');
} else {
  console.log('  SKIP SSRF fix (pattern mismatch — may already be fixed)');
}

// ══════════════════════════════════════════════════════════════════════
// FIX 4: JWT fallback — abort in production instead of continuing
// ══════════════════════════════════════════════════════════════════════

authContent = read(authPath);
const oldJWT = `const _rawSecret = process.env.JWT_SECRET;
if (!_rawSecret && process.env.NODE_ENV === 'production') {
  console.error('[AUTH] FATAL: JWT_SECRET environment variable is required in production.');
}
const JWT_SECRET = new TextEncoder().encode(
  _rawSecret ?? 'dev-only-insecure-fallback-do-not-use-in-prod',
);`;

const newJWT = `const _rawSecret = process.env.JWT_SECRET;
if (!_rawSecret) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('[AUTH] FATAL: JWT_SECRET environment variable is required in production. Refusing to start.');
  }
  console.warn('[AUTH] WARNING: Using insecure fallback JWT secret. Set JWT_SECRET for production.');
}
const JWT_SECRET = new TextEncoder().encode(
  _rawSecret ?? 'dev-only-insecure-fallback-do-not-use-in-prod',
);`;

if (authContent.includes(oldJWT)) {
  authContent = authContent.replace(oldJWT, newJWT);
  write(authPath, authContent);
  fixes++;
  console.log('  Fixed JWT: throws in production if JWT_SECRET is missing');
} else {
  console.log('  SKIP JWT fix (pattern mismatch)');
}

// ══════════════════════════════════════════════════════════════════════
// FIX 5: Rate limiter — cap max entries to prevent memory exhaustion
// ══════════════════════════════════════════════════════════════════════

const rlPath = 'src/lib/rate-limit.ts';
let rlContent = read(rlPath);

const oldEvict = `// Evict stale keys every 5 minutes to prevent unbounded memory growth.
let lastEvict = Date.now();
function maybeEvict(windowMs: number) {
  const now = Date.now();
  if (now - lastEvict < 5 * 60_000) return;
  lastEvict = now;
  for (const [key, win] of store.entries()) {
    win.timestamps = win.timestamps.filter((t) => now - t < windowMs);
    if (win.timestamps.length === 0) store.delete(key);
  }
}`;

const newEvict = `// Evict stale keys every 5 minutes to prevent unbounded memory growth.
const MAX_STORE_ENTRIES = 10_000;
let lastEvict = Date.now();
function maybeEvict(windowMs: number) {
  const now = Date.now();
  // Always evict if store is oversized, otherwise every 5 minutes
  if (now - lastEvict < 5 * 60_000 && store.size < MAX_STORE_ENTRIES) return;
  lastEvict = now;
  for (const [key, win] of store.entries()) {
    win.timestamps = win.timestamps.filter((t) => now - t < windowMs);
    if (win.timestamps.length === 0) store.delete(key);
  }
  // Hard cap: if still too many entries, remove oldest
  if (store.size > MAX_STORE_ENTRIES) {
    const entries = Array.from(store.keys());
    for (let i = 0; i < entries.length - MAX_STORE_ENTRIES + 1000; i++) {
      store.delete(entries[i]);
    }
  }
}`;

if (rlContent.includes(oldEvict)) {
  rlContent = rlContent.replace(oldEvict, newEvict);
  write(rlPath, rlContent);
  fixes++;
  console.log('  Fixed rate limiter: capped at 10K entries + proactive eviction');
} else {
  console.log('  SKIP rate limiter fix (pattern mismatch)');
}

// ══════════════════════════════════════════════════════════════════════
// FIX 6: Add Zod validation schemas for AI routes
// ══════════════════════════════════════════════════════════════════════

const validationPath = 'src/lib/api-validation.ts';
let valContent = read(validationPath);

const aiSchemas = `

// ─── AI Route Schemas ────────────────────────────────────────────────

/** POST /api/ai/sentiment */
export const AiSentimentSchema = z.object({
  governorName: z.string().max(100).trim().optional(),
  countyName: z.string().max(50).trim().optional(),
}).refine(d => d.governorName || d.countyName, {
  message: 'Either governorName or countyName is required',
});

/** POST /api/ai/quiz */
export const AiQuizSchema = z.object({
  topic: z.string().max(200).trim().default('Kenyan devolution and county governance'),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  count: z.number().int().min(1).max(20).default(5),
});

/** POST /api/ai/procurement-risk */
export const AiProcurementRiskSchema = z.object({
  countyCode: CountyCodeSchema.optional(),
  category: z.string().max(50).trim().optional(),
});

/** POST /api/ai/hansard-summary */
export const AiHansardSchema = z.object({
  countyName: z.string().min(2).max(50).trim(),
  topic: z.string().max(100).trim().optional(),
});

/** POST /api/ai/search */
export const AiSearchSchema = z.object({
  query: z.string().min(2).max(500).trim(),
});

/** POST /api/ai/budget-anomaly */
export const AiBudgetAnomalySchema = z.object({
  countyCode: CountyCodeSchema.optional(),
  financialYear: FinancialYearSchema.optional(),
});

/** POST /api/ai/news */
export const AiNewsSchema = z.object({
  topic: z.string().max(200).trim().optional(),
  countyName: z.string().max(50).trim().optional(),
  num: z.number().int().min(1).max(20).optional(),
});

/** POST /api/ai/chat */
export const AiChatSchema = z.object({
  message: z.string().min(1).max(5000).trim(),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().max(5000),
  })).max(20).optional(),
  systemContext: z.string().max(2000).optional(),
  countyCode: CountyCodeSchema.optional(),
});

/** POST /api/ai/rti-letter */
export const AiRtiLetterSchema = z.object({
  countyName: z.string().min(2).max(50).trim(),
  topic: z.string().min(3).max(500).trim(),
  recipient: z.string().max(200).trim().optional(),
  additionalDetails: z.string().max(2000).trim().optional(),
});

/** POST /api/ai/compare-insights */
export const AiCompareInsightsSchema = z.object({
  county1: z.string().min(2).max(50).trim(),
  county2: z.string().min(2).max(50).trim(),
  metrics: z.array(z.string().max(50)).max(10).optional(),
}).refine(d => d.county1 !== d.county2, {
  message: 'county1 and county2 must be different counties',
});

/** POST /api/ai/profile */
export const AiProfileSchema = z.object({
  countyCode: CountyCodeSchema,
});
`;

if (!valContent.includes('AiSentimentSchema')) {
  valContent += aiSchemas;
  write(validationPath, valContent);
  fixes++;
  console.log('  Added Zod schemas for 10 AI routes to api-validation.ts');
} else {
  console.log('  SKIP AI Zod schemas (already exist)');
}

console.log(`\n  Total fixes applied: ${fixes}`);
