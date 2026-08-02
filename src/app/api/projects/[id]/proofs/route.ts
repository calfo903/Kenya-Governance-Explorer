import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// ── Constants ──
const MAX_PROOFS_PER_PROJECT = 200;
const MAX_REPLIES_PER_PROOF = 50;
const MAX_UPVOTES_PER_PROOF = 10000;

// Simple in-memory rate limiter: IP → { lastUpvote timestamps }
const upvoteRateLimit = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_UPVOTES = 5; // max 5 upvotes per minute per IP

function getClientIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = upvoteRateLimit.get(ip) || [];
  // Prune old entries
  const recent = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS);
  upvoteRateLimit.set(ip, recent);
  return recent.length >= RATE_LIMIT_MAX_UPVOTES;
}

function recordUpvote(ip: string): void {
  const timestamps = upvoteRateLimit.get(ip) || [];
  timestamps.push(Date.now());
  upvoteRateLimit.set(ip, timestamps);
}

// In-memory store for citizen proofs (in production, use a database)
interface CitizenProof {
  id: string;
  projectId: string;
  type: 'video' | 'image' | 'comment';
  content: string; // URL for video/image, text for comment
  caption?: string;
  authorName: string;
  authorLocation?: string;
  createdAt: string;
  verified: boolean;
  upvotes: number;
  replies: ProofReply[];
}

interface ProofReply {
  id: string;
  authorName: string;
  content: string;
  createdAt: string;
}

// In-memory data store keyed by projectId
const proofsStore = new Map<string, CitizenProof[]>();

// Seed with sample data for demo
const DEMO_PROOFS: Record<string, CitizenProof[]> = {
  'PRJ-034-001': [
    {
      id: 'demo-1',
      projectId: 'PRJ-034-001',
      type: 'video',
      content: '',
      caption: 'Stalled water project site visit - showing incomplete piping',
      authorName: 'John M.',
      authorLocation: 'Kajiado',
      createdAt: '2026-07-15T10:30:00Z',
      verified: true,
      upvotes: 23,
      replies: [
        {
          id: 'r1',
          authorName: 'Sarah K.',
          content: 'I passed by this site last week and can confirm — nothing has changed since March.',
          createdAt: '2026-07-16T08:00:00Z',
        },
        {
          id: 'r2',
          authorName: 'David O.',
          content: 'The county promised completion by June. This is unacceptable.',
          createdAt: '2026-07-17T14:00:00Z',
        },
      ],
    },
    {
      id: 'demo-2',
      projectId: 'PRJ-034-001',
      type: 'comment',
      content: 'My community has been waiting for clean water for 3 years. The county government keeps saying the project is ongoing but nothing is happening on the ground.',
      authorName: 'Grace N.',
      authorLocation: 'Kajiado',
      createdAt: '2026-07-20T09:15:00Z',
      verified: false,
      upvotes: 45,
      replies: [
        {
          id: 'r3',
          authorName: 'Admin',
          content: 'Thank you for your report. We have flagged this for OAG review.',
          createdAt: '2026-07-21T11:00:00Z',
        },
      ],
    },
    {
      id: 'demo-3',
      projectId: 'PRJ-034-001',
      type: 'image',
      content: '',
      caption: 'Photo of the supposed water reservoir — completely dry and abandoned',
      authorName: 'Peter L.',
      authorLocation: 'Kajiado',
      createdAt: '2026-07-22T16:45:00Z',
      verified: true,
      upvotes: 67,
      replies: [],
    },
  ],
  'PRJ-001-001': [
    {
      id: 'demo-4',
      projectId: 'PRJ-001-001',
      type: 'comment',
      content: 'The road construction on Mombasa-Malindi highway is progressing well. I can see new tarmac being laid every week.',
      authorName: 'Ahmed B.',
      authorLocation: 'Mombasa',
      createdAt: '2026-07-10T12:00:00Z',
      verified: false,
      upvotes: 12,
      replies: [],
    },
  ],
};

// Initialize store with demo data
for (const [projectId, proofs] of Object.entries(DEMO_PROOFS)) {
  proofsStore.set(projectId, proofs);
}

