import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';

// Allowed video mime types
const ALLOWED_TYPES = [
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
  'video/x-msvideo',
  'video/x-matroska',
];

// Max file size: 50MB
const MAX_SIZE = 50 * 1024 * 1024;

// Allowed image mime types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// Allowed extensions (sanitized — never use raw file.name extension)
const ALLOWED_VIDEO_EXTENSIONS = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'];
const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('video') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const isImage = file.type.startsWith('image/');

    // Validate file type — check images FIRST
    if (isImage) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `Image type "${file.type}" not allowed. Use JPG, PNG, WebP, or GIF.` },
          { status: 400 }
        );
      }
    } else {
      // Video validation
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `File type "${file.type}" not allowed. Use MP4, WebM, OGG, MOV, AVI, or MKV.` },
          { status: 400 }
        );
      }
    }

    // Validate file size (50MB for video, 10MB for images)
    const maxSize = isImage ? 10 * 1024 * 1024 : MAX_SIZE;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum is ${isImage ? '10MB for images' : '50MB for videos'}.` },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate safe unique filename — never use raw file extension
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const safeExtMap: Record<string, string> = {
      'video/mp4': 'mp4', 'video/webm': 'webm', 'video/ogg': 'ogg',
      'video/quicktime': 'mov', 'video/x-msvideo': 'avi', 'video/x-matroska': 'mkv',
      'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif',
    };
    const ext = safeExtMap[file.type] || (isImage ? 'jpg' : 'mp4');
    const fileName = `${timestamp}-${randomStr}.${ext}`;

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'proofs');
    await mkdir(uploadDir, { recursive: true });

    // Write file
    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    const url = `/uploads/proofs/${fileName}`;

    return NextResponse.json({
      success: true,
      url,
      fileName,
      fileType: file.type,
      fileSize: file.size,
      isVideo: !isImage,
    });
  } catch (error) {
    console.error('Video upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file. Please try again.' },
      { status: 500 }
    );
  }
}
