import type { Material } from '../../api/materials'
import { PhotoCard } from './PhotoCard'
import { EmptyState } from './EmptyState'
import { useLang } from '../../context/LangContext'

interface Props {
  materials: Material[]
  onSelect: (m: Material) => void
  onClearFilters?: () => void
  renderActions?: (m: Material) => React.ReactNode
  loading?: boolean
  likedIds?: Set<string>
  onLike?: (id: string) => void
}

export function PhotoGrid({ materials, onSelect, onClearFilters, renderActions, loading, likedIds, onLike }: Props) {
  const { t } = useLang()
  if (loading) return (
    <div role="status" aria-live="polite" className="flex justify-center py-20">
      <span className="text-[var(--text-muted)]">{t.loading}</span>
    </div>
  )
  if (materials.length === 0) return <EmptyState onClear={onClearFilters} />
  return (
    <section aria-label="Wyniki wyszukiwania">
      <p className="text-sm text-[var(--text-muted)] mb-4" aria-live="polite">
        {materials.length} {materials.length === 1 ? 'zdjęcie' : 'zdjęć'}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {materials.map(m => (
          <PhotoCard
            key={m.materialId}
            material={m}
            onClick={() => onSelect(m)}
            actions={renderActions?.(m)}
            isLiked={likedIds?.has(m.materialId)}
            onLike={onLike}
          />
        ))}
      </div>
    </section>
  )
}
