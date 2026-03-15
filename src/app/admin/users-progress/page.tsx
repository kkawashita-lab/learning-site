import { prisma } from '@/lib/prisma'

function countCheckboxes(content: string): number {
  return (content.match(/- \[[ x]\]/gi) || []).length
}

export default async function UsersProgressPage() {
  const [users, curricula] = await Promise.all([
    prisma.user.findMany({
      where: { role: 'USER' },
      include: { progress: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.curriculum.findMany({
      where: { published: true },
      orderBy: { order: 'asc' },
    }),
  ])

  const curriculumTotals = curricula.map((c) => ({
    id: c.id,
    title: c.title,
    total: countCheckboxes(c.content),
  }))

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">ユーザー進捗管理</h1>

      {users.length === 0 ? (
        <p className="text-gray-500">登録ユーザーがいません。</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-gray-700 whitespace-nowrap">
                  ユーザー
                </th>
                {curriculumTotals.map((c) => (
                  <th
                    key={c.id}
                    className="text-center px-4 py-3 font-semibold text-gray-700 whitespace-nowrap max-w-[160px]"
                  >
                    <span className="block truncate">{c.title}</span>
                    <span className="text-xs text-gray-400 font-normal">全{c.total}項目</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <p className="font-medium text-gray-900">{user.name || '—'}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </td>
                  {curriculumTotals.map((c) => {
                    const checked = user.progress.filter(
                      (p) => p.curriculumId === c.id && p.checked
                    ).length
                    const pct = c.total > 0 ? Math.round((checked / c.total) * 100) : 0
                    const color =
                      pct === 100
                        ? 'bg-green-500'
                        : pct >= 50
                        ? 'bg-blue-500'
                        : pct > 0
                        ? 'bg-yellow-400'
                        : 'bg-gray-200'

                    return (
                      <td key={c.id} className="px-4 py-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-semibold text-gray-800">
                            {checked}
                            <span className="text-gray-400 font-normal">/{c.total}</span>
                          </span>
                          <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${color}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-400">{pct}%</span>
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
