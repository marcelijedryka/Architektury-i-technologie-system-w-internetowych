import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { materialsApi } from '../api/materials'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Breadcrumb } from '../components/layout/Breadcrumb'

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [altText, setAltText] = useState('')
  const [photoDate, setPhotoDate] = useState('')
  const [tags, setTags] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    materialsApi.getById(id).then(m => {
      setTitle(m.title); setDescription(m.description)
      setAltText(m.altText); setPhotoDate(m.photoDate)
      setTags(m.tags?.join(', ') ?? '')
    })
  }, [id])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await materialsApi.update(id!, {
        title, description, altText, photoDate,
        tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      })
      navigate('/my-posts')
    } catch {
      setError('Błąd podczas zapisywania zmian')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Breadcrumb crumbs={[{ label: 'Strona główna', to: '/' }, { label: 'Moje zdjęcia', to: '/my-posts' }, { label: 'Edytuj' }]} />
      <div className="max-w-lg mt-6">
        <h1 className="text-2xl font-bold text-[var(--text)] mb-6">Edytuj zdjęcie</h1>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
          <Input label="Tytuł" value={title} onChange={e => setTitle(e.target.value)} required />
          <div className="flex flex-col gap-1">
            <label htmlFor="desc-edit" className="text-sm font-medium">Opis <span className="text-red-500">*</span></label>
            <textarea id="desc-edit" value={description} onChange={e => setDescription(e.target.value)} rows={3} required
              className="rounded border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm px-3 py-2 focus:border-[var(--accent)] focus:outline-none resize-none" />
          </div>
          <Input label="Tekst alternatywny" value={altText} onChange={e => setAltText(e.target.value)} required />
          <Input label="Data zdjęcia" value={photoDate} onChange={e => setPhotoDate(e.target.value)} required />
          <Input label="Tagi (opcjonalnie)" value={tags} onChange={e => setTags(e.target.value)} placeholder="np. kościół, most" />
          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>{loading ? 'Zapisywanie...' : 'Zapisz zmiany'}</Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/my-posts')}>Anuluj</Button>
          </div>
        </form>
      </div>
    </>
  )
}
