import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const showAll = req.nextUrl.searchParams.get('all') === 'true'
  const isAdmin = session.user.role === 'ADMIN'

  const curricula = await prisma.curriculum.findMany({
    where: showAll && isAdmin ? {} : { published: true },
    orderBy: { order: 'asc' },
  })

  return NextResponse.json(curricula)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { title, description, content, order, published } = body

  if (!title) {
    return NextResponse.json({ error: 'タイトルは必須です' }, { status: 400 })
  }

  const curriculum = await prisma.curriculum.create({
    data: {
      title,
      description: description || null,
      content: content || '',
      order: order ?? 0,
      published: published ?? false,
    },
  })

  return NextResponse.json(curriculum, { status: 201 })
}
