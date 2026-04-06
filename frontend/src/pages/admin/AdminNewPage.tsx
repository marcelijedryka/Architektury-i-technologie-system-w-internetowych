import { useState, useEffect } from 'react'
import type { Material } from '../../api/materials'
import client from '../../api/client'
import { PhotoDetail } from '../../components/photos/PhotoDetail'

export default function AdminNewPage() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [selected, setSelected] = useState<Material | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    client.get('/auth/me').then(r => {
      const since = r.data.lastLoginAt || new Date(0).toISOString()
      return client.get(`/materials/admin/new-since/${encodeURIComponent(since)}`).then(r2 => r2.data)
    }).then(setMaterials).finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Ładowanie...</p>

  return (
    <div>
      <h2 className="text-xl font-bold text-[var(--text)] mb-1">Nowe od ostatniego logowania</h2>
      <p className="text-sm text-[var(--text-muted)] mb-4">{materials.length} nowych zdjęć</p>
      {materials.length === 0
        ? <p className="text-[var(--text-muted)] text-sm">Brak nowych zdjęć od Twojego ostatniego logowania.</p>
        : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {materials.map(m => (
              <article key={m.materialId}
                className="rounded border border-[var(--border)] bg-[var(--surface)] overflow-hidden cursor-pointer hover:border-[var(--accent)]"
                onClick={() => setSelected(m)}>
                <img src={m.imageUrl} alt={m.altText} className="w-full aspect-[4/3] object-cover" />
                <div className="p-3">
                  <p className="text-sm font-medium truncate">{m.title}</p>
                  <p className="text-xs text-[var(--text-muted)]">{m.uploadedBy}</p>
                </div>
              </article>
            ))}
          </div>
        )
      }
      {selected && <PhotoDetail material={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
