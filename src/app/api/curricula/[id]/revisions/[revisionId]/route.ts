import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string; revisionId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const revision = await prisma.curriculumRevision.findUnique({
    where: { id: params.revisionId },
  })

  if (!revision || revision.curriculumId !== params.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const current = await prisma.curriculum.findUnique({ where: { id: params.id } })
  if (current) {
    await prisma.curriculumRevision.create({
      data: {
        curriculumId: params.id,
        title: current.title,
        content: current.content,
        savedBy: session.user.email ?? 'admin',
      },
    })
  }

  const curriculum = await prisma.curriculum.update({
    where: { id: params.id },
    data: { title: revision.title, content: revision.content },
  })

  return NextResponse.json(curriculum)
}
