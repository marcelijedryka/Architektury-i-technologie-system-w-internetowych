import { useState, useEffect } from 'react'
import { hierarchyApi } from '../../api/hierarchy'
import client from '../../api/client'
import { useLang } from '../../context/LangContext'

export default function AdminHierarchyPage() {
  const { t } = useLang()
  const [continents, setContinents] = useState<any[]>([])
  const [regions, setRegions] = useState<any[]>([])
  const [cities, setCities] = useState<any[]>([])
  const [selectedContinent, setSelectedContinent] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('')

  const [newContinent, setNewContinent] = useState('')
  const [newRegion, setNewRegion] = useState('')
  const [newCity, setNewCity] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    hierarchyApi.continents().then(setContinents).catch(() => setError('Failed to load continents'))
  }, [])

  useEffect(() => {
    if (selectedContinent) hierarchyApi.regions(selectedContinent).then(setRegions)
    else setRegions([])
    setSelectedRegion('')
    setCities([])
  }, [selectedContinent])

  useEffect(() => {
    if (selectedRegion) hierarchyApi.cities(selectedRegion).then(setCities)
    else setCities([])
  }, [selectedRegion])

  const addContinent = async () => {
    const name = newContinent.trim()
    if (!name) return
    setError('')
    try {
      const res = await client.post('/hierarchy/continents', { name })
      setContinents(prev => [...prev, res.data])
      setNewContinent('')
    } catch {
      setError('Could not create continent — check you are logged in as ADMIN')
    }
  }

  const addRegion = async () => {
    const name = newRegion.trim()
    if (!name || !selectedContinent) return
    setError('')
    try {
      const res = await client.post(`/hierarchy/continents/${selectedContinent}/regions`, { name })
      setRegions(prev => [...prev, res.data])
      setNewRegion('')
    } catch {
      setError('Could not create region')
    }
  }

  const addCity = async () => {
    const name = newCity.trim()
    if (!name || !selectedRegion) return
    setError('')
    try {
      const res = await client.post(`/hierarchy/regions/${selectedRegion}/cities`, { name })
      setCities(prev => [...prev, res.data])
      setNewCity('')
    } catch {
      setError('Could not create city')
    }
  }

  const selectClass = 'rounded border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm px-3 py-2 focus:border-[var(--accent)] focus:outline-none w-full'
  const inputClass = 'rounded border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm px-3 py-2 focus:border-[var(--accent)] focus:outline-none flex-1'
  const btnClass = 'px-3 py-2 rounded bg-[var(--accent)] text-[var(--on-accent)] text-sm hover:opacity-90 shrink-0'

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-bold text-[var(--text)]">{t.adminHierarchy}</h1>

      {error && (
        <p role="alert" className="text-sm text-red-500 bg-red-50 p-3 rounded border border-red-200">{error}</p>
      )}

      {/* Continents */}
      <section className="space-y-3">
        <h2 className="font-semibold text-[var(--text)]">{t.continent}</h2>
        <div className="flex gap-2">
          <input
            value={newContinent}
            onChange={e => setNewContinent(e.target.value)}
            placeholder={t.addContinent}
            className={inputClass}
            onKeyDown={e => e.key === 'Enter' && addContinent()}
          />
          <button onClick={addContinent} className={btnClass}>+ {t.addContinent}</button>
        </div>
        <ul className="text-sm space-y-1">
          {continents.map(c => (
            <li key={c.continentId} className="flex items-center gap-2 text-[var(--text)]">
              <span className="text-[var(--text-muted)]">•</span> {c.name}
            </li>
          ))}
          {continents.length === 0 && (
            <li className="text-[var(--text-muted)] text-xs italic">No continents yet</li>
          )}
        </ul>
      </section>

      {/* Regions / Countries */}
      <section className="space-y-3">
        <h2 className="font-semibold text-[var(--text)]">{t.region}</h2>
        <select value={selectedContinent} onChange={e => setSelectedContinent(e.target.value)} className={selectClass}>
          <option value="">{t.chooseContinent}</option>
          {continents.map(c => <option key={c.continentId} value={c.continentId}>{c.name}</option>)}
        </select>
        {selectedContinent && (
          <>
            <div className="flex gap-2">
              <input
                value={newRegion}
                onChange={e => setNewRegion(e.target.value)}
                placeholder={t.addRegion}
                className={inputClass}
                onKeyDown={e => e.key === 'Enter' && addRegion()}
              />
              <button onClick={addRegion} className={btnClass}>+ {t.addRegion}</button>
            </div>
            <ul className="text-sm space-y-1">
              {regions.map(r => (
                <li key={r.regionId} className="flex items-center gap-2 text-[var(--text)]">
                  <span className="text-[var(--text-muted)]">•</span> {r.name}
                </li>
              ))}
              {regions.length === 0 && (
                <li className="text-[var(--text-muted)] text-xs italic">No regions yet</li>
              )}
            </ul>
          </>
        )}
      </section>

      {/* Cities */}
      <section className="space-y-3">
        <h2 className="font-semibold text-[var(--text)]">{t.city}</h2>
        <select
          value={selectedRegion}
          onChange={e => setSelectedRegion(e.target.value)}
          className={selectClass}
          disabled={regions.length === 0}
        >
          <option value="">{t.chooseRegion}</option>
          {regions.map(r => <option key={r.regionId} value={r.regionId}>{r.name}</option>)}
        </select>
        {selectedRegion && (
          <>
            <div className="flex gap-2">
              <input
                value={newCity}
                onChange={e => setNewCity(e.target.value)}
                placeholder={t.addCity}
                className={inputClass}
                onKeyDown={e => e.key === 'Enter' && addCity()}
              />
              <button onClick={addCity} className={btnClass}>+ {t.addCity}</button>
            </div>
            <ul className="text-sm space-y-1">
              {cities.map(c => (
                <li key={c.cityId} className="flex items-center gap-2 text-[var(--text)]">
                  <span className="text-[var(--text-muted)]">•</span> {c.name}
                </li>
              ))}
              {cities.length === 0 && (
                <li className="text-[var(--text-muted)] text-xs italic">No cities yet</li>
              )}
            </ul>
          </>
        )}
      </section>
    </div>
  )
}