// GET — fetch all proofs for a project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params;
  const proofs = proofsStore.get(projectId) || [];

  return NextResponse.json({
    projectId,
    proofs,
    total: proofs.length,
    videos: proofs.filter(p => p.type === 'video').length,
    images: proofs.filter(p => p.type === 'image').length,
    comments: proofs.filter(p => p.type === 'comment').length,
  });
}

// POST — add a new proof (video/image/comment)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params;

  try {
    const body = await request.json();
    const { type, content, caption, authorName, authorLocation } = body;

    // Validate required fields
    if (!type || !['video', 'image', 'comment'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid proof type. Must be video, image, or comment.' },
        { status: 400 }
      );
    }

    if (!content && type !== 'comment') {
      return NextResponse.json(
        { error: 'Content URL is required for video/image proofs.' },
        { status: 400 }
      );
    }

    if (!content && type === 'comment') {
      return NextResponse.json(
        { error: 'Comment text is required.' },
        { status: 400 }
      );
    }

    if (!authorName || authorName.trim().length === 0) {
      return NextResponse.json(
        { error: 'Your name is required.' },
        { status: 400 }
      );
    }

    const proof: CitizenProof = {
      id: `proof-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      projectId,
      type,
      content: content || '',
      caption: caption || '',
      authorName: authorName.trim(),
      authorLocation: authorLocation?.trim() || '',
      createdAt: new Date().toISOString(),
      verified: false,
      upvotes: 0,
      replies: [],
    };

    const existing = proofsStore.get(projectId) || [];
    // Cap proofs per project to prevent unbounded memory growth
    if (existing.length >= MAX_PROOFS_PER_PROJECT) {
      return NextResponse.json(
        { error: `Maximum proofs per project reached (${MAX_PROOFS_PER_PROJECT}).` },
        { status: 429 }
      );
    }
    // Sanitize content — strip HTML tags to prevent XSS
    const sanitize = (str: string) => str.replace(/<[^>]*>/g, '').slice(0, 5000);
    proof.content = sanitize(proof.content);
    proof.caption = sanitize(proof.caption);
    proof.authorName = sanitize(proof.authorName).slice(0, 100);
    proof.authorLocation = sanitize(proof.authorLocation || '').slice(0, 100);
    existing.unshift(proof); // newest first
    proofsStore.set(projectId, existing);

    return NextResponse.json(
      { success: true, proof },
      { status: 201 }
    );
  } catch (error) {
    console.error('Proof submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit proof. Please try again.' },
      { status: 500 }
    );
  }
}

// PATCH — upvote or reply
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params;

  try {
    const body = await request.json();
    const { proofId, action, replyAuthorName, replyContent } = body;

    const proofs = proofsStore.get(projectId) || [];
    const proof = proofs.find(p => p.id === proofId);

    if (!proof) {
      return NextResponse.json(
        { error: 'Proof not found.' },
        { status: 404 }
      );
    }

    if (action === 'upvote') {
      // Rate limit
      const ip = getClientIp(request);
      if (isRateLimited(ip)) {
        return NextResponse.json(
          { error: 'Too many upvotes. Please wait a moment.' },
          { status: 429 }
        );
      }
      if (proof.upvotes >= MAX_UPVOTES_PER_PROOF) {
        return NextResponse.json(
          { error: 'Maximum upvotes reached for this proof.' },
          { status: 429 }
        );
      }
      proof.upvotes += 1;
      recordUpvote(ip);
    } else if (action === 'reply') {
      if (!replyContent || !replyAuthorName) {
        return NextResponse.json(
          { error: 'Reply author and content are required.' },
          { status: 400 }
        );
      }
      if (proof.replies.length >= MAX_REPLIES_PER_PROOF) {
        return NextResponse.json(
          { error: `Maximum replies reached (${MAX_REPLIES_PER_PROOF}).` },
          { status: 429 }
        );
      }
      const sanitize = (str: string) => str.replace(/<[^>]*>/g, '').slice(0, 2000);
      proof.replies.push({
        id: `reply-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        authorName: sanitize(replyAuthorName).slice(0, 100),
        content: sanitize(replyContent),
        createdAt: new Date().toISOString(),
      });
    }

    proofsStore.set(projectId, proofs);

    return NextResponse.json({ success: true, proof });
  } catch (error) {
    console.error('Proof update error:', error);
    return NextResponse.json(
      { error: 'Failed to update proof.' },
      { status: 500 }
    );
  }
}
