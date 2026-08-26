import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { internalError } from '@/lib/api-errors';
import { createLogger } from '@/lib/api-logger';

const logger = createLogger('/api/db/summary');

export async function GET() {
  const start = performance.now();

  try {
    // ─── County counts ─────────────────────────────────────────────
    const totalCounties = await db.county.count();

    // ─── Coalition distribution ────────────────────────────────────
    const coalitionGroups = await db.governor.groupBy({
      by: ['coalition'],
      _count: true,
      where: { coalition: { not: null } },
    });
    const coalitionDistribution: Record<string, number> = {};
    for (const g of coalitionGroups) {
      if (g.coalition) {
        coalitionDistribution[g.coalition] = g._count;
      }
    }

    // ─── Audit summaries by year ───────────────────────────────────
    const auditRecords = await db.countyAuditRecord.findMany({
      select: {
        financialYear: true,
        executiveOpinion: true,
        assemblyOpinion: true,
      },
    });

    // Group by year and count opinions
    const auditByYear: Record<string, {
      executive: Record<string, number>;
      assembly: Record<string, number>;
    }> = {};

    for (const r of auditRecords) {
      if (!auditByYear[r.financialYear]) {
        auditByYear[r.financialYear] = {
          executive: { Unmodified: 0, Qualified: 0, Adverse: 0, Disclaimer: 0 },
          assembly: { Unmodified: 0, Qualified: 0, Adverse: 0, Disclaimer: 0 },
        };
      }
      const entry = auditByYear[r.financialYear];
      if (r.executiveOpinion && r.executiveOpinion in entry.executive) {
        entry.executive[r.executiveOpinion]++;
      }
      if (r.assemblyOpinion && r.assemblyOpinion in entry.assembly) {
        entry.assembly[r.assemblyOpinion]++;
      }
    }

    const auditSummaries = Object.entries(auditByYear)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([year, data]) => ({
        financialYear: year,
        countyExecutive: data.executive,
        countyAssembly: data.assembly,
      }));

    // ─── Budget summaries by year ──────────────────────────────────
    const budgetRecords = await db.countyBudgetRecord.groupBy({
      by: ['financialYear'],
      _avg: {
        devAbsorptionRate: true,
        recurrentAbsorptionRate: true,
        totalBudget: true,
        ownSourceRevenue: true,
        pendingBills: true,
      },
      _count: true,
    });

    const budgetSummaries = budgetRecords
      .sort((a, b) => b.financialYear.localeCompare(a.financialYear))
      .map((b) => ({
        financialYear: b.financialYear,
        countyCount: b._count,
        avgDevAbsorption: Math.round(b._avg.devAbsorptionRate ?? 0),
        avgRecurrentAbsorption: Math.round(b._avg.recurrentAbsorptionRate ?? 0),
        avgTotalBudget: Math.round((b._avg.totalBudget ?? 0) * 100) / 100,
        totalOwnSourceRevenue: Math.round((b._avg.ownSourceRevenue ?? 0) * b._count),
        totalPendingBills: Math.round((b._avg.pendingBills ?? 0) * b._count),
      }));

    // ─── Top/Bottom performers (latest year) ───────────────────────
    const latestYear = budgetSummaries[0]?.financialYear;
    let topPerformers: { county: string; rate: number }[] = [];
    let bottomPerformers: { county: string; rate: number }[] = [];

    if (latestYear) {
      const latestBudgets = await db.countyBudgetRecord.findMany({
        where: { financialYear: latestYear },
        include: { county: { select: { name: true } } },
        orderBy: { devAbsorptionRate: 'desc' },
      });

      topPerformers = latestBudgets.slice(0, 3).map((b) => ({
        county: b.county.name,
        rate: b.devAbsorptionRate,
      }));
      bottomPerformers = latestBudgets
        .slice(-3)
        .reverse()
        .map((b) => ({
          county: b.county.name,
          rate: b.devAbsorptionRate,
        }));
    }

    const durationMs = Math.round(performance.now() - start);
    logger.info('National summary fetched from DB', { durationMs });

    return NextResponse.json({
      data: {
        totalCounties,
        coalitionDistribution,
        auditSummaries,
        budgetSummaries: budgetSummaries.map((b) => ({
          ...b,
          topPerformers,
          bottomPerformers,
        })),
        lastUpdated: new Date().toISOString().split('T')[0],
      },
      meta: { source: 'database' },
    });
  } catch (error) {
    logger.error('Failed to fetch national summary', { error: String(error) });
    return internalError('fetch national summary from database');
  }
}
