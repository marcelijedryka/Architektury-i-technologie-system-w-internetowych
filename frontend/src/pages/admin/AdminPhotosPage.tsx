import { useState, useEffect } from 'react'
import { materialsApi } from '../../api/materials'
import type { Material } from '../../api/materials'
import { Button } from '../../components/ui/Button'

export default function AdminPhotosPage() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [editing, setEditing] = useState<Material | null>(null)
  const [editDesc, setEditDesc] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { materialsApi.all().then(setMaterials).finally(() => setLoading(false)) }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Usunąć to zdjęcie? Tej operacji nie można cofnąć.')) return
    await materialsApi.delete(id)
    setMaterials(prev => prev.filter(m => m.materialId !== id))
  }

  const startEdit = (m: Material) => { setEditing(m); setEditTitle(m.title); setEditDesc(m.description) }

  const saveEdit = async () => {
    if (!editing) return
    await materialsApi.update(editing.materialId, { title: editTitle, description: editDesc })
    setMaterials(prev => prev.map(m => m.materialId === editing.materialId ? { ...m, title: editTitle, description: editDesc } : m))
    setEditing(null)
  }

  if (loading) return <p>Ładowanie...</p>

  return (
    <div>
      <h2 className="text-xl font-bold text-[var(--text)] mb-4">Wszystkie zdjęcia ({materials.length})</h2>
      <div className="space-y-2">
        {materials.map(m => (
          <div key={m.materialId} className="flex items-center gap-3 p-3 rounded border border-[var(--border)] bg-[var(--surface)]">
            <img src={m.imageUrl} alt={m.altText} className="w-14 h-10 object-cover rounded shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{m.title}</p>
              <p className="text-xs text-[var(--text-muted)]">{m.uploadedBy} · {m.photoDate}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button size="sm" variant="secondary" onClick={() => startEdit(m)}>Edytuj</Button>
              <Button size="sm" variant="danger" onClick={() => handleDelete(m.materialId)}>Usuń</Button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-label="Edytuj zdjęcie">
          <div className="bg-[var(--bg)] rounded-xl p-6 w-full max-w-md space-y-4">
            <h3 className="font-semibold text-lg">Edytuj zdjęcie</h3>
            <div className="flex flex-col gap-1">
              <label htmlFor="admin-title" className="text-sm font-medium">Tytuł</label>
              <input id="admin-title" value={editTitle} onChange={e => setEditTitle(e.target.value)}
                className="rounded border border-[var(--border)] px-3 py-2 text-sm bg-[var(--bg)] text-[var(--text)]" />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="admin-desc" className="text-sm font-medium">Opis</label>
              <textarea id="admin-desc" value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={4}
                className="rounded border border-[var(--border)] px-3 py-2 text-sm bg-[var(--bg)] text-[var(--text)] resize-none" />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setEditing(null)}>Anuluj</Button>
              <Button onClick={saveEdit}>Zapisz</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
