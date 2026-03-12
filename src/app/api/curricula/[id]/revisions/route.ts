import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const revisions = await prisma.curriculumRevision.findMany({
    where: { curriculumId: params.id },
    orderBy: { savedAt: 'desc' },
    take: 50,
  })

  return NextResponse.json(revisions)
}
