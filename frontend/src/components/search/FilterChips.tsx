interface Chip { key: string; label: string }

interface Props { chips: Chip[]; onRemove: (key: string) => void }

export function FilterChips({ chips, onRemove }: Props) {
  if (chips.length === 0) return null
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Aktywne filtry">
      {chips.map(chip => (
        <span key={chip.key} className="flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-[var(--accent)] text-white">
          {chip.label}
          <button onClick={() => onRemove(chip.key)} aria-label={`Usuń filtr: ${chip.label}`}
            className="ml-1 hover:opacity-75">✕</button>
        </span>
      ))}
    </div>
  )
}
