import { NextResponse } from 'next/server'
import { supabaseAdmin, STORAGE_BUCKET } from '@/lib/supabase'

export async function GET(
  _req: Request,
  { params }: { params: { filename: string } }
) {
  const filename = params.filename

  if (filename.includes('/') || filename.includes('..')) {
    return new NextResponse('Not found', { status: 404 })
  }

  const { data } = supabaseAdmin.storage.from(STORAGE_BUCKET).getPublicUrl(filename)

  return NextResponse.redirect(data.publicUrl, { status: 301 })
}
