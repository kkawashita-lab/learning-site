import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import LogoutButton from '@/components/LogoutButton'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') redirect('/login')

  const initials = (session.user.name || session.user.email || 'A')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white sticky top-0 z-20 border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-6">
          {/* Logo */}
          <Link href="/admin" className="flex items-center gap-2.5 shrink-0">
            <Image src="/logo.png" alt="AI College" width={160} height={48} className="object-contain" />
          </Link>

          {/* Admin badge */}
          <span className="text-xs font-semibold text-white bg-slate-500 px-2 py-0.5 rounded">管理</span>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/admin/curriculum" className="text-sm text-slate-600 hover:text-[#0f1f4b] font-medium transition-colors">
              カリキュラム管理
            </Link>
            <Link href="/admin/announcements" className="text-sm text-slate-600 hover:text-[#0f1f4b] font-medium transition-colors">
              お知らせ管理
            </Link>
          </nav>

          {/* Spacer */}
          <div className="flex-1" />

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
      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
