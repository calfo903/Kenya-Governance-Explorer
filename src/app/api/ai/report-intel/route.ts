import { NextResponse } from 'next/server';
import { structuredCompletion } from '@/lib/ai';

interface ReportIntelRequestBody {
  reportText: string;
  reportId?: string;
}

interface ReportIntelResponse {
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  suggestedActions: string[];
  countyContacts: string[];
}

const REPORT_SYSTEM_PROMPT = `You are an expert analyst for Kenya's county governance system.
You classify citizen reports by governance theme/sector and assess severity.

Categories include but are not limited to: corruption, procurement, health, education, infrastructure, water, land, environment, public safety, finance, service delivery.

Severity levels:
- low: minor concern, administrative issue
- medium: systemic issue affecting service delivery
- high: potential corruption, significant public resource misuse
- critical: imminent threat to public safety, large-scale fraud, or loss of life

For countyContacts, suggest the most relevant county offices (e.g. CECM Finance, County Assembly Budget Committee, EACC, Ombudsman) based on the report category.`;

export async function POST(request: Request) {
  try {
    const body: ReportIntelRequestBody = await request.json();
    const { reportText, reportId } = body;

    if (!reportText || typeof reportText !== 'string' || reportText.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'reportText is required and must be non-empty.' },
        { status: 400 }
      );
    }

    const userMessage = `Classify and analyze the following citizen report:

"""
${reportText.trim()}
"""

Provide:
1. category: The primary governance theme/sector
2. severity: One of "low", "medium", "high", "critical"
3. suggestedActions: Array of 3-5 specific follow-up actions for authorities
4. countyContacts: Array of 3-5 relevant county offices or oversight bodies to contact`;

    const result = await structuredCompletion<ReportIntelResponse>(
      userMessage,
      REPORT_SYSTEM_PROMPT
    );

    // Validate severity value
    const validSeverities = ['low', 'medium', 'high', 'critical'];
    const severity = validSeverities.includes(result.severity)
      ? result.severity
      : 'medium';

    return NextResponse.json({
      success: true,
      category: result.category || 'general',
      severity,
      suggestedActions: Array.isArray(result.suggestedActions)
        ? result.suggestedActions
        : [],
      countyContacts: Array.isArray(result.countyContacts)
        ? result.countyContacts
        : [],
    });
  } catch (error) {
    console.error('[AI Report Intel] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to analyze report.' },
      { status: 500 }
    );
  }
}
