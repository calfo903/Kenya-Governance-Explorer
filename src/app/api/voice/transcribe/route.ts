import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createLogger } from '@/lib/api-logger';
import { badRequest, internalError } from '@/lib/api-errors';

const logger = createLogger('/api/voice/transcribe');

/**
 * POST /api/voice/transcribe
 * Real Speech-to-Text Transcription Gateway.
 * Processes uploaded audio streams (M4A/MP3/WAV) from local county voice diaries, 
 * dispatches them directly to the OpenAI Whisper API, and commits the transcription to SQLite.
 */
export async function POST(request: Request) {
  const start = performance.now();
  try {
    const formData = await request.formData();
    const audioFile = formData.get('file') as File;
    const countyName = formData.get('countyName') as string || 'USSD/Voice Anonymous';
    const category = formData.get('category') as string || 'corruption';

    if (!audioFile) {
      return badRequest('file', 'An audio file stream (m4a, mp3, or wav) is required for transcription.');
    }

    const openAiKey = process.env.OPENAI_API_KEY;
    let transcriptionText = '';

    if (openAiKey) {
      // 1. Dispatch Stream directly to OpenAI Whisper REST Endpoint
      const whisperFormData = new FormData();
      whisperFormData.append('file', audioFile);
      whisperFormData.append('model', 'whisper-1');
      whisperFormData.append('language', 'sw'); // Direct support for Kiswahili verbal submissions!

      const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAiKey}`
        },
        body: whisperFormData
      });

      if (whisperResponse.ok) {
        const whisperData = await whisperResponse.json();
        transcriptionText = whisperData.text;
      } else {
        const whisperError = await whisperResponse.text();
        logger.error('OpenAI Whisper transcription failed', { status: whisperResponse.status, whisperError });
        throw new Error('Whisper speech-to-text processing failed.');
      }
    } else {
      // Fallback: Return message detailing missing credentials
      transcriptionText = `[Voice submission received: File name ${audioFile.name}, size ${(audioFile.size / 1024).toFixed(1)} KB. Unable to transcribe as OPENAI_API_KEY is missing from environment.]`;
    }

    // 2. Commit the transcribed verbal report into SQLite via Prisma
    const tip = await db.citizenTip.create({
      data: {
        countyName,
        category,
        description: `[Transcribed Voice Submission]: ${transcriptionText}`,
        anonymous: true
      }
    });

    const durationMs = Math.round(performance.now() - start);
    logger.info('Voice report transcribed and saved successfully', { tipId: tip.id, sizeBytes: audioFile.size, durationMs });

    return NextResponse.json({
      success: true,
      tipId: tip.id,
      transcription: transcriptionText,
      audioFileName: audioFile.name,
      audioSizeKB: (audioFile.size / 1024).toFixed(2),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Failed to process voice transcription', { error: String(error) });
    return internalError('OpenAI Whisper Speech-to-Text translation');
  }
}
