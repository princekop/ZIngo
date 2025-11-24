import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { getServerSession } from 'next-auth';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'media');
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'];
const ALLOWED_AUDIO_TYPES = ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac'];

interface UploadResponse {
  success: boolean;
  files?: Array<{
    filename: string;
    originalName: string;
    url: string;
    type: string;
    size: number;
    width?: number;
    height?: number;
    duration?: number;
  }>;
  error?: string;
}

// Ensure upload directory exists
async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

// Generate unique filename
function generateFilename(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  const extension = path.extname(originalName);
  const baseName = path.basename(originalName, extension)
    .replace(/[^a-zA-Z0-9]/g, '-')
    .substring(0, 50);
  
  return `${timestamp}-${random}-${baseName}${extension}`;
}

// Get media dimensions (for images/videos)
async function getMediaInfo(filePath: string, mimeType: string) {
  const info: { width?: number; height?: number; duration?: number } = {};
  
  // For now, return empty info - in production you'd use libraries like sharp for images
  // and ffprobe for videos to get actual dimensions and duration
  
  return info;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    await ensureUploadDir();

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No files provided' },
        { status: 400 }
      );
    }

    const uploadedFiles = [];

    for (const file of files) {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { success: false, error: `File ${file.name} exceeds maximum size of 50MB` },
          { status: 400 }
        );
      }

      // Validate file type
      const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
      const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);
      const isAudio = ALLOWED_AUDIO_TYPES.includes(file.type);

      if (!isImage && !isVideo && !isAudio) {
        return NextResponse.json(
          { success: false, error: `File type ${file.type} is not supported` },
          { status: 400 }
        );
      }

      // Generate unique filename
      const filename = generateFilename(file.name);
      const filePath = path.join(UPLOAD_DIR, filename);

      // Save file
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);

      // Get media info
      const mediaInfo = await getMediaInfo(filePath, file.type);

      // Determine media type
      let mediaType = 'DOCUMENT';
      if (isImage) mediaType = 'IMAGE';
      else if (isVideo) mediaType = 'VIDEO';
      else if (isAudio) mediaType = 'AUDIO';

      uploadedFiles.push({
        filename,
        originalName: file.name,
        url: `/uploads/media/${filename}`,
        type: mediaType,
        size: file.size,
        mimeType: file.type,
        ...mediaInfo
      });
    }

    const response: UploadResponse = {
      success: true,
      files: uploadedFiles
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Upload failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Method not allowed. Use POST to upload files.' 
    },
    { status: 405 }
  );
}
