/**
 * Root API endpoint — redirects to health check
 */

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    name: 'Kenya Governance Explorer API',
    version: '1.0.0',
    health: '/api/health',
    endpoints: {
      data: ['/api/counties', '/api/audits', '/api/budget', '/api/scorecards', '/api/mzalendo'],
      civic: ['/api/stories', '/api/tips'],
      content: ['/api/weather', '/api/news', '/api/rss'],
      system: ['/api/health'],
    },
  });
}
