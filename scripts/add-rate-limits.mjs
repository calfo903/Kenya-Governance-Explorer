/**
 * Add rate limiting to expensive/cost-incurring API endpoints.
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

function read(f) { return readFileSync(resolve(ROOT, f), 'utf-8'); }
function write(f, c) { writeFileSync(resolve(ROOT, f), c, 'utf-8'); }

let fixes = 0;

const endpoints = [
  {
    file: 'src/app/api/voice/transcribe/route.ts',
    importLine: "import { rateLimit, rateLimitResponse } from '@/lib/rate-limit';",
    limit: '{ maxRequests: 5, windowMs: 60_000 }',
    comment: 'Expensive: calls OpenAI Whisper per request',
  },
  {
    file: 'src/app/api/sms/cbef-alert/route.ts',
    importLine: "import { rateLimit, rateLimitResponse } from '@/lib/rate-limit';",
    limit: '{ maxRequests: 10, windowMs: 60_000 }',
    comment: 'Expensive: sends SMS via Africa\'s Talking',
  },
  {
    file: 'src/app/api/projects/ocr-audit/route.ts',
    importLine: "import { rateLimit, rateLimitResponse } from '@/lib/rate-limit';",
    limit: '{ maxRequests: 10, windowMs: 60_000 }',
    comment: 'Expensive: calls Google Cloud Vision API',
  },
  {
    file: 'src/app/api/projects/satellite/route.ts',
    importLine: "import { rateLimit, rateLimitResponse } from '@/lib/rate-limit';",
    limit: '{ maxRequests: 15, windowMs: 60_000 }',
    comment: 'Expensive: calls ESA Copernicus API',
  },
  {
    file: 'src/app/api/legal/draft-petition/route.ts',
    importLine: "import { rateLimit, rateLimitResponse } from '@/lib/rate-limit';",
    limit: '{ maxRequests: 10, windowMs: 60_000 }',
    comment: 'Expensive: calls LLM per request',
  },
  {
    file: 'src/app/api/db/tips/attest/route.ts',
    importLine: "import { rateLimit, rateLimitResponse } from '@/lib/rate-limit';",
    limit: '{ maxRequests: 5, windowMs: 60_000 }',
    comment: 'Expensive: calls Pinata IPFS + L2 blockchain RPC',
  },
  {
    file: 'src/app/api/zk-poll/verify/route.ts',
    importLine: "import { rateLimit, rateLimitResponse } from '@/lib/rate-limit';",
    limit: '{ maxRequests: 20, windowMs: 60_000 }',
    comment: 'Rate limit BigInt parsing on untrusted input',
  },
];

for (const ep of endpoints) {
  let content = read(ep.file);
  
  // Check if rate limit already present
  if (content.includes('rateLimit(')) {
    console.log(`  SKIP (already has rate limiting): ${ep.file}`);
    continue;
  }

  // Add import after the last import line
  const lines = content.split('\n');
  let lastImportIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('import ')) lastImportIdx = i;
  }
  
  if (lastImportIdx === -1) {
    console.log(`  SKIP (no imports found): ${ep.file}`);
    continue;
  }

  lines.splice(lastImportIdx + 1, 0, ep.importLine);
  content = lines.join('\n');

  // Add rate limit check at the start of the POST function
  const postPattern = /export async function POST\(request: Request\) \{/;
  const match = content.match(postPattern);
  if (!match) {
    console.log(`  SKIP (POST signature not found): ${ep.file}`);
    continue;
  }

  const rlBlock = `  // ${ep.comment}
  const rl = rateLimit(request, ${ep.limit});
  if (!rl.allowed) return rateLimitResponse(rl);

  const logger = createLogger`;
  
  // Insert after the opening brace of POST
  const insertPos = match.index + match[0].length;
  
  // If there's already a logger line right after, insert before it
  const afterPOST = content.slice(insertPos);
  const loggerMatch = afterPOST.match(/^\s*const logger = createLogger/);
  
  if (loggerMatch) {
    content = content.slice(0, insertPos) + '\n  // ' + ep.comment + '\n  const rl = rateLimit(request, ' + ep.limit + ');\n  if (!rl.allowed) return rateLimitResponse(rl);\n' + content.slice(insertPos);
  } else {
    content = content.slice(0, insertPos) + '\n  // ' + ep.comment + '\n  const rl = rateLimit(request, ' + ep.limit + ');\n  if (!rl.allowed) return rateLimitResponse(rl);\n' + content.slice(insertPos);
  }

  write(ep.file, content);
  fixes++;
  console.log(`  Added rate limiting: ${ep.file}`);
}

console.log(`\n  Total rate limits added: ${fixes}`);
