import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const curriculum = await prisma.curriculum.findUnique({
    where: { id: params.id },
  })

  if (!curriculum) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Non-admins can only see published curricula
  if (!curriculum.published && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(curriculum)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { title, description, content, order, published } = body

  if (!title) {
    return NextResponse.json({ error: 'タイトルは必須です' }, { status: 400 })
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
    data: {
      title,
      description: description || null,
      content: content ?? '',
      order: order ?? 0,
      published: published ?? false,
    },
  })

  return NextResponse.json(curriculum)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()

  const curriculum = await prisma.curriculum.update({
    where: { id: params.id },
    data: body,
  })

  return NextResponse.json(curriculum)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await prisma.curriculum.delete({ where: { id: params.id } })

  return NextResponse.json({ ok: true })
}
