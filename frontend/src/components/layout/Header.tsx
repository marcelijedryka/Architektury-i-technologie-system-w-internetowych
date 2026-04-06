import { Link } from 'react-router-dom'
import { ThemeSwitcher } from './ThemeSwitcher'
import { UserMenu } from './UserMenu'
import { useAuth } from '../../context/AuthContext'
import { useLang } from '../../context/LangContext'
import type { Lang } from '../../translations'

export function Header() {
  const { user } = useAuth()
  const { lang, t, setLang } = useLang()

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg)]" role="banner">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-4">
        <Link to="/" className="font-bold text-lg text-[var(--accent)] shrink-0">
          📷 {t.archive}
        </Link>
        <nav className="flex items-center gap-3 ml-auto" aria-label="Główna nawigacja">
          {user && (user.role === 'CREATOR' || user.role === 'ADMIN') && (
            <Link to="/upload" className="text-sm hover:text-[var(--accent)]">{t.addPhoto}</Link>
          )}
          <div className="flex items-center gap-1" role="group" aria-label="Język / Language">
            {(['pl', 'en'] as Lang[]).map(l => (
              <button
                key={l}
                onClick={() => setLang(l)}
                aria-pressed={lang === l}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors
                  ${lang === l
                    ? 'bg-[var(--accent)] text-white'
                    : 'bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--accent)]'
                  }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <ThemeSwitcher />
          <UserMenu />
        </nav>
      </div>
    </header>
  )
}
