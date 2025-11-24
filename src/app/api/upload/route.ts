import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { writeFile, mkdir, readdir, stat, rm } from 'fs/promises'
import { join } from 'path'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 MB
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'video/mp4',
  'video/webm',
  'audio/mpeg',
  'audio/wav',
  'application/pdf',
  'text/plain',
  'application/zip',
  'application/x-rar-compressed',
]

export async function GET() {
  try {
    const dirNew = join(process.cwd(), 'public', 'assets')
    const dirOld = join(process.cwd(), 'public', 'assests') // legacy typo
    try { await mkdir(dirNew, { recursive: true }) } catch {}
    const listNew = await readdir(dirNew).catch(() => [])
    const listOld = await readdir(dirOld).catch(() => [])
    const itemsNew = await Promise.all(listNew.map(async (name) => {
      const filePath = join(dirNew, name)
      const s = await stat(filePath)
      return { name, url: `/assets/${name}`, size: s.size, mtime: s.mtime }
    }))
    const itemsOld = await Promise.all(listOld.map(async (name) => {
      const filePath = join(dirOld, name)
      const s = await stat(filePath)
      return { name, url: `/assests/${name}`, size: s.size, mtime: s.mtime }
    }))
    const items = [...itemsNew, ...itemsOld]
    items.sort((a, b) => +b.mtime - +a.mtime)
    return NextResponse.json(items)
  } catch (e) {
    return NextResponse.json({ error: 'List failed' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const uploadType = formData.get('type') as string || 'general'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Find user in database
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: (session.user as any).id },
          { email: session.user.email || '' }
        ]
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 })
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds limit of ${MAX_FILE_SIZE / (1024 * 1024)} MB` },
        { status: 400 }
      )
    }

    // Check file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not allowed' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const extension = file.name.split('.').pop()
    const filename = `${timestamp}-${randomString}.${extension}`

    // Try Vercel Blob first, fallback to local storage
    try {
      if (process.env.BLOB_READ_WRITE_TOKEN && process.env.BLOB_READ_WRITE_TOKEN !== 'your_vercel_blob_token_here') {
        // Upload to Vercel Blob
        const blob = await put(filename, file, {
          access: 'public',
          token: process.env.BLOB_READ_WRITE_TOKEN,
        })

        // Save upload record to database
        const uploadRecord = await prisma.upload.create({
          data: {
            filename: filename,
            originalName: file.name,
            mimeType: file.type,
            size: file.size,
            url: blob.url,
            uploadedBy: user.id,
            uploadType: uploadType,
            metadata: JSON.stringify({
              timestamp,
              provider: 'vercel-blob'
            })
          }
        })

        return NextResponse.json({ 
          id: uploadRecord.id,
          url: blob.url,
          filename: file.name,
          size: file.size,
          type: file.type
        })
      }
    } catch (blobError) {
      console.log('Vercel Blob upload failed, falling back to local storage:', blobError)
    }

    // Fallback: Local file storage for development
    const uploadsDir = join(process.cwd(), 'public', 'assets')
    
    // Ensure uploads directory exists
    try {
      await mkdir(uploadsDir, { recursive: true })
    } catch (error) {
      console.log('Uploads directory already exists or could not be created')
    }

    const filePath = join(uploadsDir, filename)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    await writeFile(filePath, buffer)
    
    const localUrl = `/assets/${filename}`

    // Save upload record to database
    const uploadRecord = await prisma.upload.create({
      data: {
        filename: filename,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        url: localUrl,
        uploadedBy: user.id,
        uploadType: uploadType,
        metadata: JSON.stringify({
          timestamp,
          provider: 'local'
        })
      }
    })

    return NextResponse.json({ 
      id: uploadRecord.id,
      url: localUrl,
      filename: file.name,
      size: file.size,
      type: file.type
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const name = searchParams.get('name')
    if (!name) return NextResponse.json({ error: 'Missing name' }, { status: 400 })
    const filePathNew = join(process.cwd(), 'public', 'assets', name)
    const filePathOld = join(process.cwd(), 'public', 'assests', name)
    try { await rm(filePathNew); return NextResponse.json({ ok: true }) } catch {}
    try { await rm(filePathOld); return NextResponse.json({ ok: true }) } catch {}
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  } catch (e) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}