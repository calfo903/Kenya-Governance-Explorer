import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createLogger } from '@/lib/api-logger';

const logger = createLogger('/api/db/ingest');

interface IngestionPayload {
  secretKey: string;
  countyData: {
    code: string;
    name: string;
    region: string;
    capital: string;
    population: number;
    areaSqKm: number;
    constituencies: number;
    wards: number;
  };
  auditRecord?: {
    financialYear: string;
    executiveOpinion: string;
    assemblyOpinion: string;
    keyFindings: string[]; // JSON array of string findings
  };
  budgetRecord?: {
    financialYear: string;
    totalBudget: number;
    developmentBudget: number;
    recurrentBudget: number;
    devAbsorptionRate: number;
    recurrentAbsorptionRate: number;
    ownSourceRevenue: number;
    pendingBills: number;
  };
}

/**
 * POST /api/db/ingest
 * Protected Admin Data Ingestion API.
 * Receives structured JSON extracted from newly compiled OAG and CoB PDFs, 
 * updating the database records cleanly.
 */
export async function POST(request: Request) {
  try {
    const body: IngestionPayload = await request.json();
    const { secretKey, countyData, auditRecord, budgetRecord } = body;

    // Secure token defense (matching database secret key validation)
    const secureToken = process.env.INGESTION_SECRET_KEY || 'kenya-governance-explorer-secret-ingest-token-2026';
    if (secretKey !== secureToken) {
      logger.warn('Unauthorized ingestion attempt blocked.', { countyCode: countyData?.code });
      return NextResponse.json({ success: false, error: 'Unauthorized: Invalid Ingestion Secret Key.' }, { status: 401 });
    }

    if (!countyData || !countyData.code || !countyData.name) {
      return NextResponse.json({ success: false, error: 'Invalid payload: Missing core County metadata.' }, { status: 400 });
    }

    // 1. Upsert County Record
    const county = await db.county.upsert({
      where: { code: countyData.code },
      update: {
        population: countyData.population,
        areaSqKm: countyData.areaSqKm,
        constituencies: countyData.constituencies,
        wards: countyData.wards,
        region: countyData.region,
        capital: countyData.capital,
      },
      create: {
        id: countyData.code,
        code: countyData.code,
        name: countyData.name,
        region: countyData.region,
        capital: countyData.capital,
        population: countyData.population,
        areaSqKm: countyData.areaSqKm,
        constituencies: countyData.constituencies,
        wards: countyData.wards,
      }
    });

    // 2. Insert or update Audit Record
    let upsertedAudit = null;
    if (auditRecord) {
      // Find matching record to avoid duplicate financial year entries
      const existingAudit = await db.countyAuditRecord.findFirst({
        where: {
          countyCode: countyData.code,
          financialYear: auditRecord.financialYear
        }
      });

      if (existingAudit) {
        upsertedAudit = await db.countyAuditRecord.update({
          where: { id: existingAudit.id },
          data: {
            executiveOpinion: auditRecord.executiveOpinion,
            assemblyOpinion: auditRecord.assemblyOpinion,
            keyFindings: JSON.stringify(auditRecord.keyFindings)
          }
        });
      } else {
        upsertedAudit = await db.countyAuditRecord.create({
          data: {
            countyCode: countyData.code,
            financialYear: auditRecord.financialYear,
            executiveOpinion: auditRecord.executiveOpinion,
            assemblyOpinion: auditRecord.assemblyOpinion,
            keyFindings: JSON.stringify(auditRecord.keyFindings)
          }
        });
      }
    }

    // 3. Insert or update Budget Record
    let upsertedBudget = null;
    if (budgetRecord) {
      const existingBudget = await db.countyBudgetRecord.findFirst({
        where: {
          countyCode: countyData.code,
          financialYear: budgetRecord.financialYear
        }
      });

      if (existingBudget) {
        upsertedBudget = await db.countyBudgetRecord.update({
          where: { id: existingBudget.id },
          data: {
            totalBudget: budgetRecord.totalBudget,
            developmentBudget: budgetRecord.developmentBudget,
            recurrentBudget: budgetRecord.recurrentBudget,
            devAbsorptionRate: budgetRecord.devAbsorptionRate,
            recurrentAbsorptionRate: budgetRecord.recurrentAbsorptionRate,
            ownSourceRevenue: budgetRecord.ownSourceRevenue,
            pendingBills: budgetRecord.pendingBills
          }
        });
      } else {
        upsertedBudget = await db.countyBudgetRecord.create({
          data: {
            countyCode: countyData.code,
            financialYear: budgetRecord.financialYear,
            totalBudget: budgetRecord.totalBudget,
            developmentBudget: budgetRecord.developmentBudget,
            recurrentBudget: budgetRecord.recurrentBudget,
            devAbsorptionRate: budgetRecord.devAbsorptionRate,
            recurrentAbsorptionRate: budgetRecord.recurrentAbsorptionRate,
            ownSourceRevenue: budgetRecord.ownSourceRevenue,
            pendingBills: budgetRecord.pendingBills
          }
        });
      }
    }

    logger.info('County governance data ingested successfully.', { countyCode: county.code });

    return NextResponse.json({
      success: true,
      countyCode: county.code,
      countyUpserted: true,
      auditIngested: !!upsertedAudit,
      budgetIngested: !!upsertedBudget,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Database ingestion failed', { error: String(error) });
    return NextResponse.json({ success: false, error: `Ingestion failed: ${error instanceof Error ? error.message : 'Unknown'}` }, { status: 500 });
  }
}
