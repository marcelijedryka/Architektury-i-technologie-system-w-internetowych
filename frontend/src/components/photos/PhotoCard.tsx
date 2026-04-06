import type { Material } from '../../api/materials'
import { useLang } from '../../context/LangContext'

interface Props {
  material: Material
  onClick: () => void
  actions?: React.ReactNode
  isLiked?: boolean
  onLike?: (id: string) => void
}

export function PhotoCard({ material, onClick, actions, isLiked, onLike }: Props) {
  const { t } = useLang()
  return (
    <article className="rounded-lg border border-[var(--border)] bg-[var(--surface)] overflow-hidden hover:border-[var(--accent)] transition-colors group">
      <button
        onClick={onClick}
        className="w-full text-left focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
        aria-label={`${material.title}`}
      >
        <div className="aspect-[4/3] overflow-hidden bg-[var(--border)]">
          <img
            src={material.imageUrl}
            alt={material.altText}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
        <div className="p-3 pb-2">
          <h2 className="font-medium text-sm text-[var(--text)] truncate">{material.title}</h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">{material.photoDate}</p>
        </div>
      </button>

      <div className="px-3 pb-3 flex items-center justify-between">
        {onLike && (
          <button
            onClick={e => { e.stopPropagation(); onLike(material.materialId) }}
            aria-label={isLiked ? t.unlike : t.like}
            aria-pressed={isLiked}
            className={`flex items-center gap-1.5 text-sm transition-colors min-w-[44px] min-h-[44px] justify-start
              ${isLiked ? 'text-red-500' : 'text-[var(--text-muted)] hover:text-red-400'}`}
          >
            <span aria-hidden="true">{isLiked ? '♥' : '♡'}</span>
            <span>{material.likeCount ?? 0}</span>
          </button>
        )}
        {actions && <div className="flex gap-2 ml-auto">{actions}</div>}
      </div>
    </article>
  )
}
