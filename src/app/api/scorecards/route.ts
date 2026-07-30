/**
 * §2.1 + §5.1 — Scorecards API with Zod-validated query params and structured logging
 */

import { NextResponse } from 'next/server';
import { nationalSummary } from '@/data/national-summary';
import { ScorecardsQuerySchema, validateQuery } from '@/lib/api-validation';
import { internalError } from '@/lib/api-errors';
import { createLogger } from '@/lib/api-logger';

const log = createLogger('/api/scorecards');

export async function GET(request: Request) {
  const start = Date.now();
  const parsed = validateQuery(request, ScorecardsQuerySchema);
  if (!parsed.success) return parsed.response;

  const { year } = parsed.data;

  try {
    const summaries = nationalSummary.budgetSummaries;
    const target = year ? summaries.find(s => s.financialYear === year) : summaries[0];

    log.info('Scorecards data served', {
      year: year || 'latest',
      durationMs: Date.now() - start,
    });

    return NextResponse.json({
      lastUpdated: '2026-07-28',
      dataFreshness: {
        verified: target?.source.accessedDate || '2026-07-25',
        source: 'CoB',
      },
      summary: target ? {
        financialYear: target.financialYear,
        period: target.period,
        avgDevelopmentAbsorption: target.avgDevelopmentAbsorption,
        avgRecurrentAbsorption: target.avgRecurrentAbsorption,
        totalUnspentAmount: target.totalUnspentAmount,
        topPerformers: target.topPerformers,
        bottomPerformers: target.bottomPerformers,
        source: target.source,
      } : null,
      allSummaries: summaries.map(s => ({
        financialYear: s.financialYear,
        period: s.period,
        avgDevelopmentAbsorption: s.avgDevelopmentAbsorption,
        avgRecurrentAbsorption: s.avgRecurrentAbsorption,
        totalUnspentAmount: s.totalUnspentAmount,
      })),
    });
  } catch (err) {
    log.error('Failed to serve scorecards', { year }, Date.now() - start);
    return internalError('fetch scorecards');
  }
}
