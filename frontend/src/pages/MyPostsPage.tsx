import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { materialsApi } from '../api/materials'
import type { Material } from '../api/materials'
import { Breadcrumb } from '../components/layout/Breadcrumb'
import { PhotoGrid } from '../components/photos/PhotoGrid'
import { PhotoDetail } from '../components/photos/PhotoDetail'
import { Button } from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'

export default function MyPostsPage() {
  const { user } = useAuth()
  const { t } = useLang()
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Material | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    materialsApi.myMaterials().then(setMaterials).finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm(t.deleteConfirm)) return
    setDeleting(id)
    await materialsApi.delete(id)
    setMaterials(prev => prev.filter(m => m.materialId !== id))
    setDeleting(null)
  }

  return (
    <>
      <Breadcrumb crumbs={[{ label: t.breadcrumbHome, to: '/' }, { label: t.myPostsTitle }]} />

      {user?.isBlocked === true && (
        <div role="alert" className="mt-4 p-4 rounded border border-red-300 bg-red-50 text-red-700 text-sm">
          Twoje konto zostało zablokowane. Nie możesz dodawać ani edytować zdjęć.
        </div>
      )}

      <div className="flex items-center justify-between mt-6 mb-4">
        <h1 className="text-2xl font-bold text-[var(--text)]">{t.myPostsTitle}</h1>
        <Link to="/upload" className="px-4 py-2 rounded bg-[var(--accent)] text-white text-sm hover:opacity-90">
          + {t.addPhoto}
        </Link>
      </div>

      <PhotoGrid
        materials={materials}
        loading={loading}
        onSelect={setSelected}
        renderActions={(m) => (
          <div className="flex gap-2 mt-1">
            <Link to={`/my-posts/${m.materialId}/edit`}
              className="px-3 py-1 text-xs rounded border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)]">
              {t.edit}
            </Link>
            <Button variant="danger" size="sm" onClick={() => handleDelete(m.materialId)} disabled={deleting === m.materialId}>
              {deleting === m.materialId ? '...' : t.delete}
            </Button>
          </div>
        )}
      />

      {selected && <PhotoDetail material={selected} onClose={() => setSelected(null)} />}
    </>
  )
}
