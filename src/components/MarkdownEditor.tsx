'use client'

import { useState, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'

interface Props {
  value: string
  onChange: (value: string) => void
}

export default function MarkdownEditor({ value, onChange }: Props) {
  const [tab, setTab] = useState<'edit' | 'preview'>('edit')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  /** 選択範囲をbeforeとafterで囲む */
  const wrapSelection = (before: string, after: string) => {
    const textarea = textareaRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = value.substring(start, end)
    const replacement = before + selected + after
    onChange(value.substring(0, start) + replacement + value.substring(end))
    requestAnimationFrame(() => {
      textarea.selectionStart = start + before.length
      textarea.selectionEnd = start + before.length + selected.length
      textarea.focus()
    })
  }

  /** カーソル位置にテキストを挿入する */
  const insertAtCursor = (text: string) => {
    const textarea = textareaRef.current
    if (!textarea) {
      onChange(value + text)
      return
    }
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const next = value.substring(0, start) + text + value.substring(end)
    onChange(next)
    // 挿入後にカーソルをテキストの末尾に移動
    requestAnimationFrame(() => {
      textarea.selectionStart = start + text.length
      textarea.selectionEnd = start + text.length
      textarea.focus()
    })
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = '' // 同じファイルを再選択できるようリセット

    setUploadError('')
    setUploading(true)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()

      if (!res.ok) {
        setUploadError(data.error || 'アップロードに失敗しました')
        return
      }

      // 画像のマークダウンをカーソル位置に挿入
      const altText = file.name.replace(/\.[^.]+$/, '')
      insertAtCursor(`\n![${altText}](${data.url})\n`)
    } catch {
      setUploadError('通信エラーが発生しました')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="border border-slate-300 rounded-xl overflow-hidden bg-white">
      {/* Tab bar + toolbar */}
      <div className="flex items-center border-b border-slate-200 bg-slate-50">
        {/* Tabs */}
        <button
          type="button"
          onClick={() => setTab('edit')}
          className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${
            tab === 'edit'
              ? 'text-blue-600 border-blue-600 bg-white'
              : 'text-slate-500 border-transparent hover:text-slate-700'
          }`}
        >
          編集
        </button>
        <button
          type="button"
          onClick={() => setTab('preview')}
          className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${
            tab === 'preview'
              ? 'text-blue-600 border-blue-600 bg-white'
              : 'text-slate-500 border-transparent hover:text-slate-700'
          }`}
        >
          プレビュー
        </button>

        <div className="h-5 w-px bg-slate-200 mx-2" />

        {/* Toolbar — edit mode only */}
        {tab === 'edit' && (
          <div className="flex items-center gap-1">
            {/* Decoration buttons */}
            <button
              type="button"
              onClick={() => wrapSelection('<mark>', '</mark>')}
              title="ハイライト"
              className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-yellow-700 hover:bg-yellow-50 rounded-lg transition-colors"
            >
              <mark style={{ padding: '0 4px', borderRadius: '3px', background: '#fef08a', color: '#713f12' }}>A</mark>
            </button>
            <button
              type="button"
              onClick={() => wrapSelection('<span class="md-big">', '</span>')}
              title="大きい文字"
              className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              A+
            </button>
            <button
              type="button"
              onClick={() => wrapSelection('<span class="md-xl">', '</span>')}
              title="特大文字"
              className="px-2.5 py-1.5 text-sm font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              A++
            </button>

            <div className="h-5 w-px bg-slate-200 mx-1" />

            {/* Image upload button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              title="画像をアップロード"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-wait"
            >
              {uploading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  アップロード中…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  画像を挿入
                </>
              )}
            </button>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        )}

        {/* Hint */}
        <div className="ml-auto px-4 py-2 text-xs text-slate-400 hidden sm:block">
          <code className="bg-slate-100 px-1 rounded">- [ ] タスク</code> でチェックボックス
        </div>
      </div>

      {/* Upload error */}
      {uploadError && (
        <div className="px-4 py-2 bg-red-50 border-b border-red-100 text-red-600 text-sm flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {uploadError}
          <button type="button" onClick={() => setUploadError('')} className="ml-auto text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {/* Edit pane */}
      {tab === 'edit' && (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-96 p-4 font-mono text-sm text-slate-800 resize-y focus:outline-none bg-white"
          placeholder={`# カリキュラムタイトル\n\n内容を書いてください...\n\n## セクション\n\n- [ ] チェックボックス項目1\n- [ ] チェックボックス項目2\n\n画像の挿入: ツールバーの「画像を挿入」ボタンを使用`}
          spellCheck={false}
        />
      )}

      {/* Preview pane */}
      {tab === 'preview' && (
        <div className="p-6 h-96 overflow-y-auto bg-white">
          {value ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={{
                h1: ({ children }) => <h1 className="text-2xl font-bold mt-4 mb-3 text-slate-900 border-b pb-2">{children}</h1>,
                h2: ({ children }) => <h2 className="text-xl font-semibold mt-5 mb-2 text-slate-800 border-b border-slate-200 pb-1">{children}</h2>,
                h3: ({ children }) => <h3 className="text-lg font-medium mt-4 mb-2 text-slate-700">{children}</h3>,
                p: ({ children }) => <p className="mb-3 leading-7 text-slate-700">{children}</p>,
                ul: ({ children, className }) => (
                  <ul className={`mb-3 ${className === 'contains-task-list' ? 'list-none pl-0' : 'list-disc pl-5'} space-y-1`}>{children}</ul>
                ),
                ol: ({ children }) => <ol className="mb-3 pl-5 list-decimal space-y-1 text-slate-700">{children}</ol>,
                li: ({ children, className }) => (
                  <li className={`text-slate-700 ${className === 'task-list-item' ? 'flex items-start gap-2' : ''}`}>{children}</li>
                ),
                input: ({ type, checked }) => (
                  <input type={type} checked={checked} readOnly className="mr-1 accent-blue-600" style={{ display: 'inline' }} />
                ),
                img: ({ src, alt }) => (
                  <span className="block my-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={alt ?? ''} className="max-w-full rounded-lg border border-slate-200 shadow-sm" />
                  </span>
                ),
                code({ className, children }) {
                  const isBlock = className?.startsWith('language-')
                  if (isBlock) {
                    return (
                      <pre className="bg-slate-900 rounded-lg p-4 overflow-x-auto my-3">
                        <code className="text-sm font-mono text-slate-200 whitespace-pre">{children}</code>
                      </pre>
                    )
                  }
                  return <code className="bg-slate-100 px-1.5 py-0.5 rounded text-sm font-mono text-blue-700">{children}</code>
                },
              }}
            >
              {value}
            </ReactMarkdown>
          ) : (
            <p className="text-slate-400 text-sm">プレビューするコンテンツがありません</p>
          )}
        </div>
      )}
    </div>
  )
}
