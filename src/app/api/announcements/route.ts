import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET: アクティブなお知らせ一覧（ユーザー向け）
export async function GET() {
  const now = new Date()
  const announcements = await prisma.announcement.findMany({
    where: {
      startsAt: { lte: now },
      endsAt: { gte: now },
    },
    orderBy: { startsAt: 'desc' },
  })
  return NextResponse.json(announcements)
}

// POST: 新規作成（管理者のみ）
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { title, body, startsAt, endsAt } = await req.json()
  if (!title || !body || !startsAt || !endsAt) {
    return NextResponse.json({ error: '全項目必須です' }, { status: 400 })
  }

  const announcement = await prisma.announcement.create({
    data: { title, body, startsAt: new Date(startsAt), endsAt: new Date(endsAt) },
  })
  return NextResponse.json(announcement, { status: 201 })
}
