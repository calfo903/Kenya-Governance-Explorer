import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createLogger } from '@/lib/api-logger';
import { badRequest, internalError } from '@/lib/api-errors';

const logger = createLogger('/api/zk-poll/verify');

interface ZKBallotProof {
  proof: {
    pi_a: string[];
    pi_b: string[][];
    pi_c: string[];
  };
  publicSignals: {
    merkleRoot: string;
    nullifierHash: string;
    voteChoiceHash: string;
  };
}

/**
 * POST /api/zk-poll/verify
 * Cryptographic zk-SNARK Ballot Verification Endpoint.
 * Validates a zero-knowledge proof of county voter registry membership.
 *
 * NOTE: Currently rejects all proofs until a real Groth16 pairing library
 * (e.g. snarkjs) is integrated. Field membership alone is insufficient.
 */
export async function POST(request: Request) {
  const start = performance.now();
  try {
    const ballot: ZKBallotProof = await request.json();
    const { proof, publicSignals } = ballot;

    if (!proof || !publicSignals || !publicSignals.merkleRoot || !publicSignals.nullifierHash) {
      return badRequest('proof', 'Missing zk-SNARK cryptographic parameters: proof, merkleRoot, or nullifierHash.');
    }

    // 1. Double-Voting Prevention — sanitize nullifier to prevent injection
    const safeNullifier = publicSignals.nullifierHash.replace(/["\\]/g, '');
    const existingBallotWithNullifier = await db.citizenTip.findFirst({
      where: {
        description: {
          contains: `"nullifierHash":"${safeNullifier}"`
        }
      }
    }).catch(() => null);

    if (existingBallotWithNullifier) {
      logger.warn('ZK Double-Vote Blocked: Nullifier hash already spent.', { nullifierHash: safeNullifier });
      return NextResponse.json({
        success: false,
        error: 'Double-voting detected. This anonymous voter ballot nullifier has already been spent.',
        code: 'NULLIFIER_SPENT'
      }, { status: 409 });
    }

    // 2. Proof verification
    // TODO: Integrate snarkjs or a proper BN254 pairing library for real Groth16 verification.
    // Field membership alone provides NO cryptographic guarantee.
    let isProofValid = false;
    try {
      const pi_a_pts = proof.pi_a.map(x => BigInt(x));
      const pi_c_pts = proof.pi_c.map(x => BigInt(x));
      const FIELD_P = BigInt('21888242871839275222246405745257275088696311157297823662689037894645226208583');
      const onCurveA = pi_a_pts.every(pt => pt >= BigInt(0) && pt < FIELD_P);
      const onCurveC = pi_c_pts.every(pt => pt >= BigInt(0) && pt < FIELD_P);

      if (!onCurveA || !onCurveC) {
        isProofValid = false;
      } else {
        // Fail closed: real pairing verification requires a dedicated library
        logger.warn('ZK proof received but pairing verification not yet implemented — rejecting for safety.');
        isProofValid = false;
      }
    } catch (err) {
      logger.error('Bilinear pairing curve parsing failed', { error: String(err) });
    }

    if (!isProofValid) {
      logger.warn('Cryptographic zk-SNARK pairings check failed. Invalid voter proof.');
      return NextResponse.json({
        success: false,
        error: 'ZK proof verification is not yet implemented. This endpoint requires a pairing library integration.',
        code: 'PROOF_NOT_YET_VERIFIED'
      }, { status: 501 });
    }

    const durationMs = Math.round(performance.now() - start);
    logger.info('Anonymous zk-SNARK ballot verified successfully.', {
      merkleRoot: publicSignals.merkleRoot,
      nullifierHash: safeNullifier,
      durationMs
    });

    return NextResponse.json({
      success: true,
      verificationStatus: 'VERIFIED',
      nullifierHash: safeNullifier,
      isDemo: false,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Failed to execute ZK proof pairings verification', { error: String(error) });
    return internalError('zk-SNARK mathematical pairs validation');
  }
}
