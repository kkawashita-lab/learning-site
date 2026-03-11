import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const cardAccents = [
  'bg-blue-600',
  'bg-indigo-600',
  'bg-sky-600',
  'bg-violet-600',
  'bg-teal-600',
  'bg-cyan-600',
]

function parseCheckboxItems(content: string): string[] {
  const items: string[] = []
  for (const line of content.split('\n')) {
    const match = line.match(/^[-*+] \[[ xX]\] (.*)/)
    if (match) items.push(match[1].trim())
  }
  return items
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const userId = session.user.id

  const curricula = await prisma.curriculum.findMany({
    where: { published: true },
    orderBy: { order: 'asc' },
  })

  const progressRecords = await prisma.userProgress.findMany({ where: { userId } })

  // カリキュラムごとのチェックボックス数を先に計算
  const itemCountById: Record<string, number> = {}
  for (const c of curricula) {
    itemCountById[c.id] = parseCheckboxItems(c.content).length
  }

  const checkedByIndex: Record<string, Set<number>> = {}
  for (const r of progressRecords) {
    // 有効な範囲内のインデックスのみカウント（古いバグデータを無視）
    if (r.checked && r.checkboxIndex < (itemCountById[r.curriculumId] ?? 0)) {
      if (!checkedByIndex[r.curriculumId]) checkedByIndex[r.curriculumId] = new Set()
      checkedByIndex[r.curriculumId].add(r.checkboxIndex)
    }
  }

  const totalItems = curricula.reduce((s, c) => s + parseCheckboxItems(c.content).length, 0)
  const totalChecked = curricula.reduce((s, c) => s + (checkedByIndex[c.id]?.size ?? 0), 0)
  const overallPct = totalItems > 0 ? Math.round((totalChecked / totalItems) * 100) : 0

  const firstUnfinished = curricula.find((c) => {
    const items = parseCheckboxItems(c.content)
    return (checkedByIndex[c.id]?.size ?? 0) < items.length
  })

  return (
    <div>
      {/* Hero / Progress banner */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="text-sm text-slate-500 mb-1">
                おかえりなさい、<span className="font-semibold text-slate-700">{session.user.name || session.user.email}</span> さん
              </p>
              <h1 className="text-2xl font-bold text-slate-900">学習ダッシュボード</h1>
            </div>

            <div className="flex items-center gap-8">
              {/* Stats */}
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{overallPct}<span className="text-lg">%</span></p>
                <p className="text-xs text-slate-500 mt-0.5">全体進捗</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-slate-800">{totalChecked}<span className="text-lg text-slate-400">/{totalItems}</span></p>
                <p className="text-xs text-slate-500 mt-0.5">完了項目</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-slate-800">{curricula.length}</p>
                <p className="text-xs text-slate-500 mt-0.5">カリキュラム</p>
              </div>
            </div>
          </div>

          {/* Overall progress bar */}
          <div className="mt-6">
            <div className="flex justify-between text-xs text-slate-500 mb-1.5">
              <span>全体の進捗状況</span>
              <span>{overallPct}% 完了</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-700"
                style={{ width: `${overallPct}%` }}
              />
            </div>
          </div>

          {firstUnfinished && (
            <div className="mt-5">
              <Link
                href={`/curriculum/${firstUnfinished.id}`}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors"
              >
                学習を続ける
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Curriculum list */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <h2 className="text-lg font-bold text-slate-800 mb-5">カリキュラム一覧</h2>

        {curricula.length === 0 ? (
          <div className="text-center py-20 text-slate-400">まだカリキュラムがありません</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {curricula.map((curriculum, index) => {
              const items = parseCheckboxItems(curriculum.content)
              const checkedSet = checkedByIndex[curriculum.id] ?? new Set<number>()
              const pct = items.length > 0 ? Math.round((checkedSet.size / items.length) * 100) : 0
              const accent = cardAccents[index % cardAccents.length]
              const isComplete = items.length > 0 && checkedSet.size === items.length

              return (
                <div
                  key={curriculum.id}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex flex-col"
                >
                  {/* Accent header strip */}
                  <div className={`${accent} px-4 py-3 flex items-center justify-between`}>
                    <div>
                      <p className="text-white/70 text-[10px] font-semibold uppercase tracking-widest">
                        Curriculum {String(index + 1).padStart(2, '0')}
                      </p>
                      <Link href={`/curriculum/${curriculum.id}`}>
                        <h3 className="text-white font-bold text-sm mt-0.5 hover:text-white/90 transition-colors">
                          {curriculum.title}
                        </h3>
                      </Link>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      isComplete
                        ? 'bg-white/20 text-white'
                        : pct > 0
                        ? 'bg-white/20 text-white'
                        : 'bg-white/10 text-white/70'
                    }`}>
                      {isComplete ? '完了' : `${pct}%`}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1 bg-slate-100">
                    <div
                      className={`h-full ${accent} opacity-60 transition-all duration-300`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  {/* Item list */}
                  <div className="flex-1 divide-y divide-slate-100">
                    {items.length === 0 ? (
                      <p className="px-4 py-3 text-sm text-slate-400">コンテンツなし</p>
                    ) : (
                      items.map((item, i) => (
                        <Link
                          key={i}
                          href={`/curriculum/${curriculum.id}`}
                          className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 transition-colors group"
                        >
                          <span className="text-sm text-slate-600 flex-1 truncate pr-2 group-hover:text-slate-900 transition-colors">
                            {item}
                          </span>
                          {i < items.length && checkedSet.has(i) ? (
                            <span className="shrink-0 flex items-center gap-1 text-xs text-emerald-700 border border-emerald-200 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              完了
                            </span>
                          ) : (
                            <span className="shrink-0 w-4 h-4 rounded-full border-2 border-slate-300" />
                          )}
                        </Link>
                      ))
                    )}
                  </div>

                  {/* Card footer */}
                  <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100">
                    <Link
                      href={`/curriculum/${curriculum.id}`}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      {pct === 0 ? '学習を始める →' : isComplete ? '復習する →' : '続きを学ぶ →'}
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
