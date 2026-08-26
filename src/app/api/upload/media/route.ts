import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// ── Constants ──
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;   // 5 MB
const MAX_VIDEO_SIZE = 25 * 1024 * 1024;   // 25 MB
const MAX_TOTAL_SIZE = 30 * 1024 * 1024;   // 30 MB

const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
]);
const ALLOWED_VIDEO_TYPES = new Set([
  'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo',
]);

/**
 * POST /api/upload/media
 * Accepts multipart FormData with a 'file' field.
 * Converts the file to a base64 data-URI so the proof record
 * can store it directly — no external bucket required.
 *
 * Returns: { url: "data:<mime>;base64,...", isVideo: boolean, fileName, sizeKB, mimeType }
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided. Send a file in the "file" form field.' },
        { status: 400 },
      );
    }

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isVideo && !isImage) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type}. Only images and videos are allowed.` },
        { status: 400 },
      );
    }

    // Validate MIME type against whitelist
    if (isImage && !ALLOWED_IMAGE_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: `Image type not allowed: ${file.type}. Use JPEG, PNG, GIF, or WebP.` },
        { status: 400 },
      );
    }

    if (isVideo && !ALLOWED_VIDEO_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: `Video type not allowed: ${file.type}. Use MP4, WebM, or OGG.` },
        { status: 400 },
      );
    }

    // Validate file size
    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
    if (file.size > maxSize) {
      const maxMB = (maxSize / (1024 * 1024)).toFixed(0);
      return NextResponse.json(
        { error: `File too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum ${maxMB} MB for ${isVideo ? 'videos' : 'images'}.` },
        { status: 400 },
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        { error: 'Empty file received.' },
        { status: 400 },
      );
    }

    // Convert to base64 data-URI
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const dataUri = `data:${file.type};base64,${base64}`;

    return NextResponse.json({
      success: true,
      url: dataUri,
      isVideo,
      fileName: file.name,
      sizeKB: (file.size / 1024).toFixed(2),
      mimeType: file.type,
    });
  } catch (error) {
    console.error('[upload/media] Upload failed:', error);
    return NextResponse.json(
      { error: 'File upload failed. Please try again.' },
      { status: 500 },
    );
  }
}
