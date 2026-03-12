'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { useState, useMemo, createContext, useContext, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { headingToId } from '@/lib/toc'
import type React from 'react'

// チェックボックスのインデックスを li → input へ安定して渡すコンテキスト
const CheckboxIdxContext = createContext(-1)

function nodeText(children: React.ReactNode): string {
  if (typeof children === 'string') return children
  if (Array.isArray(children)) return children.map(nodeText).join('')
  if (children !== null && typeof children === 'object' && 'props' in (children as object)) {
    return nodeText((children as React.ReactElement).props.children)
  }
  return ''
}

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 px-2 py-1 text-xs text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded transition-colors"
    >
      {copied ? (
        <>
          <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-emerald-400">コピー済み</span>
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          コピー
        </>
      )}
    </button>
  )
}

// input コンポーネント — コンテキストからインデックスを受け取る（副作用なし）
function CheckboxInput({
  progress,
  saving,
  handleCheck,
}: {
  progress: Record<number, boolean>
  saving: Set<number>
  handleCheck: (idx: number, checked: boolean) => void
}) {
  const idx = useContext(CheckboxIdxContext)
  if (idx === -1) return null
  const isChecked = progress[idx] ?? false
  return (
    <span
      role="checkbox"
      aria-checked={isChecked}
      onClick={() => !saving.has(idx) && handleCheck(idx, !isChecked)}
      className={`inline-flex items-center justify-center w-5 h-5 rounded border-2 cursor-pointer shrink-0 transition-all ${
        saving.has(idx)
          ? 'opacity-40 cursor-wait'
          : isChecked
          ? 'bg-blue-600 border-blue-600'
          : 'bg-white border-slate-400 hover:border-blue-500'
      }`}
      style={{ display: 'inline-flex', verticalAlign: 'middle' }}
    >
      {isChecked && (
        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      )}
    </span>
  )
}

interface Props {
  content: string
  curriculumId: string
  initialProgress: Record<number, boolean>
  onProgressChange?: (progress: Record<number, boolean>) => void
  onSavingChange?: (saving: boolean) => void
}

