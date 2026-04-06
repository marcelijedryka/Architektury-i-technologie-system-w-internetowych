import { useTheme } from '../../context/ThemeContext'

const OPTIONS = [
  { value: 'light', label: 'Jasny', icon: '☀️' },
  { value: 'dark', label: 'Ciemny', icon: '🌙' },
  { value: 'contrast', label: 'Kontrastowy', icon: '◐' },
] as const

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  return (
    <div role="group" aria-label="Wybierz motyw" className="flex gap-1">
      {OPTIONS.map(opt => (
        <button
          key={opt.value}
          onClick={() => setTheme(opt.value)}
          aria-pressed={theme === opt.value}
          title={opt.label}
          className={`px-2 py-1 rounded text-sm border transition-colors
            ${theme === opt.value
              ? 'bg-[var(--accent)] text-[var(--on-accent)] border-[var(--accent)]'
              : 'bg-[var(--surface)] text-[var(--text)] border-[var(--border)] hover:border-[var(--accent)]'
            }`}
        >
          {opt.icon} <span className="sr-only">{opt.label}</span>
        </button>
      ))}
    </div>
  )
}
