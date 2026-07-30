/**
 * §5.3 Health & Alerts — API health check endpoint
 *
 * Returns system status, version, and data freshness signals.
 * Designed for monitoring systems and load balancers.
 */

import { NextResponse } from 'next/server';

export async function GET() {
  const startTime = Date.now();

  let dataStatus: 'ok' | 'degraded' = 'ok';
  const dataChecks: Array<{ name: string; status: string; latencyMs: number }> = [];

  try {
    const t0 = Date.now();
    const governors = (await import('@/data/governors')).all47Governors;
    dataChecks.push({ name: 'governors', status: 'ok', latencyMs: Date.now() - t0 });
    if (governors.length !== 47) dataStatus = 'degraded';
  } catch {
    dataStatus = 'degraded';
    dataChecks.push({ name: 'governors', status: 'error', latencyMs: 0 });
  }

  try {
    const t0 = Date.now();
    const auditData = (await import('@/data/county-audit-data')).countyAuditData;
    dataChecks.push({ name: 'audit-data', status: 'ok', latencyMs: Date.now() - t0 });
    if (auditData.length === 0) dataStatus = 'degraded';
  } catch {
    dataStatus = 'degraded';
    dataChecks.push({ name: 'audit-data', status: 'error', latencyMs: 0 });
  }

  try {
    const t0 = Date.now();
    const budgetData = (await import('@/data/county-budget-data')).countyBudgetData;
    dataChecks.push({ name: 'budget-data', status: 'ok', latencyMs: Date.now() - t0 });
    if (budgetData.length === 0) dataStatus = 'degraded';
  } catch {
    dataStatus = 'degraded';
    dataChecks.push({ name: 'budget-data', status: 'error', latencyMs: 0 });
  }

  const totalLatency = Date.now() - startTime;
  const isHealthy = dataStatus === 'ok';

  return NextResponse.json(
    {
      status: isHealthy ? 'healthy' : 'degraded',
      version: '1.0.0',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      responseTimeMs: totalLatency,
      data: {
        status: dataStatus,
        modules: dataChecks,
        lastUpdated: '2026-07-28',
      },
      endpoints: {
        '/api/counties': 'GET',
        '/api/audits': 'GET',
        '/api/budget': 'GET',
        '/api/scorecards': 'GET',
        '/api/mzalendo': 'GET',
        '/api/weather': 'GET',
        '/api/news': 'GET',
        '/api/rss': 'GET',
        '/api/stories': 'GET/POST',
        '/api/tips': 'GET/POST',
        '/api/health': 'GET',
      },
    },
    { status: isHealthy ? 200 : 503 },
  );
}
