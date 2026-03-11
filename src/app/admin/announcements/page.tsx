'use client'

import { useEffect, useState } from 'react'

interface Announcement {
  id: string
  title: string
  body: string
  startsAt: string
  endsAt: string
}

const emptyForm = {
  title: '',
  body: '',
  startsAt: '',
  endsAt: '',
}

function toDatetimeLocal(iso: string) {
  return iso.slice(0, 16) // "YYYY-MM-DDTHH:MM"
}

export default function AnnouncementsAdminPage() {
  const [list, setList] = useState<Announcement[]>([])
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const fetchList = async () => {
    const res = await fetch('/api/admin/announcements')
    if (res.ok) setList(await res.json())
  }

  useEffect(() => { fetchList() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.title || !form.body || !form.startsAt || !form.endsAt) {
      setError('全項目を入力してください')
      return
    }
    setLoading(true)
    const url = editId ? `/api/announcements/${editId}` : '/api/announcements'
    const method = editId ? 'PUT' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setLoading(false)
    if (res.ok) {
      setForm(emptyForm)
      setEditId(null)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      fetchList()
    } else {
      const data = await res.json()
      setError(data.error || '保存に失敗しました')
    }
  }

  const handleEdit = (a: Announcement) => {
    setEditId(a.id)
    setForm({
      title: a.title,
      body: a.body,
      startsAt: toDatetimeLocal(a.startsAt),
      endsAt: toDatetimeLocal(a.endsAt),
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('このお知らせを削除しますか？')) return
    await fetch(`/api/announcements/${id}`, { method: 'DELETE' })
    fetchList()
  }

  const now = new Date()
  const isActive = (a: Announcement) =>
    new Date(a.startsAt) <= now && now <= new Date(a.endsAt)

  return (
    <div className="max-w-3xl">
      {saved && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-emerald-600 text-white px-5 py-3.5 rounded-xl shadow-lg">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm font-medium">保存が完了しました</span>
        </div>
      )}

      <h1 className="text-2xl font-bold text-gray-900 mb-8">お知らせ管理</h1>

      {/* フォーム */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <h2 className="text-base font-semibold text-gray-800 mb-4">
          {editId ? 'お知らせを編集' : '新規お知らせを作成'}
        </h2>
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">タイトル</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="例: システムメンテナンスのお知らせ"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">本文</label>
            <textarea
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-y"
              placeholder="お知らせの詳細内容を入力してください"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">表示開始日時</label>
              <input
                type="datetime-local"
                value={form.startsAt}
                onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">表示終了日時</label>
              <input
                type="datetime-local"
                value={form.endsAt}
                onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            {editId && (
              <button
                type="button"
                onClick={() => { setEditId(null); setForm(emptyForm) }}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? '保存中...' : editId ? '変更を保存' : 'お知らせを作成'}
            </button>
          </div>
        </form>
      </div>

      {/* 一覧 */}
      <div className="space-y-3">
        {list.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">お知らせはまだありません</p>
        )}
        {list.map((a) => (
          <div key={a.id} className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isActive(a) ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  {isActive(a) ? '表示中' : '非表示'}
                </span>
                <p className="text-sm font-semibold text-gray-800 truncate">{a.title}</p>
              </div>
              <p className="text-xs text-gray-500 whitespace-pre-line line-clamp-2 mb-2">{a.body}</p>
              <p className="text-xs text-gray-400">
                {new Date(a.startsAt).toLocaleString('ja-JP')} 〜 {new Date(a.endsAt).toLocaleString('ja-JP')}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleEdit(a)}
                className="text-xs text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors font-medium"
              >
                編集
              </button>
              <button
                onClick={() => handleDelete(a.id)}
                className="text-xs text-red-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors font-medium"
              >
                削除
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
