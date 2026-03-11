import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import { extractHeadings } from '@/lib/toc'
import CurriculumContent from '@/components/CurriculumContent'

function parseCheckboxItems(content: string): string[] {
  const items: string[] = []
  for (const line of content.split('\n')) {
    const match = line.match(/^[-*+] \[[ xX]\] (.*)/)
    if (match) items.push(match[1].trim())
  }
  return items
}

export default async function CurriculumPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const userId = session.user.id

  const [curriculum, allCurricula] = await Promise.all([
    prisma.curriculum.findUnique({ where: { id: params.id } }),
    prisma.curriculum.findMany({ where: { published: true }, orderBy: { order: 'asc' }, select: { id: true } }),
  ])

  if (!curriculum || !curriculum.published) notFound()

  const curriculumIndex = allCurricula.findIndex((c) => c.id === params.id)

  const progressRecords = await prisma.userProgress.findMany({
    where: { userId, curriculumId: params.id },
  })

  const initialProgress: Record<number, boolean> = {}
  for (const record of progressRecords) {
    initialProgress[record.checkboxIndex] = record.checked
  }

  const headings = extractHeadings(curriculum.content)
  const totalItems = parseCheckboxItems(curriculum.content).length

  const prevId = curriculumIndex > 0 ? allCurricula[curriculumIndex - 1].id : null
  const nextId = curriculumIndex < allCurricula.length - 1 ? allCurricula[curriculumIndex + 1].id : null

  return (
    <CurriculumContent
      curriculum={curriculum}
      curriculumIndex={curriculumIndex >= 0 ? curriculumIndex : 0}
      totalItems={totalItems}
      initialProgress={initialProgress}
      headings={headings}
      prevId={prevId}
      nextId={nextId}
    />
  )
}
