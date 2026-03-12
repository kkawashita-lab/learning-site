'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import MarkdownEditor from '@/components/MarkdownEditor'

interface FormState {
  title: string
  description: string
  order: number
  published: boolean
  content: string
}

interface Revision {
  id: string
  title: string
  content: string
  savedAt: string
  savedBy: string
}

export default function EditCurriculumPage() {
  const params = useParams()
  const id = params.id as string

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState<FormState>({
    title: '',
    description: '',
    order: 0,
    published: false,
    content: '',
  })

  const [revisions, setRevisions] = useState<Revision[]>([])
  const [showRevisions, setShowRevisions] = useState(false)
  const [restoring, setRestoring] = useState<string | null>(null)
  const [previewRevision, setPreviewRevision] = useState<Revision | null>(null)

  useEffect(() => {
    const fetchCurriculum = async () => {
      const res = await fetch(`/api/curricula/${id}`)
      if (res.ok) {
        const data = await res.json()
        setForm({
          title: data.title,
          description: data.description || '',
          order: data.order,
          published: data.published,
          content: data.content,
        })
      }
      setFetching(false)
    }
    fetchCurriculum()
  }, [id])

  const fetchRevisions = async () => {
    const res = await fetch(`/api/curricula/${id}/revisions`)
    if (res.ok) {
      const data = await res.json()
      setRevisions(data)
    }
  }

  const handleToggleRevisions = async () => {
    if (!showRevisions && revisions.length === 0) {
      await fetchRevisions()
    }
    setShowRevisions(!showRevisions)
    setPreviewRevision(null)
  }

  const handleRestore = async (revision: Revision) => {
    if (!confirm(`「${new Date(revision.savedAt).toLocaleString('ja-JP')}」の内容に復元しますか？\n現在の内容はリビジョンとして保存されます。`)) return
    setRestoring(revision.id)
    const res = await fetch(`/api/curricula/${id}/revisions/${revision.id}`, { method: 'POST' })
    if (res.ok) {
      const data = await res.json()
      setForm(prev => ({ ...prev, title: data.title, content: data.content }))
      setRevisions([])
      await fetchRevisions()
      setPreviewRevision(null)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
    setRestoring(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) {
      setError('タイトルは必須です')
      return
    }

    setLoading(true)
    setError('')

    const res = await fetch(`/api/curricula/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    setLoading(false)

    if (res.ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      if (showRevisions) {
        setRevisions([])
        await fetchRevisions()
      }
    } else {
      const data = await res.json()
      setError(data.error || '更新に失敗しました')
    }
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      {saved && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-emerald-600 text-white px-5 py-3.5 rounded-xl shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm font-medium">保存が完了しました</span>
        </div>
      )}

      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/curriculum" className="text-sm text-gray-500 hover:text-gray-700">
          ← 一覧に戻る
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">カリキュラムを編集</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              タイトル <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              説明（任意）
            </label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                表示順序
              </label>
              <input
                type="number"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end pb-2.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) => setForm({ ...form, published: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600"
                />
                <span className="text-sm font-medium text-gray-700">公開する</span>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            コンテンツ（Markdown形式）
          </label>
          <MarkdownEditor
            value={form.content}
            onChange={(value) => setForm({ ...form, content: value })}
          />
        </div>

        <div className="flex justify-end gap-3">
          <Link
            href="/admin/curriculum"
            className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            キャンセル
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? '保存中...' : '変更を保存'}
          </button>
        </div>
      </form>

      {/* リビジョン履歴 */}
      <div className="mt-8 bg-white rounded-xl border border-gray-200 overflow-hidden">
        <button
          type="button"
          onClick={handleToggleRevisions}
          className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium text-gray-700">変更履歴</span>
            {revisions.length > 0 && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{revisions.length}件</span>
            )}
          </div>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${showRevisions ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showRevisions && (
          <div className="border-t border-gray-200">
            {revisions.length === 0 ? (
              <p className="px-6 py-4 text-sm text-gray-400">まだ変更履歴はありません</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {revisions.map((rev) => (
                  <div key={rev.id} className="px-6 py-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {new Date(rev.savedAt).toLocaleString('ja-JP')}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {rev.savedBy} · {rev.title}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setPreviewRevision(previewRevision?.id === rev.id ? null : rev)}
                          className="text-xs px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          {previewRevision?.id === rev.id ? '閉じる' : 'プレビュー'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRestore(rev)}
                          disabled={restoring === rev.id}
                          className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                          {restoring === rev.id ? '復元中...' : 'この内容に戻す'}
                        </button>
                      </div>
                    </div>
                    {previewRevision?.id === rev.id && (
                      <pre className="mt-3 p-3 bg-gray-50 rounded-lg text-xs text-gray-600 overflow-auto max-h-[600px] whitespace-pre-wrap font-mono">
                        {rev.content}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
