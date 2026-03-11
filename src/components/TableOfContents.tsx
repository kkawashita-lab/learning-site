'use client'

import { useEffect, useState, useCallback } from 'react'

export interface TocHeading {
  level: number
  text: string
  id: string
}

interface Props {
  headings: TocHeading[]
}

export default function TableOfContents({ headings }: Props) {
  const [activeId, setActiveId] = useState<string>(headings[0]?.id ?? '')

  const updateActive = useCallback(() => {
    const scrollY = window.scrollY + 96
    let current = headings[0]?.id ?? ''
    for (const { id } of headings) {
      const el = document.getElementById(id)
      if (el && el.offsetTop <= scrollY) current = id
    }
    setActiveId(current)
  }, [headings])

  useEffect(() => {
    updateActive()
    window.addEventListener('scroll', updateActive, { passive: true })
    return () => window.removeEventListener('scroll', updateActive)
  }, [updateActive])

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' })
  }

  if (headings.length === 0) return null

  return (
    <nav className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 pb-2.5 border-b border-slate-100">
        目次
      </p>
      <ul className="space-y-0.5 max-h-[calc(100vh-10rem)] overflow-y-auto">
        {headings.map(({ level, text, id }) => {
          const isActive = activeId === id
          return (
            <li key={id}>
              <button
                onClick={() => scrollTo(id)}
                className={`w-full text-left text-xs py-1.5 rounded-lg transition-all duration-150 leading-snug ${
                  isActive
                    ? 'text-blue-700 font-semibold bg-blue-50 border-l-2 border-blue-600'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
                style={{
                  paddingLeft: isActive
                    ? level <= 2 ? 6 : 18
                    : level <= 2 ? 8 : 20,
                }}
              >
                {level >= 3 && (
                  <span className={`mr-1 ${isActive ? 'text-blue-400' : 'text-slate-300'}`}>–</span>
                )}
                {text}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
