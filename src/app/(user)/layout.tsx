import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import LogoutButton from '@/components/LogoutButton'
import AnnouncementBar from '@/components/AnnouncementBar'
import { prisma } from '@/lib/prisma'

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const now = new Date()
  const announcements = await prisma.announcement.findMany({
    where: { startsAt: { lte: now }, endsAt: { gte: now } },
    orderBy: { startsAt: 'desc' },
  })

  const initials = (session.user.name || session.user.email || 'U')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white sticky top-0 z-20 border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-6">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0">
            <Image src="/logo.png" alt="AI College" width={160} height={48} className="object-contain" />
          </Link>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="text-sm text-slate-600 hover:text-[#0f1f4b] font-medium transition-colors">
              カリキュラム
            </Link>
          </nav>

          {/* User avatar */}
          <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
            <span className="text-sm text-slate-500 hidden sm:inline">
              {session.user.name || session.user.email}
            </span>
            <div className="w-8 h-8 rounded-full bg-[#0f1f4b] flex items-center justify-center text-white text-xs font-bold shrink-0">
              {initials}
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>
      <AnnouncementBar announcements={announcements} />
      {children}
    </div>
  )
}
