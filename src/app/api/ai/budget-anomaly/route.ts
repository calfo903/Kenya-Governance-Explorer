import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { chatCompletion } from '@/lib/ai';

interface BudgetAnomalyRequestBody {
  countyCode?: string;
  financialYear?: string;
}

export async function POST(request: Request) {
  try {
    const body: BudgetAnomalyRequestBody = await request.json();
    const { countyCode, financialYear } = body;

    // Build Prisma filter
    const where: Record<string, unknown> = {};
    if (countyCode) where.countyCode = countyCode;
    if (financialYear) where.financialYear = financialYear;

    // Fetch budget records
    const budgets = await db.countyBudgetRecord.findMany({
      where,
      include: { county: { select: { name: true, code: true } } },
      orderBy: [{ countyCode: 'asc' }, { financialYear: 'desc' }],
    });

    if (budgets.length === 0) {
      return NextResponse.json({
        success: true,
        analysis: 'No budget records found matching the specified criteria.',
        anomalies: [],
        countyCode: countyCode ?? 'ALL',
        financialYear: financialYear ?? 'ALL',
      });
    }

    // Format budget data for the LLM
    const budgetSummary = budgets
      .map((b) => {
        const totalDev = (b.developmentBudget / b.totalBudget) * 100;
        const totalRec = (b.recurrentBudget / b.totalBudget) * 100;
        return [
          `County: ${b.county.name} (${b.county.code})`,
          `FY: ${b.financialYear}`,
          `Total Budget: KES ${b.totalBudget.toLocaleString()}`,
          `Development: KES ${b.developmentBudget.toLocaleString()} (${totalDev.toFixed(1)}%)`,
          `Recurrent: KES ${b.recurrentBudget.toLocaleString()} (${totalRec.toFixed(1)}%)`,
          `Dev Absorption: ${(b.devAbsorptionRate * 100).toFixed(1)}%`,
          `Recurrent Absorption: ${(b.recurrentAbsorptionRate * 100).toFixed(1)}%`,
          `Own-Source Revenue: KES ${b.ownSourceRevenue.toLocaleString()}`,
          `Pending Bills: KES ${b.pendingBills.toLocaleString()}`,
        ].join('\n');
      })
      .join('\n---\n');

    const prompt = `Analyze the following Kenyan county budget data and identify anomalies, unusual patterns, and significant changes.

${budgetSummary}

For each anomaly found, explain:
1. What is unusual and why it matters
2. The potential impact on service delivery
3. Whether it warrants further investigation

End your analysis with a concise bulleted list of all anomalies detected.`;

    const analysis = await chatCompletion(prompt);

    // Extract anomaly bullets from the analysis (lines starting with "-" or "*")
    const anomalyLines = analysis
      .split('\n')
      .filter((line) => /^\s*[-*]\s/.test(line) && /anomal/i.test(line));
    const anomalies = anomalyLines.length > 0
      ? anomalyLines.map((l) => l.replace(/^\s*[-*]\s+/, '').trim())
      : ['Review the full analysis for detailed findings.'];

    return NextResponse.json({
      success: true,
      analysis,
      anomalies,
      countyCode: countyCode ?? 'ALL',
      financialYear: financialYear ?? 'ALL',
    });
  } catch (error) {
    console.error('[AI Budget Anomaly] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to analyze budget data.' },
      { status: 500 }
    );
  }
}
