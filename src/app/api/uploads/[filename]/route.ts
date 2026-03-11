import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'

const MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
}

export async function GET(
  _req: Request,
  { params }: { params: { filename: string } }
) {
  const filename = params.filename

  // パストラバーサル対策
  if (filename.includes('/') || filename.includes('..')) {
    return new NextResponse('Not found', { status: 404 })
  }

  const uploadDir = process.env.UPLOAD_DIR ?? path.join(process.cwd(), 'public', 'uploads')
  const filepath = path.join(uploadDir, filename)

  try {
    const data = await readFile(filepath)
    const ext = path.extname(filename).slice(1).toLowerCase()
    return new NextResponse(data, {
      headers: {
        'Content-Type': MIME[ext] ?? 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch {
    return new NextResponse('Not found', { status: 404 })
  }
}
