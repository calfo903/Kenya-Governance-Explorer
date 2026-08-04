/**
 * §4 — Persistent Citizen Tips API (Prisma-backed) with Merkle-Chain Tamper-Evident Ledger
 *
 * POST: Create a whistleblower tip, cryptographically linked to the previous tip's hash
 * GET: List tips (NEVER returns full description, only preview)
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  TipCreateSchema, DbTipQuerySchema,
  validateQuery, validateBody,
} from '@/lib/api-validation';
import { internalError } from '@/lib/api-errors';
import { createLogger } from '@/lib/api-logger';
import crypto from 'crypto';

const log = createLogger('/api/db/tips');

export async function GET(request: Request) {
  const start = performance.now();

  const validation = validateQuery(request, DbTipQuerySchema);
  if (!validation.success) return validation.response;

  const { county, category, status, from, to, page, limit } = validation.data;

  try {
    const where: Record<string, unknown> = {};
    if (county) where.countyName = county;
    if (category) where.category = category;
    if (status) where.status = status;
    if (from || to) {
      const dateFilter: Record<string, Date> = {};
      if (from) dateFilter.gte = new Date(from);
      if (to) dateFilter.lte = new Date(to);
      where.createdAt = dateFilter;
    }

    const [tips, total] = await Promise.all([
      db.citizenTip.findMany({
        where: Object.keys(where).length > 0 ? where : undefined,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.citizenTip.count({
        where: Object.keys(where).length > 0 ? where : undefined,
      }),
    ]);

    // §2.4 — NEVER return full tip description in listing
    const safeTips = tips.map(t => {
      let descriptionPreview = t.description;
      let isChainSecure = true;

      try {
        const parsed = JSON.parse(t.description);
        if (parsed.encryptedPayload) {
          descriptionPreview = '[Asymmetrically Encrypted Public-Key Payload Package]';
        } else if (parsed.rawDescription) {
          descriptionPreview = parsed.rawDescription;
        }
      } catch {
        // Legacy plain description fallback
      }

      if (descriptionPreview.length > 60) {
        descriptionPreview = descriptionPreview.slice(0, 60) + '...';
      }

      return {
        id: t.id,
        countyName: t.countyName,
        category: t.category,
        anonymous: t.anonymous,
        status: t.status,
        adminNotes: t.adminNotes,
        descriptionPreview,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      };
    });

    const durationMs = Math.round(performance.now() - start);
    log.info('Tips fetched from DB', { total, returned: safeTips.length, page, limit, county, category, status, durationMs });

    return NextResponse.json({
      count: total,
      page,
      limit,
      tips: safeTips,
    });
  } catch (error) {
    log.error('Failed to fetch tips from DB', { county, category, status }, Math.round(performance.now() - start));
    return internalError('fetch tips from database');
  }
}

export async function POST(request: Request) {
  const start = performance.now();

  const parsed = await validateBody(request, TipCreateSchema);
  if (!parsed.success) return parsed.response;

  const { countyName, category, description, anonymous } = parsed.data;

  try {
    // ═══════════════════════════════════════════════════════════════
    // Suggestion 3: Merkle-Chain Tamper-Evident Ledger Implementation
    // ═══════════════════════════════════════════════════════════════
    
    // 1. Fetch the most recent tip in the database to get the previous block hash
    const previousTip = await db.citizenTip.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    let previousHash = '0000000000000000000000000000000000000000000000000000000000000000'; // Genesis block hash
    
    if (previousTip) {
      try {
        const lastPkg = JSON.parse(previousTip.description);
        if (lastPkg.merkleHash) {
          previousHash = lastPkg.merkleHash;
        } else {
          // If the last tip didn't have a merkle hash parameter (legacy tip), compute its SHA-256
          previousHash = crypto.createHash('sha256').update(previousTip.description).digest('hex');
        }
      } catch {
        previousHash = crypto.createHash('sha256').update(previousTip.description).digest('hex');
      }
    }

    // 2. Formulate the current block data package
    let finalDescription = description;
    let isAsymmetric = false;

    try {
      const parsedPkg = JSON.parse(description);
      if (parsedPkg.encryptedPayload && parsedPkg.iv) {
        // It's already an asymmetric JSON package
        isAsymmetric = true;
        const currentDataToHash = parsedPkg.encryptedPayload + parsedPkg.iv + previousHash;
        const merkleHash = crypto.createHash('sha256').update(currentDataToHash).digest('hex');
        
        finalDescription = JSON.stringify({
          ...parsedPkg,
          previousHash,
          merkleHash,
          chainSecure: true
        });
      }
    } catch {
      // It's plain text description, package it into a JSON block to support chaining
    }

    if (!isAsymmetric) {
      const currentDataToHash = description + previousHash;
      const merkleHash = crypto.createHash('sha256').update(currentDataToHash).digest('hex');

      finalDescription = JSON.stringify({
        rawDescription: description,
        previousHash,
        merkleHash,
        chainSecure: true
      });
    }

    // 3. Save to Prisma SQLite database
    const tip = await db.citizenTip.create({
      data: { 
        countyName, 
        category, 
        description: finalDescription, 
        anonymous 
      },
    });

    const durationMs = Math.round(performance.now() - start);
    log.info('Tip created with Merkle-Chain signature', {
      tipId: tip.id,
      county: countyName,
      category,
      anonymous,
      merkleHash: JSON.parse(finalDescription).merkleHash,
      durationMs,
    });

    return NextResponse.json({
      success: true,
      tipId: tip.id,
      message: 'Tip submitted successfully. Secure Merkle-Chain Block committed. Your identity is protected.',
    }, { status: 201 });
  } catch (error) {
    log.error('Failed to create tip in DB with Merkle chain', { countyName, category }, Math.round(performance.now() - start));
    return internalError('create tip in database with Merkle chain');
  }
}
