import { NextRequest, NextResponse } from 'next/server';
import {
  listReports,
  getReport,
  buildCountyReportCard,
  getCountyAuditRows,
} from '@/data/oag-reports';

/**
 * GET /api/reports
 *   ?id=oag-summary-2024-25
 *   ?county=047
 *   (no query) → full feed catalog
 *
 * Serves structured report content for in-app consumption.
 * Does not redirect users to external PDFs as the primary UX.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const county = searchParams.get('county');

    if (id) {
      const report = getReport(id);
      if (!report) {
        return NextResponse.json({ error: 'Report not found' }, { status: 404 });
      }
      return NextResponse.json({ report });
    }

    if (county) {
      const card = buildCountyReportCard(county);
      if (!card) {
        return NextResponse.json(
          { error: 'No structured audit data for county', county },
          { status: 404 },
        );
      }
      return NextResponse.json({
        report: card,
        audits: getCountyAuditRows(county),
      });
    }

    return NextResponse.json({
      reports: listReports(),
      meta: {
        mode: 'in-app',
        note: 'Full report bodies are structured in-app. Source PDF URLs are citations only.',
      },
    });
  } catch (e) {
    console.error('[api/reports]', e);
    return NextResponse.json({ error: 'Failed to load reports' }, { status: 500 });
  }
}
