import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLang } from '../../context/LangContext'

export function UserMenu() {
  const { user, logout } = useAuth()
  const { t } = useLang()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (!user) return (
    <Link to="/login" className="px-3 py-1.5 rounded bg-[var(--accent)] text-[var(--on-accent)] text-sm font-medium hover:opacity-90">
      {t.login}
    </Link>
  )

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        aria-haspopup="true"
        aria-expanded={open}
        className="flex items-center gap-2 px-3 py-1.5 rounded border border-[var(--border)] bg-[var(--surface)] text-sm hover:border-[var(--accent)]"
      >
        <span className="w-6 h-6 rounded-full bg-[var(--accent)] text-[var(--on-accent)] flex items-center justify-center text-xs font-bold">
          {user.name[0].toUpperCase()}
        </span>
        <span className="max-w-[120px] truncate">{user.name}</span>
        <span aria-hidden="true">▾</span>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-1 w-44 rounded border border-[var(--border)] bg-[var(--surface)] shadow-lg z-50"
        >
          <Link to="/account" role="menuitem" onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm hover:bg-[var(--bg)]">{t.myAccount}</Link>
          <Link to="/my-posts" role="menuitem" onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm hover:bg-[var(--bg)]">{t.myPhotos}</Link>
          {user.role === 'ADMIN' && (
            <Link to="/admin" role="menuitem" onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm hover:bg-[var(--bg)]">{t.adminPanel}</Link>
          )}
          <hr className="border-[var(--border)]" />
          <button role="menuitem" onClick={async () => { await logout(); setOpen(false); navigate('/') }}
            className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--bg)]">{t.logout}</button>
        </div>
      )}
    </div>
  )
}
