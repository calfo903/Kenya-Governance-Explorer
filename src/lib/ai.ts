/**
 * AI Service Layer — Kenya Governance Explorer
 * Primary: OpenRouter API with Google Gemini 2.5 Flash
 * Fallback: z-ai-web-dev-sdk (if OPENROUTER_API_KEY is not set or OpenRouter fails)
 * Also: Web Search via z-ai-web-dev-sdk
 * All functions are backend-only (server-side).
 */
import ZAI from 'z-ai-web-dev-sdk';

// ─── OpenRouter + Gemini Config ──────────────────────────────────
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
const DEFAULT_MODEL = 'google/gemini-2.5-flash-preview';

// z-ai-web-dev-sdk singleton
let _zai: Awaited<ReturnType<typeof ZAI.create>> | null = null;

async function getZAI() {
  if (!_zai) _zai = await ZAI.create();
  return _zai;
}

// ═══════════════════════════════════════════════════════════════════
// LLM HELPERS
// ═══════════════════════════════════════════════════════════════════

const GOVERNANCE_SYSTEM = `You are an expert on Kenya's county governance system (2010 Constitution, devolution, 47 counties).
You understand: budgets, audits, CECMs, MCAs, governors, senators, women reps, county assemblies, procurement, devolution milestones.

KEY FACTS (FY 2024/25 — use these; do not invent opposing numbers):
- OAG County Governments Audit Report FY 2024/25: 1 unmodified opinion (Makueni Executive); 44 qualified executive opinions; 2 adverse (Kericho, Tana River). County Assemblies: 9 unmodified.
- Controller of Budget (CoB): national development absorption ~57%; overall absorption ~78% (latest published CoB quarterly/annual reports).
- Primary oversight sources: oagkenya.go.ke, cob.go.ke, cra.go.ke, eacc.go.ke, parliament.go.ke, iebc.or.ke.

Be useful for citizen oversight:
- When asked about a county, compare audit opinion + budget absorption + known stalled projects if relevant.
- Suggest concrete next steps: RTI letter topics, assembly questions, CoB report sections, EACC channels when evidence suggests fraud (do not accuse without evidence).
- Prefer structured answers: Summary → Evidence → What citizens can do.
Cite OAG, CoB, CRA, IEBC, EACC, Parliament. If unsure, say so. Markdown with headers and bullets.`;

// ─── OpenRouter (Gemini) Implementation ────────────────────────────

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string | null;
    } | null;
  } | null>;
}

async function openRouterChat(
  messages: OpenRouterMessage[],
  model = DEFAULT_MODEL,
): Promise<string> {
  const res = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://kenya-governance-explorer.vercel.app',
      'X-Title': 'Kenya Governance Explorer',
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 2048,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`OpenRouter API error (${res.status}): ${errBody}`);
  }

  const data: OpenRouterResponse = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('OpenRouter returned empty response.');
  return content;
}

// ─── Unified chatCompletion (OpenRouter primary, z-ai fallback) ──

export async function chatCompletion(
  userMessage: string,
  systemPrompt = GOVERNANCE_SYSTEM,
  history: Array<{ role: 'assistant' | 'user'; content: string }> = []
): Promise<string> {
  // Primary: OpenRouter + Gemini
  if (OPENROUTER_API_KEY) {
    try {
      const messages: OpenRouterMessage[] = [
        { role: 'system', content: systemPrompt },
        ...history.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
        { role: 'user', content: userMessage },
      ];
      return await openRouterChat(messages);
    } catch (err) {
      console.error('[AI] OpenRouter failed, falling back to z-ai:', err);
    }
  }

  // Fallback: z-ai-web-dev-sdk
  const zai = await getZAI();
  const messages = [
    { role: 'assistant' as const, content: systemPrompt },
    ...history,
    { role: 'user' as const, content: userMessage },
  ];
  const completion = await zai.chat.completions.create({
    messages,
    thinking: { type: 'disabled' },
  });
  return completion.choices[0]?.message?.content ?? 'No response generated.';
}

export async function structuredCompletion<T>(
  userMessage: string,
  systemPrompt = GOVERNANCE_SYSTEM,
  history: Array<{ role: 'assistant' | 'user'; content: string }> = []
): Promise<T> {
  // Primary: OpenRouter + Gemini
  if (OPENROUTER_API_KEY) {
    try {
      const sys = systemPrompt + '\n\nIMPORTANT: Respond with valid JSON only. No markdown, no code fences, no extra text.';
      const messages: OpenRouterMessage[] = [
        { role: 'system', content: sys },
        ...history.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
        { role: 'user', content: userMessage },
      ];
      const raw = await openRouterChat(messages);
      // Strip markdown fences if present
      const cleaned = raw.replace(/^```json?\s*/i, '').replace(/\s*```$/i, '').trim();
      return JSON.parse(cleaned) as T;
    } catch (err) {
      console.error('[AI] OpenRouter structured failed, falling back to z-ai:', err);
    }
  }

  // Fallback: z-ai-web-dev-sdk
  const zai = await getZAI();
  const sys = systemPrompt + '\n\nIMPORTANT: Respond with valid JSON only. No markdown, no code fences, no extra text.';
  const messages = [
    { role: 'assistant' as const, content: sys },
    ...history,
    { role: 'user' as const, content: userMessage },
  ];
  const completion = await zai.chat.completions.create({
    messages,
    thinking: { type: 'disabled' },
  });
  const raw = completion.choices[0]?.message?.content ?? '{}';
  // Strip markdown fences if present
  const cleaned = raw.replace(/^```json?\s*/i, '').replace(/\s*```$/i, '').trim();
  return JSON.parse(cleaned) as T;
}

// ═══════════════════════════════════════════════════════════════════
// WEB SEARCH HELPERS (z-ai-web-dev-sdk)
// ═══════════════════════════════════════════════════════════════════

export interface SearchResult {
  url: string;
  name: string;
  snippet: string;
  host_name: string;
  rank: number;
  date: string;
  favicon: string;
}

export async function webSearch(query: string, num = 10): Promise<SearchResult[]> {
  const zai = await getZAI();
  const results = await zai.functions.invoke('web_search', { query, num });
  return (results ?? []) as SearchResult[];
}

export async function searchAndSummarize(query: string): Promise<{
  summary: string;
  sources: Array<{ title: string; url: string }>;
}> {
  const results = await webSearch(query, 8);
  const context = results
    .slice(0, 5)
    .map((r, i) => `${i + 1}. ${r.name}\n${r.snippet}`)
    .join('\n\n');
  const summary = await chatCompletion(
    `Query: "${query}"\n\nSearch Results:\n${context}\n\nProvide a concise, factual summary of these results about Kenyan governance.`,
    'You are a research assistant. Summarize search results clearly and concisely. Focus on governance, budgets, audits, and county-level data.'
  );
  return {
    summary,
    sources: results.slice(0, 5).map(r => ({ title: r.name, url: r.url })),
  };
}
