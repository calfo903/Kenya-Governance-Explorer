/**
 * §2.1 + §5.1 — Budget API with Zod-validated query params and structured logging
 */

import { NextResponse } from 'next/server';
import { countyBudgetData, getNationalBudgetAverages, getTopPerformers, getBottomPerformers } from '@/data/county-budget-data';
import { BudgetQuerySchema, validateQuery } from '@/lib/api-validation';
import { internalError } from '@/lib/api-errors';
import { createLogger } from '@/lib/api-logger';

const log = createLogger('/api/budget');

export async function GET(request: Request) {
  const start = Date.now();
  const parsed = validateQuery(request, BudgetQuerySchema);
  if (!parsed.success) return parsed.response;

  const { county, year } = parsed.data;

  try {
    if (county) {
      const countyCode = county.padStart(3, '0');
      let records = countyBudgetData.filter(r => r.countyCode === countyCode);
      if (records.length === 0) {
        records = countyBudgetData.filter(r =>
          r.countyName.toLowerCase() === county.toLowerCase() ||
          r.countyCode === county
        );
      }

      log.info('County budget data served', {
        county, recordsFound: records.length, durationMs: Date.now() - start,
      });

      return NextResponse.json({
        source: 'Controller of Budget (CoB)',
        lastUpdated: '2026-07-28',
        dataFreshness: {
          verified: records[0]?.source.accessedDate || '2026-07-25',
          source: 'CoB',
        },
        county: records[0]?.countyName || county,
        records: records.map(r => ({
          financialYear: r.financialYear,
          period: r.period,
          totalBudget: r.totalBudget,
          developmentBudget: r.developmentBudget,
          recurrentBudget: r.recurrentBudget,
          devAbsorptionRate: r.devAbsorptionRate,
          recurrentAbsorptionRate: r.recurrentAbsorptionRate,
          ownSourceRevenue: r.ownSourceRevenue,
          pendingBills: r.pendingBills,
          source: r.source,
        })),
      });
    }

    const targetYear = year || 'FY 2024/25';
    const yearRecords = countyBudgetData.filter(r => r.financialYear === targetYear);
    const averages = getNationalBudgetAverages(targetYear);

    log.info('National budget summary served', {
      year: targetYear, countyCount: yearRecords.length, durationMs: Date.now() - start,
    });

    return NextResponse.json({
      source: 'Controller of Budget (CoB)',
      lastUpdated: '2026-07-28',
      dataFreshness: {
        verified: yearRecords[0]?.source.accessedDate || '2026-07-25',
        source: 'CoB',
      },
      financialYear: targetYear,
      averages,
      countyCount: yearRecords.length,
      topPerformers: getTopPerformers(targetYear, 5).map(r => ({
        county: r.countyName,
        code: r.countyCode,
        rate: r.devAbsorptionRate,
        totalBudget: r.totalBudget,
      })),
      bottomPerformers: getBottomPerformers(targetYear, 5).map(r => ({
        county: r.countyName,
        code: r.countyCode,
        rate: r.devAbsorptionRate,
        totalBudget: r.totalBudget,
      })),
      counties: yearRecords.map(r => ({
        code: r.countyCode,
        county: r.countyName,
        totalBudget: r.totalBudget,
        developmentBudget: r.developmentBudget,
        recurrentBudget: r.recurrentBudget,
        devAbsorptionRate: r.devAbsorptionRate,
        recurrentAbsorptionRate: r.recurrentAbsorptionRate,
        ownSourceRevenue: r.ownSourceRevenue,
        pendingBills: r.pendingBills,
      })),
    });
  } catch (err) {
    log.error('Failed to serve budget data', { county, year }, Date.now() - start);
    return internalError('fetch budget');
  }
}
