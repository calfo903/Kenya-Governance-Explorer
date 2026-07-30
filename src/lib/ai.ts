/**
 * AI Service Layer — Kenya Governance Explorer
 * Wraps z-ai-web-dev-sdk for LLM + Web Search operations.
 * All functions are backend-only (server-side).
 */
import ZAI from 'z-ai-web-dev-sdk';

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
Provide accurate, factual answers. Cite sources when possible (OAG, CoB, IEBC, EACC, CRA, Parliament).
If unsure, say so honestly. Format responses in clear markdown with headers and bullet points.`;

export async function chatCompletion(
  userMessage: string,
  systemPrompt = GOVERNANCE_SYSTEM,
  history: Array<{ role: 'assistant' | 'user'; content: string }> = []
): Promise<string> {
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
// WEB SEARCH HELPERS
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
