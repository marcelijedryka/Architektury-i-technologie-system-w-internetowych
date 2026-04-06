import { useState, useEffect } from 'react'
import { materialsApi } from '../api/materials'
import type { Material, SearchFilters } from '../api/materials'
import { Breadcrumb } from '../components/layout/Breadcrumb'
import { HierarchyDropdowns } from '../components/search/HierarchyDropdowns'
import { SearchBar } from '../components/search/SearchBar'
import { FilterChips } from '../components/search/FilterChips'
import { PhotoGrid } from '../components/photos/PhotoGrid'
import { PhotoDetail } from '../components/photos/PhotoDetail'
import { useLang } from '../context/LangContext'

type SortMode = 'latest' | 'popular'

export default function HomePage() {
  const { t } = useLang()
  const [filters, setFilters] = useState<SearchFilters>({})
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Material | null>(null)
  const [sort, setSort] = useState<SortMode>('latest')
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    setLoading(true)
    Promise.all([
      materialsApi.search(filters),
      materialsApi.myLikedIds().catch(() => [] as string[]),
    ]).then(([mats, liked]) => {
      setMaterials(mats)
      setLikedIds(new Set(liked))
    }).finally(() => setLoading(false))
  }, [filters])

  const sorted = [...materials].sort((a, b) => {
    if (sort === 'popular') return (b.likeCount ?? 0) - (a.likeCount ?? 0)
    return b.uploadedAt.localeCompare(a.uploadedAt)
  })

  const handleLike = async (id: string) => {
    const result = await materialsApi.toggleLike(id)
    setLikedIds(prev => {
      const next = new Set(prev)
      result.liked ? next.add(id) : next.delete(id)
      return next
    })
    setMaterials(prev =>
      prev.map(m => m.materialId === id ? { ...m, likeCount: result.likeCount } : m)
    )
    if (selected?.materialId === id) {
      setSelected(s => s ? { ...s, likeCount: result.likeCount } : s)
    }
  }

  const activeChips = [
    filters.continent && { key: 'continent', label: `${t.chipContinent}: ${filters.continent}` },
    filters.country && { key: 'country', label: `${t.countryLabel}: ${filters.country}` },
    filters.city && { key: 'city', label: `${t.chipCity}: ${filters.city}` },
    filters.phrase && { key: 'phrase', label: `${t.chipPhrase}: ${filters.phrase}` },
    filters.dateFrom && { key: 'dateFrom', label: `${t.chipFrom}: ${filters.dateFrom}` },
    filters.dateTo && { key: 'dateTo', label: `${t.chipTo}: ${filters.dateTo}` },
  ].filter(Boolean) as { key: string; label: string }[]

  const removeFilter = (key: string) => setFilters(f => { const n = { ...f }; delete n[key as keyof SearchFilters]; return n })
  const clearAll = () => setFilters({})

  return (
    <>
      <Breadcrumb crumbs={[
        { label: t.breadcrumbHome, to: '/' },
        ...(filters.country ? [{ label: filters.country }] : []),
        ...(filters.city ? [{ label: filters.city }] : []),
      ]} />

      <div className="mt-4 space-y-4">
        <HierarchyDropdowns onLocationChange={loc => setFilters(f => ({ ...f, ...loc }))} />
        <SearchBar onSearch={params => setFilters(f => ({ ...f, ...params }))} />
        <FilterChips chips={activeChips} onRemove={removeFilter} />
      </div>

      {/* Sort toggle */}
      <div className="mt-5 flex items-center gap-2" role="group" aria-label={t.sortBy}>
        <span className="text-xs text-[var(--text-muted)]">{t.sortBy}</span>
        {(['latest', 'popular'] as SortMode[]).map(mode => (
          <button
            key={mode}
            onClick={() => setSort(mode)}
            aria-pressed={sort === mode}
            className={`px-3 py-1 rounded-full text-xs border transition-colors
              ${sort === mode
                ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                : 'bg-[var(--surface)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--accent)]'
              }`}
          >
            {mode === 'latest' ? t.latest : t.popular}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <PhotoGrid
          materials={sorted}
          onSelect={setSelected}
          onClearFilters={clearAll}
          loading={loading}
          likedIds={likedIds}
          onLike={handleLike}
        />
      </div>

      {selected && (
        <PhotoDetail
          material={selected}
          onClose={() => setSelected(null)}
          isLiked={likedIds.has(selected.materialId)}
          onLike={handleLike}
        />
      )}
    </>
  )
}
