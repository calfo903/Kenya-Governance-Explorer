import { NextResponse } from 'next/server';
import { countyBudgetData, getNationalBudgetAverages, getTopPerformers, getBottomPerformers } from '@/data/county-budget-data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const county = searchParams.get('county');
  const year = searchParams.get('year');

  if (county) {
    // County-specific budget data
    const countyCode = county.padStart(3, '0');
    let records = countyBudgetData.filter(r => r.countyCode === countyCode);
    if (records.length === 0) {
      records = countyBudgetData.filter(r =>
        r.countyName.toLowerCase() === county.toLowerCase() ||
        r.countyCode === county
      );
    }
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

  // National summary
  const targetYear = year || 'FY 2024/25';
  const yearRecords = countyBudgetData.filter(r => r.financialYear === targetYear);
  const averages = getNationalBudgetAverages(targetYear);

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
}
