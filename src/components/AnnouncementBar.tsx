'use client'

import { useState } from 'react'

interface Announcement {
  id: string
  title: string
  body: string
}

interface Props {
  announcements: Announcement[]
}

export default function AnnouncementBar({ announcements }: Props) {
  const [open, setOpen] = useState(false)

  // アクティブなお知らせがなければバーは表示しない
  if (announcements.length === 0) return null

  return (
    <div className="bg-slate-50 border-b border-slate-200">
      {/* トリガー行 */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-center gap-2 h-[30px] text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
      >
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
        {open ? 'お知らせを閉じる' : 'お知らせを表示する'}
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* お知らせ内容 */}
      {open && (
        <div className="border-t border-slate-200 divide-y divide-slate-100">
          {announcements.map((a) => (
            <div key={a.id} className="max-w-7xl mx-auto px-6 py-3 flex items-start gap-3">
              <span className="mt-0.5 shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500" />
              <div>
                <p className="text-sm font-semibold text-slate-800">{a.title}</p>
                <p className="text-xs text-slate-500 mt-0.5 whitespace-pre-line">{a.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
