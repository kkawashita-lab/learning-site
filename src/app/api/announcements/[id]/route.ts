import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { title, body, startsAt, endsAt } = await req.json()
  const announcement = await prisma.announcement.update({
    where: { id: params.id },
    data: { title, body, startsAt: new Date(startsAt), endsAt: new Date(endsAt) },
  })
  return NextResponse.json(announcement)
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await prisma.announcement.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
