import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const curriculumId = req.nextUrl.searchParams.get('curriculumId')
  if (!curriculumId) {
    return NextResponse.json({ error: 'curriculumId is required' }, { status: 400 })
  }

  const records = await prisma.userProgress.findMany({
    where: { userId: session.user.id, curriculumId },
  })

  const progress: Record<number, boolean> = {}
  for (const record of records) {
    progress[record.checkboxIndex] = record.checked
  }

  return NextResponse.json(progress)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { curriculumId, checkboxIndex, checked } = body

  if (curriculumId === undefined || checkboxIndex === undefined || checked === undefined) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const record = await prisma.userProgress.upsert({
    where: {
      userId_curriculumId_checkboxIndex: {
        userId: session.user.id,
        curriculumId,
        checkboxIndex,
      },
    },
    update: { checked },
    create: {
      userId: session.user.id,
      curriculumId,
      checkboxIndex,
      checked,
    },
  })

  return NextResponse.json(record)
}
