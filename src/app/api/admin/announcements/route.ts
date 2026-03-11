import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 管理者向け：期間フィルタなしで全件取得
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const announcements = await prisma.announcement.findMany({
    orderBy: { startsAt: 'desc' },
  })
  return NextResponse.json(announcements)
}
