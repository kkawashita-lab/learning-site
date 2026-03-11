'use client'

import { useState } from 'react'
import Link from 'next/link'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import TableOfContents from '@/components/TableOfContents'
import type { TocHeading } from '@/components/TableOfContents'

const heroGradients = [
  'from-blue-700 via-blue-800 to-slate-900',
  'from-indigo-700 via-indigo-800 to-slate-900',
  'from-sky-700 via-sky-800 to-slate-900',
  'from-violet-700 via-violet-800 to-slate-900',
  'from-teal-700 via-teal-800 to-slate-900',
  'from-slate-700 via-slate-800 to-slate-900',
]

interface Props {
  curriculum: {
    id: string
    title: string
    description: string | null
    content: string
  }
  curriculumIndex: number
  totalItems: number
  initialProgress: Record<number, boolean>
  headings: TocHeading[]
  prevId: string | null
  nextId: string | null
}

export default function CurriculumContent({
  curriculum,
  curriculumIndex,
  totalItems,
  initialProgress,
  headings,
  prevId,
  nextId,
}: Props) {
  const [progress, setProgress] = useState<Record<number, boolean>>(initialProgress)

  const checkedCount = Object.values(progress).filter(Boolean).length
  const pct = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0
  const gradient = heroGradients[curriculumIndex % heroGradients.length]

  return (
    <div>
      {/* Hero */}
      <div className={`relative bg-gradient-to-br ${gradient}`}>
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)',
            backgroundSize: '20px 20px',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        <div className="relative max-w-4xl mx-auto px-4 pt-10 pb-14">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-white/60 mb-6">
            <Link href="/dashboard" className="hover:text-white transition-colors">
              カリキュラム一覧
            </Link>
            <span>/</span>
            <span className="text-white/90">{curriculum.title}</span>
          </div>

          {/* Title area */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-white/60 text-xs font-medium uppercase tracking-widest mb-2">
                Curriculum {String(curriculumIndex + 1).padStart(2, '0')}
              </p>
              <h1 className="text-2xl md:text-3xl font-bold text-white leading-snug">
                {curriculum.title}
              </h1>
              {curriculum.description && (
                <p className="text-white/70 mt-2 text-sm leading-relaxed max-w-lg">
                  {curriculum.description}
                </p>
              )}
            </div>

            {/* Circular progress — リアルタイム更新 */}
            <div className="shrink-0 hidden sm:block">
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="6" />
                  <circle
                    cx="40" cy="40" r="34"
                    fill="none"
                    stroke={pct === 100 ? '#2dd4bf' : '#60a5fa'}
                    strokeWidth="6"
                    strokeDasharray={`${2 * Math.PI * 34}`}
                    strokeDashoffset={`${2 * Math.PI * 34 * (1 - pct / 100)}`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-white font-bold text-lg leading-none">{pct}%</span>
                  <span className="text-white/60 text-xs">完了</span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress bar — リアルタイム更新 */}
          <div className="mt-6">
            <div className="flex justify-between text-xs text-white/60 mb-1.5">
              <span>進捗</span>
              <span>{checkedCount} / {totalItems} 項目</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-teal-400 h-2 rounded-full"
                style={{ width: `${pct}%`, transition: 'width 0.5s ease' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main content: 2-column layout */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-8 items-start">

          {/* Left: markdown content */}
          <div className="flex-1 min-w-0">
            <MarkdownRenderer
              content={curriculum.content}
              curriculumId={curriculum.id}
              initialProgress={initialProgress}
              onProgressChange={setProgress}
            />

            {/* Completion message */}
            {pct === 100 && (
              <div className="mt-8 bg-blue-950/40 border border-blue-500/30 rounded-xl p-6 text-center">
                <p className="text-2xl font-bold text-blue-300 mb-1">お疲れ様でした！</p>
                <p className="text-slate-400 text-sm">このカリキュラムをすべて完了しました。</p>
                {nextId && (
                  <Link
                    href={`/curriculum/${nextId}`}
                    className="inline-block mt-4 bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2.5 rounded-full text-sm transition-colors shadow-lg shadow-blue-700/30"
                  >
                    次のカリキュラムへ →
                  </Link>
                )}
              </div>
            )}

            {/* Prev / Next navigation */}
            <div className="mt-8 flex items-center justify-between gap-4">
              {prevId ? (
                <Link
                  href={`/curriculum/${prevId}`}
                  className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-100 bg-slate-800 border border-slate-700 px-4 py-2.5 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  前のカリキュラム
                </Link>
              ) : (
                <div />
              )}
              <Link href="/dashboard" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                一覧に戻る
              </Link>
              {nextId ? (
                <Link
                  href={`/curriculum/${nextId}`}
                  className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-100 bg-slate-800 border border-slate-700 px-4 py-2.5 rounded-lg transition-colors"
                >
                  次のカリキュラム
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ) : (
                <div />
              )}
            </div>
          </div>

          {/* Right: sticky TOC + progress */}
          <aside className="hidden xl:block w-56 shrink-0 sticky top-20 self-start space-y-3">
            {/* Progress widget */}
            {totalItems > 0 && (
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <p className="text-sm font-semibold text-slate-700 mb-2">
                  進捗度<span className="font-bold text-slate-900"> {checkedCount} / {totalItems}</span>
                </p>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-sky-400 rounded-full"
                    style={{ width: `${pct}%`, transition: 'width 0.4s ease' }}
                  />
                </div>
                <p className="text-right text-xs font-semibold text-sky-600 mt-1">{pct}%</p>
              </div>
            )}

            <TableOfContents headings={headings} />
          </aside>

        </div>
      </div>
    </div>
  )
}
