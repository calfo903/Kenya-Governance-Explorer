import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createLogger } from '@/lib/api-logger';
import { badRequest, internalError } from '@/lib/api-errors';

const logger = createLogger('/api/budget/recommend');

interface BudgetRecommendationRequest {
  countyName: string;
  devBudgetPercent: number;
  sectorAllocations: Record<string, number>; // e.g. { health: 25, education: 15, ... }
  voterAge?: number;
}

/**
 * POST: Record a citizen's simulated budget allocation recommendation into SQLite.
 * GET: Performs real multi-tenant aggregate calculations (mean averages) across all recommendations 
 *      to produce a scientifically sound "People's Budget" Recommendation.
 */
export async function POST(request: Request) {
  const start = performance.now();
  try {
    const body: BudgetRecommendationRequest = await request.json();
    const { countyName, devBudgetPercent, sectorAllocations, voterAge } = body;

    if (!countyName || !devBudgetPercent || !sectorAllocations) {
      return badRequest('countyName', 'countyName, devBudgetPercent, and sectorAllocations are required.');
    }

    // Save as a Citizen Story or Tip representing their fiscal priority, or save to db
    // Since we want to query this back, we can store it in CitizenStory with specific tags!
    const recommendation = await db.citizenStory.create({
      data: {
        countyName,
        sector: 'other',
        title: `[BudgetSim] ${countyName} Citizen Budget Allocation`,
        experience: JSON.stringify({
          devBudgetPercent,
          sectorAllocations,
          voterAge: voterAge || 30
        }),
        rating: 5,
        anonymous: true
      }
    });

    const durationMs = Math.round(performance.now() - start);
    logger.info('Citizen budget recommendation submitted.', { countyName, durationMs });

    return NextResponse.json({
      success: true,
      id: recommendation.id,
      message: 'Your budget recommendations have been recorded. They are mathematically aggregated into the county CBEF advisory.'
    });

  } catch (error) {
    logger.error('Failed to submit budget recommendation', { error: String(error) });
    return internalError('submit budget recommendation');
  }
}

export async function GET(request: Request) {
  const start = performance.now();
  const { searchParams } = new URL(request.url);
  const countyName = searchParams.get('county');

  if (!countyName) {
    return badRequest('county', 'county query parameter is required.');
  }

  try {
    // 1. Query all saved budget recommendations for this county from the SQLite database
    const recommendations = await db.citizenStory.findMany({
      where: {
        countyName,
        title: { startsWith: '[BudgetSim]' }
      },
      select: { experience: true }
    });

    if (recommendations.length === 0) {
      return NextResponse.json({
        success: true,
        county: countyName,
        totalResponses: 0,
        consensusDevPercent: 35.0, // Fallback baseline average
        consensusSectorAllocations: {
          health: 22.0,
          education: 18.0,
          roads: 15.0,
          water: 12.0,
          agriculture: 10.0,
          security: 10.0,
          social: 8.0,
          markets: 5.0
        }
      });
    }

    // 2. Perform Real Statistical Group Aggregations (mean averages)
    let totalDevPct = 0;
    const sectorSums: Record<string, number> = {};
    let parsedCount = 0;

    for (const rec of recommendations) {
      try {
        const data = JSON.parse(rec.experience);
        if (data.devBudgetPercent && data.sectorAllocations) {
          totalDevPct += data.devBudgetPercent;
          
          for (const [sector, value] of Object.entries(data.sectorAllocations)) {
            sectorSums[sector] = (sectorSums[sector] || 0) + (value as number);
          }
          parsedCount++;
        }
      } catch {
        // Skip malformed records
      }
    }

    if (parsedCount === 0) {
      throw new Error('No parseable recommendations found.');
    }

    const consensusDevPercent = parseFloat((totalDevPct / parsedCount).toFixed(1));
    const consensusSectorAllocations: Record<string, number> = {};

    for (const [sector, sum] of Object.entries(sectorSums)) {
      consensusSectorAllocations[sector] = parseFloat((sum / parsedCount).toFixed(1));
    }

    const durationMs = Math.round(performance.now() - start);
    logger.info('Calculated real People\'s Budget averages from database', { countyName, totalResponses: parsedCount, durationMs });

    return NextResponse.json({
      success: true,
      county: countyName,
      totalResponses: parsedCount,
      consensusDevPercent,
      consensusSectorAllocations,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Failed to compute budget consensus', { countyName, error: String(error) });
    return internalError('aggregate citizen budget recommendations');
  }
}
