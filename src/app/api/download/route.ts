import { NextRequest, NextResponse } from "next/server";
import { verifyToken, validateDownloadUrl, extractFilename } from "@/lib/auth";
import { db as prisma } from "@/lib/db";

const FETCH_TIMEOUT_MS = 30_000;
const MAX_RESPONSE_SIZE = 100 * 1024 * 1024; // 100 MB

export async function GET(request: NextRequest) {
  // ── Authenticate ──────────────────────────────────────────────────────
  const token = request.cookies.get("auth-token")?.value
    ?? request.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json(
      { error: "Authentication required. Please sign in or register to download files." },
      { status: 401 },
    );
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json(
      { error: "Session expired. Please sign in again." },
      { status: 401 },
    );
  }

  // ── Validate URL parameter ────────────────────────────────────────────
  const rawUrl = request.nextUrl.searchParams.get("url");
  if (!rawUrl) {
    return NextResponse.json({ error: "Missing ?url parameter" }, { status: 400 });
  }

  const { error: urlError, url: targetUrl } = validateDownloadUrl(rawUrl);
  if (urlError || !targetUrl) {
    return NextResponse.json({ error: urlError ?? "Invalid URL" }, { status: 400 });
  }

  // ── Fetch remote file ──────────────────────────────────────────────────
  let response: Response;
  try {
    response = await fetch(targetUrl.href, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      redirect: "follow",
      headers: {
        "User-Agent": "KenyaGovernanceExplorer/1.0 (download-proxy)",
        Accept: "application/pdf,application/octet-stream,*/*",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch remote file";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  if (!response.ok) {
    return NextResponse.json(
      { error: `Remote server returned ${response.status}` },
      { status: 502 },
    );
  }

  const contentType = response.headers.get("content-type") ?? "application/octet-stream";
  const contentLength = parseInt(response.headers.get("content-length") ?? "0", 10);

  if (contentLength > MAX_RESPONSE_SIZE) {
    return NextResponse.json(
      { error: `File too large (${(contentLength / 1024 / 1024).toFixed(1)} MB exceeds 100 MB limit)` },
      { status: 413 },
    );
  }

  const fileName = extractFilename(targetUrl);

  // ── Track download ────────────────────────────────────────────────────
  try {
    await prisma.downloadRecord.create({
      data: {
        userId: payload.sub,
        fileName,
        sourceUrl: targetUrl.href,
        fileSize: contentLength,
      },
    });
  } catch {
    // Non-critical: don't block download on tracking failure
  }

  // ── Stream response ─────────────────────────────────────────────────
  const headers = new Headers();
  headers.set("Content-Type", contentType);
  headers.set("Content-Disposition", `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`);
  if (contentLength > 0) {
    headers.set("Content-Length", String(contentLength));
  }
  headers.set("Cache-Control", "no-store");
  headers.set("X-Content-Type-Options", "nosniff");

  return new NextResponse(response.body, {
    status: 200,
    headers,
  });
}
