import { useState, useRef } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { materialsApi } from '../api/materials'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Breadcrumb } from '../components/layout/Breadcrumb'
import { useLang } from '../context/LangContext'
import { CONTINENTS } from '../constants/continents'

export default function UploadPage() {
  const navigate = useNavigate()
  const { t } = useLang()
  const fileRef = useRef<HTMLInputElement>(null)

  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [altText, setAltText] = useState('')
  const [photoDate, setPhotoDate] = useState('')
  const [continent, setContinent] = useState('')
  const [country, setCountry] = useState('')
  const [city, setCity] = useState('')
  const [tags, setTags] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleFile = (f: File) => {
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f && f.type.startsWith('image/')) handleFile(f)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!file) { setError(t.uploadError); return }
    setError('')
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('title', title)
      fd.append('description', description)
      fd.append('altText', altText)
      fd.append('photoDate', photoDate)
      if (continent) fd.append('continent', continent)
      if (country) fd.append('country', country)
      if (city) fd.append('city', city)
      if (tags) fd.append('tags', JSON.stringify(tags.split(',').map(s => s.trim()).filter(Boolean)))
      await materialsApi.create(fd)
      navigate('/my-posts')
    } catch {
      setError(t.uploadNetworkError)
    } finally {
      setLoading(false)
    }
  }

  const selectClass = 'rounded border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm px-3 py-2 focus:border-[var(--accent)] focus:outline-none w-full'

  return (
    <>
      <Breadcrumb crumbs={[{ label: t.breadcrumbHome, to: '/' }, { label: t.uploadTitle }]} />
      <div className="max-w-lg mt-6">
        <h1 className="text-2xl font-bold text-[var(--text)] mb-6">{t.uploadTitle}</h1>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {error && <p role="alert" className="text-sm text-red-500 bg-red-50 p-3 rounded border border-red-200">{error}</p>}

          {/* Drop zone */}
          <div
            onDrop={handleDrop} onDragOver={e => e.preventDefault()}
            onClick={() => fileRef.current?.click()}
            role="button" tabIndex={0} aria-label={t.uploadDragLabel}
            onKeyDown={e => e.key === 'Enter' && fileRef.current?.click()}
            className="border-2 border-dashed border-[var(--accent)] rounded-lg p-8 text-center cursor-pointer hover:bg-[var(--surface)] transition-colors"
          >
            {preview
              ? <img src={preview} alt={t.uploadPreview} className="max-h-40 mx-auto rounded" />
              : <div className="space-y-2">
                  <p className="text-3xl" aria-hidden="true">📷</p>
                  <p className="text-sm font-medium text-[var(--accent)]">{t.uploadDrop}</p>
                  <p className="text-xs text-[var(--text-muted)]">{t.uploadHint}</p>
                </div>
            }
            <input ref={fileRef} type="file" accept="image/*" className="sr-only"
              onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
          </div>

          <Input label={t.titleLabel} value={title} onChange={e => setTitle(e.target.value)} required />

          <div className="flex flex-col gap-1">
            <label htmlFor="description" className="text-sm font-medium text-[var(--text)]">
              {t.descriptionLabel} <span className="text-red-500" aria-label="wymagane">*</span>
            </label>
            <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} required rows={3}
              className="rounded border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm px-3 py-2 focus:border-[var(--accent)] focus:outline-none resize-none" />
          </div>

          <Input label={t.altTextLabel} value={altText} onChange={e => setAltText(e.target.value)} required />
          <Input label={t.photoDateLabel} value={photoDate} onChange={e => setPhotoDate(e.target.value)} required placeholder={t.photoDatePlaceholder} />

          {/* Location */}
          <div className="flex flex-col gap-1">
            <label htmlFor="continent-sel" className="text-sm font-medium text-[var(--text)]">{t.continent}</label>
            <select id="continent-sel" value={continent} onChange={e => setContinent(e.target.value)} className={selectClass}>
              <option value="">{t.allContinents}</option>
              {CONTINENTS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <Input
            label={t.countryLabel}
            value={country}
            onChange={e => setCountry(e.target.value)}
            placeholder={t.countryPlaceholder}
          />

          <Input
            label={t.city}
            value={city}
            onChange={e => setCity(e.target.value)}
            placeholder={t.cityPlaceholder}
          />

          <Input label={t.tagsLabel} value={tags} onChange={e => setTags(e.target.value)} placeholder={t.tagsPlaceholder} />

          <Button type="submit" disabled={loading} className="w-full justify-center">
            {loading ? t.uploading : t.submit}
          </Button>
        </form>
      </div>
    </>
  )
}
