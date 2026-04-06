import { useLang } from '../../context/LangContext'

interface Props { onClear?: () => void }

export function EmptyState({ onClear }: Props) {
  const { t } = useLang()
  return (
    <div role="status" aria-live="polite" className="flex flex-col items-center justify-center py-20 gap-4 text-[var(--text-muted)]">
      <span className="text-5xl" aria-hidden="true">🔍</span>
      <p className="text-lg font-medium">{t.noPhotos}</p>
      {onClear && (
        <button onClick={onClear}
          className="mt-2 px-4 py-2 rounded border border-[var(--border)] text-sm hover:border-[var(--accent)] hover:text-[var(--accent)]">
          {t.clearFilters}
        </button>
      )}
    </div>
  )
}
