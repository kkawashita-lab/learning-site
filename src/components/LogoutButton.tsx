'use client'

import { signOut } from 'next-auth/react'

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="text-sm text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded hover:bg-slate-100 transition-colors"
    >
      ログアウト
    </button>
  )
}
