import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function AdminDashboard() {
  const [curriculaCount, userCount] = await Promise.all([
    prisma.curriculum.count(),
    prisma.user.count({ where: { role: 'USER' } }),
  ])

  const publishedCount = await prisma.curriculum.count({ where: { published: true } })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">ダッシュボード</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-1">カリキュラム数</p>
          <p className="text-4xl font-bold text-gray-900">{curriculaCount}</p>
          <p className="text-xs text-gray-400 mt-1">公開中: {publishedCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-1">ユーザー数</p>
          <p className="text-4xl font-bold text-gray-900">{userCount}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">クイックリンク</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/curriculum"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            カリキュラム一覧
          </Link>
          <Link
            href="/admin/curriculum/new"
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
          >
            カリキュラムを新規作成
          </Link>
          <Link
            href="/admin/users-progress"
            className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
          >
            ユーザー進捗を確認
          </Link>
        </div>
      </div>
    </div>
  )
}
