import { db } from '@/lib/db';
import { createLogger } from '@/lib/api-logger';

const logger = createLogger('/api/ussd/callback');

/**
 * POST /api/ussd/callback
 * Real-World GSM USSD Callback Gateway.
 * Integrates directly with Safaricom / Airtel telco protocols (via Africa's Talking API).
 * Parses URL-encoded parameters, queries the SQLite database, and returns standard GSM plain-text responses.
 *
 * Africa's Talking POST parameters:
 * - sessionId: Unique identifier for the USSD session
 * - phoneNumber: Subscriber's mobile number
 * - text: Direct user input (joined by asterisk * on multi-level navigation)
 */
export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const params = new URLSearchParams(rawBody);

    const sessionId = params.get('sessionId') || 'unknown';
    const phoneNumber = params.get('phoneNumber') || 'unknown';
    const text = params.get('text') || '';

    const inputs = text.split('*');
    const level = text === '' ? 0 : inputs.length;

    let responseMessage = '';

    if (level === 0) {
      // Main Landing Screen (CON = Continue Session)
      responseMessage = `CON Mchunguzi wa Kaunti (County Explorer)\n1. Angalia Bajeti (Check Budget)\n2. Orodha ya Ukaguzi (OAG Audits)\n3. Ripoti Ufisadi (Report Graft)\n4. Toka (Exit)`;
    } else {
      const mainOption = inputs[0];

      if (mainOption === '1') {
        // Option 1: Check County Budget
        if (level === 1) {
          responseMessage = `CON Weka namba ya Kaunti (Enter County Code, e.g. 047 for Nairobi):`;
        } else if (level === 2) {
          const countyCode = inputs[1].padStart(3, '0');
          
          // Query real database
          const county = await db.county.findUnique({
            where: { code: countyCode },
            include: { budgetRecords: { take: 1, orderBy: { createdAt: 'desc' } } }
          });

          const budget = county?.budgetRecords[0];

          if (county && budget) {
            responseMessage = `END Kaunti: ${county.name}\nBajeti: KSh ${(budget.totalBudget / 1e9).toFixed(2)}B\nMaendeleo (Dev): ${budget.devAbsorptionRate}%\nPending Bills: KSh ${(budget.pendingBills / 1e6).toFixed(1)}M`;
          } else {
            responseMessage = `END Hitilafu: Kaunti ya namba "${countyCode}" haikupatikana katika hifadhidata.`;
          }
        }
      } else if (mainOption === '2') {
        // Option 2: Check OAG Audit opinions
        if (level === 1) {
          responseMessage = `CON Weka namba ya Kaunti kuona Ripoti ya Ukaguzi wa OAG:`;
        } else if (level === 2) {
          const countyCode = inputs[1].padStart(3, '0');

          const county = await db.county.findUnique({
            where: { code: countyCode },
            include: { auditRecords: { take: 1, orderBy: { createdAt: 'desc' } } }
          });

          const audit = county?.auditRecords[0];

          if (county && audit) {
            responseMessage = `END Kaunti: ${county.name}\nMaoni ya OAG: ${audit.executiveOpinion || 'Qualified'}\nMwaka: ${audit.financialYear}\nMizani imekamilika kikamilifu.`;
          } else {
            responseMessage = `END Hitilafu: Data ya ukaguzi kwa Kaunti ya namba "${countyCode}" haipatikani.`;
          }
        }
      } else if (mainOption === '3') {
        // Option 3: Report Corruption (Anonymous)
        if (level === 1) {
          responseMessage = `CON Eleza kwa kifupi kisa cha ufisadi ulichokishuhudia (Describe graft incident, min 10 chars):`;
        } else if (level === 2) {
          const description = inputs[1];

          if (description.trim().length < 10) {
            responseMessage = `END Ujumbe ni mfupi mno. Tafadhali wasilisha ripoti yenye maelezo ya kutosha.`;
          } else {
            // Save as plain anonymous tip in database
            const tip = await db.citizenTip.create({
              data: {
                countyName: 'USSD Anonymous Gateway',
                category: 'corruption',
                description: `[USSD REPORT - Phone: ${phoneNumber.slice(0, 7)}****]: ${description}`,
                anonymous: true
              }
            });

            responseMessage = `END Ripoti Imewasilishwa! ID: ${tip.id.slice(0, 8).toUpperCase()}.\nAsante kwa kupambana na ufisadi nchini Kenya.`;
          }
        }
      } else {
        // Option 4 or fallback: Exit
        responseMessage = `END Asante kwa kutumia huduma yetu ya Mchunguzi wa Utawala wa Kenya. Usalama wa ugatuzi ni wajibu wetu sote!`;
      }
    }

    logger.info('GSM USSD Session Triggered', { sessionId, level, inputsCount: inputs.length });

    // Africa's Talking USSD requires returning plain text with specific header prefixes
    return new Response(responseMessage, {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    logger.error('GSM USSD Handler Failure', { error: String(error) });
    return new Response('END Hitilafu ya mfumo. Tafadhali jaribu tena baadaye.', {
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}