export default function MarkdownRenderer({ content, curriculumId, initialProgress, onProgressChange, onSavingChange }: Props) {
  const router = useRouter()
  const [progress, setProgress] = useState<Record<number, boolean>>(initialProgress)
  const [saving, setSaving] = useState<Set<number>>(new Set())

  useEffect(() => {
    onSavingChange?.(saving.size > 0)
  }, [saving, onSavingChange])

  const handleCheck = useCallback(async (index: number, checked: boolean) => {
    const next = { ...progress, [index]: checked }
    setProgress(next)
    onProgressChange?.(next)
    setSaving((prev) => new Set(prev).add(index))
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ curriculumId, checkboxIndex: index, checked }),
      })
      router.refresh()
    } finally {
      setSaving((prev) => { const n = new Set(prev); n.delete(index); return n })
    }
  }, [progress, curriculumId, onProgressChange, router])

  // マークダウンのソース行番号 → チェックボックスインデックスのマップ
  // (remark は行番号を 1-indexed で管理するため +1 する)
  const lineToIdx = useMemo(() => {
    const map = new Map<number, number>()
    let idx = 0
    content.split('\n').forEach((line, lineNum) => {
      if (/^[-*+] \[[ xX]\]/.test(line)) {
        map.set(lineNum + 1, idx++)
      }
    })
    return map
  }, [content])

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 md:p-8">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          // li でインデックスをコンテキストに注入 → input で受け取る
          li: ({ children, className, node }) => {
            if (className === 'task-list-item') {
              const startLine = (node as { position?: { start: { line: number } } }).position?.start.line
              const idx = startLine !== undefined ? (lineToIdx.get(startLine) ?? 0) : 0
              return (
                <CheckboxIdxContext.Provider value={idx}>
                  <li className="text-slate-700 flex items-start gap-2 py-1.5 px-2 rounded-lg hover:bg-slate-50 transition-colors">
                    {children}
                  </li>
                </CheckboxIdxContext.Provider>
              )
            }
            return <li className="text-slate-700">{children}</li>
          },

          input({ type }) {
            if (type === 'checkbox') {
              return (
                <CheckboxInput
                  progress={progress}
                  saving={saving}
                  handleCheck={handleCheck}
                />
              )
            }
            return <input type={type} />
          },

          // Headings
          h1: ({ children }) => {
            const id = headingToId(nodeText(children))
            return <h1 id={id} className="text-4xl font-bold mt-14 mb-6 text-slate-900 first:mt-0 pb-3 border-b-2 border-slate-200 leading-tight scroll-mt-24">{children}</h1>
          },
          h2: ({ children }) => {
            const id = headingToId(nodeText(children))
            return <h2 id={id} className="text-2xl font-bold mt-12 mb-5 text-slate-800 pb-2 border-b border-slate-200 leading-snug scroll-mt-24">{children}</h2>
          },
          h3: ({ children }) => {
            const id = headingToId(nodeText(children))
            return <h3 id={id} className="text-xl font-bold mt-10 mb-4 text-slate-800 leading-snug pl-4 border-l-4 border-blue-500 scroll-mt-24">{children}</h3>
          },

          p: ({ children }) => <p className="mb-4 leading-7 text-slate-700">{children}</p>,

          ul: ({ children, className }) => (
            <ul className={`mb-4 space-y-0.5 ${className === 'contains-task-list' ? 'list-none pl-0' : 'list-disc pl-5 text-slate-700'}`}>
              {children}
            </ul>
          ),
          ol: ({ children }) => <ol className="mb-4 pl-5 list-decimal space-y-1 text-slate-700">{children}</ol>,

          // Syntax highlighted code blocks
          code({ className, children }) {
            const match = /language-(\w+)/.exec(className ?? '')
            const codeString = String(children).replace(/\n$/, '')

            if (match) {
              const lang = match[1]
              return (
                <div className="my-5 rounded-xl overflow-hidden border border-slate-700/50 shadow-lg">
                  <div className="flex items-center justify-between px-4 py-2 bg-[#1e2433] border-b border-slate-700/50">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
                        <span className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
                      </div>
                      <span className="text-xs text-slate-400 font-mono ml-1">{lang}</span>
                    </div>
                    <CopyButton code={codeString} />
                  </div>
                  <SyntaxHighlighter
                    language={lang}
                    style={oneDark}
                    customStyle={{
                      margin: 0,
                      borderRadius: 0,
                      padding: '1.25rem 1rem',
                      fontSize: '0.875rem',
                      lineHeight: '1.7',
                      background: '#282c34',
                    }}
                    showLineNumbers={codeString.split('\n').length > 4}
                    lineNumberStyle={{ color: '#4a5568', fontSize: '0.75rem', minWidth: '2.5rem' }}
                  >
                    {codeString}
                  </SyntaxHighlighter>
                </div>
              )
            }

            return (
              <code className="bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-sm font-mono text-blue-700">
                {children}
              </code>
            )
          },

          // Tables
          table: ({ children }) => (
            <div className="my-6 overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
              <table className="w-full text-sm text-left">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-slate-100 text-slate-700 font-semibold">{children}</thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-slate-100">{children}</tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-slate-50 transition-colors">{children}</tr>
          ),
          th: ({ children }) => (
            <th className="px-4 py-3 font-semibold text-slate-700 whitespace-nowrap">{children}</th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-3 text-slate-600">{children}</td>
          ),

          img: ({ src, alt }) => (
            <span className="block my-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={alt ?? ''} className="max-w-full rounded-xl border border-slate-200 shadow-sm" />
            </span>
          ),

          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-400 pl-4 py-1 my-4 bg-blue-50 rounded-r-lg text-slate-600 italic">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-8 border-slate-200" />,
          strong: ({ children }) => <strong className="font-bold text-slate-900">{children}</strong>,
          em: ({ children }) => <em className="text-slate-600 italic">{children}</em>,
          a: ({ href, children }) => (
            <a href={href} className="text-blue-600 hover:text-blue-700 underline underline-offset-2 transition-colors" target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
