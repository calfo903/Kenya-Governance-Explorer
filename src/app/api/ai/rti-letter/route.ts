import { NextResponse } from 'next/server';
import { chatCompletion } from '@/lib/ai';

interface RTILetterRequestBody {
  countyName: string;
  topic: string;
  recipient?: string;
  additionalDetails?: string;
}

export async function POST(request: Request) {
  try {
    const body: RTILetterRequestBody = await request.json();
    const { countyName, topic, recipient, additionalDetails } = body;

    if (!countyName || typeof countyName !== 'string') {
      return NextResponse.json(
        { success: false, error: 'countyName is required.' },
        { status: 400 }
      );
    }
    if (!topic || typeof topic !== 'string') {
      return NextResponse.json(
        { success: false, error: 'topic is required.' },
        { status: 400 }
      );
    }

    const recipientLine = recipient
      ? `The letter should be addressed to: ${recipient}`
      : 'Address the letter to the County Secretary / Commission on Administrative Justice (CAJ).';

    const detailsBlock = additionalDetails
      ? `\n\nAdditional context provided by the applicant:\n${additionalDetails}`
      : '';

    const systemPrompt = `You are a Kenyan legal assistant specializing in the Access to Information Act, 2016.
You draft formal, professional RTI request letters following the correct legal format for Kenya.`;

    const userMessage = `Draft a formal Right to Information (RTI) request letter with the following details:

- County: ${countyName}
- Information requested about: ${topic}
- ${recipientLine}
${detailsBlock}

The letter MUST include:
1. Applicant's details (use placeholders like [Your Name], [Your ID No.], [Your Address])
2. Date and place
3. Proper salutation and recipient address
4. Clear reference to the Access to Information Act, 2016
5. Specific, detailed description of the information being sought
6. Preferred format of the response
7. A reasonable timeline (21 days as per the Act)
8. Professional closing and signature block

Output the letter in plain text with clear paragraph breaks. Do not use markdown formatting.`;

    const letter = await chatCompletion(userMessage, systemPrompt);

    return NextResponse.json({
      success: true,
      letter,
      countyName,
      topic,
    });
  } catch (error) {
    console.error('[AI RTI Letter] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate RTI letter.' },
      { status: 500 }
    );
  }
}
