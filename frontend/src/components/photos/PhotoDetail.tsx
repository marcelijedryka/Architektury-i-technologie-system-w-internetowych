import { useEffect, useRef } from 'react'
import type { Material } from '../../api/materials'
import { useLang } from '../../context/LangContext'

interface Props {
  material: Material
  onClose: () => void
  isLiked?: boolean
  onLike?: (id: string) => void
}

export function PhotoDetail({ material, onClose, isLiked, onLike }: Props) {
  const { t } = useLang()
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeRef.current?.focus()
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={material.title}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-[var(--bg)] rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <h2 className="font-semibold text-lg text-[var(--text)]">{material.title}</h2>
          <button ref={closeRef} onClick={onClose} aria-label={t.close}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-[var(--surface)] text-lg">
            ✕
          </button>
        </div>
        <img src={material.imageUrl} alt={material.altText} className="w-full object-contain max-h-[50vh]" />
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[var(--text)]">{material.description}</p>
            {onLike && (
              <button
                onClick={() => onLike(material.materialId)}
                aria-label={isLiked ? t.unlike : t.like}
                aria-pressed={isLiked}
                className={`flex items-center gap-1.5 text-base shrink-0 ml-4 transition-colors
                  ${isLiked ? 'text-red-500' : 'text-[var(--text-muted)] hover:text-red-400'}`}
              >
                <span aria-hidden="true">{isLiked ? '♥' : '♡'}</span>
                <span className="text-sm">{material.likeCount ?? 0}</span>
              </button>
            )}
          </div>
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <div><dt className="text-[var(--text-muted)] text-xs">{t.date}</dt><dd>{material.photoDate}</dd></div>
            <div><dt className="text-[var(--text-muted)] text-xs">{t.addedBy}</dt><dd>{material.uploadedBy}</dd></div>
            {material.continent && <div><dt className="text-[var(--text-muted)] text-xs">{t.continent}</dt><dd>{material.continent}</dd></div>}
            {material.country && <div><dt className="text-[var(--text-muted)] text-xs">{t.countryLabel}</dt><dd>{material.country}</dd></div>}
            {material.city && <div><dt className="text-[var(--text-muted)] text-xs">{t.city}</dt><dd>{material.city}</dd></div>}
            {material.tags?.length ? (
              <div className="col-span-2">
                <dt className="text-[var(--text-muted)] text-xs mb-1">{t.tags}</dt>
                <dd className="flex gap-1 flex-wrap">
                  {material.tags.map(tag => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-[var(--surface)] border border-[var(--border)]">{tag}</span>
                  ))}
                </dd>
              </div>
            ) : null}
          </dl>
        </div>
      </div>
    </div>
  )
}
