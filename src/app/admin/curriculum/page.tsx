'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Curriculum {
  id: string
  title: string
  description: string | null
  published: boolean
  order: number
  content: string
}

function countCheckboxes(content: string): number {
  const matches = content.match(/^- \[[ x]\] /gm)
  return matches ? matches.length : 0
}

export default function AdminCurriculumPage() {
  const [curricula, setCurricula] = useState<Curriculum[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCurricula = async () => {
    const res = await fetch('/api/curricula?all=true')
    const data = await res.json()
    setCurricula(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchCurricula()
  }, [])

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`「${title}」を削除しますか？この操作は元に戻せません。`)) return

    const res = await fetch(`/api/curricula/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setCurricula((prev) => prev.filter((c) => c.id !== id))
    }
  }

  const handleTogglePublish = async (id: string, published: boolean) => {
    const res = await fetch(`/api/curricula/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !published }),
    })
    if (res.ok) {
      const updated = await res.json()
      setCurricula((prev) => prev.map((c) => (c.id === id ? updated : c)))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">カリキュラム管理</h1>
        <Link
          href="/admin/curriculum/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + 新規作成
        </Link>
      </div>

      {curricula.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-400 mb-4">まだカリキュラムがありません</p>
          <Link
            href="/admin/curriculum/new"
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            最初のカリキュラムを作成する
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  タイトル
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  チェックボックス数
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  順序
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {curricula.map((curriculum) => (
                <tr key={curriculum.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{curriculum.title}</p>
                    {curriculum.description && (
                      <p className="text-sm text-gray-500 truncate max-w-xs mt-0.5">
                        {curriculum.description}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {countCheckboxes(curriculum.content)} 個
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{curriculum.order}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleTogglePublish(curriculum.id, curriculum.published)}
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                        curriculum.published
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {curriculum.published ? '公開中' : '非公開'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/curriculum/${curriculum.id}/edit`}
                        className="px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        編集
                      </Link>
                      <button
                        onClick={() => handleDelete(curriculum.id, curriculum.title)}
                        className="px-3 py-1.5 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        削除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
