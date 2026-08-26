import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { chatCompletion } from '@/lib/ai';
import { createLogger } from '@/lib/api-logger';
import { badRequest, internalError } from '@/lib/api-errors';

const logger = createLogger('/api/legal/draft-petition');

interface PetitionRequest {
  countyCode: string;
  petitionerName: string;
  targetInfraction: string; // e.g. "hospital stalled", "inflated road cost", "pending bills"
}

/**
 * POST /api/legal/draft-petition
 * Real AI Constitutional Court Petition Writer.
 * Queries actual county budgets and OAG audit opinions from SQLite via Prisma, 
 * dispatches the analytical context to OpenRouter/Gemini, and drafts a formal, legally structured
 * Public Interest Litigation (PIL) Petition under Article 22 & 258 of the Constitution of Kenya 2010.
 */
export async function POST(request: Request) {
  const start = performance.now();
  try {
    const body: PetitionRequest = await request.json();
    const { countyCode, petitionerName, targetInfraction } = body;

    if (!countyCode || !petitionerName || !targetInfraction) {
      return badRequest('countyCode', 'countyCode, petitionerName, and targetInfraction are required.');
    }

    // 1. Query the database for real county budget and audit data to build the legal evidentiary basis
    const county = await db.county.findUnique({
      where: { code: countyCode },
      include: {
        budgetRecords: { take: 1, orderBy: { createdAt: 'desc' } },
        auditRecords: { take: 1, orderBy: { createdAt: 'desc' } }
      }
    });

    if (!county) {
      return badRequest('countyCode', `County with code "${countyCode}" not found.`);
    }

    const budget = county.budgetRecords[0];
    const audit = county.auditRecords[0];

    const budgetDataStr = budget 
      ? `Total Budget: KSh ${(budget.totalBudget / 1e9).toFixed(2)}B, Recurrent: KSh ${(budget.recurrentBudget / 1e9).toFixed(2)}B, Development: KSh ${(budget.developmentBudget / 1e9).toFixed(2)}B, Dev Absorption: ${budget.devAbsorptionRate}%, Pending Bills: KSh ${(budget.pendingBills / 1e6).toFixed(1)}M.`
      : 'No dynamic budget records available.';

    const auditDataStr = audit
      ? `Office of the Auditor General Executive Opinion: ${audit.executiveOpinion || 'QUALIFIED'}, Assembly Opinion: ${audit.assemblyOpinion || 'UNMODIFIED'}, Findings: ${audit.keyFindings}.`
      : 'No dynamic OAG audit opinions available.';

    // 2. Draft the AI Court Petition via OpenRouter / Gemini
    const systemPrompt = `You are a Senior Constitutional Advocate of the High Court of Kenya.
Your task is to write a formal Public Interest Litigation (PIL) Court Petition under Article 22 and Article 258 of the Constitution of Kenya 2010.
You must adhere strictly to the formal legal drafting structures of the High Court of Kenya (Judicial Review and Constitutional Division).
Include formal sections:
1. Title and Parties (In the Matter of Article 22 & 258, and In the Matter of County Government Act)
2. Statement of Facts (using provided OAG and budget data as evidence)
3. Constitutional Violations (Article 201 - Public Finance principles, Article 10 - Values of Governance, Article 43 - Economic/Social rights)
4. Prayers/Reliefs sought from the Court (conservatory orders, accounting audits, declaration of unconstitutionality).`;

    const userMessage = `Draft a PIL petition for petitioner "${petitionerName}" against the County Government of ${county.name}.
Specific Ground/Infraction: "${targetInfraction}"

EVIDENTIARY DATA FROM OFFICE OF THE AUDITOR GENERAL:
${auditDataStr}

EVIDENTIARY FINANCIAL DATA FROM CONTROLLER OF BUDGET:
${budgetDataStr}

Draft the petition with extreme legal rigor. Keep it highly professional and complete.`;

    const petitionText = await chatCompletion(userMessage, systemPrompt);

    const durationMs = Math.round(performance.now() - start);
    logger.info('Constitutional PIL Petition drafted successfully', { countyCode, petitionerName, durationMs });

    return NextResponse.json({
      success: true,
      countyCode,
      countyName: county.name,
      petitionerName,
      targetInfraction,
      petitionDraft: petitionText,
      legalReference: {
        constitutionalArticles: ['Article 2', 'Article 10', 'Article 22', 'Article 201', 'Article 227', 'Article 258'],
        governanceStatutes: ['County Governments Act 2012', 'Public Finance Management (PFM) Act 2012', 'Public Procurement and Asset Disposal (PPAD) Act 2015'],
        courtDivision: 'High Court of Kenya (Constitutional and Human Rights Division)'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('AI PIL petition generation failed', { error: String(error) });
    return internalError('OpenRouter/Gemini Constitutional PIL Petition writer');
  }
}
