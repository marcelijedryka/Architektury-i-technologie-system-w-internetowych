import { useState } from 'react'
import { CONTINENTS } from '../../constants/continents'
import { useLang } from '../../context/LangContext'

interface Props {
  onLocationChange: (ids: { continent?: string; country?: string; city?: string }) => void
}

export function HierarchyDropdowns({ onLocationChange }: Props) {
  const { t } = useLang()
  const [continent, setContinent] = useState('')
  const [country, setCountry] = useState('')
  const [city, setCity] = useState('')

  const handleContinent = (val: string) => {
    setContinent(val)
    onLocationChange({ continent: val || undefined, country: country || undefined, city: city || undefined })
  }

  const handleCountry = (val: string) => {
    setCountry(val)
    onLocationChange({ continent: continent || undefined, country: val || undefined, city: city || undefined })
  }

  const handleCity = (val: string) => {
    setCity(val)
    onLocationChange({ continent: continent || undefined, country: country || undefined, city: val || undefined })
  }

  const selectClass = 'rounded border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm px-3 py-2 focus:border-[var(--accent)] focus:outline-none'
  const inputClass = `${selectClass} min-w-[140px]`

  return (
    <>
      <div className="flex flex-col gap-1">
        <label htmlFor="continent-filter" className="text-xs text-[var(--text-muted)]">{t.continent}</label>
        <select id="continent-filter" value={continent} onChange={e => handleContinent(e.target.value)} className={selectClass}>
          <option value="">{t.allContinents}</option>
          {CONTINENTS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="country-filter" className="text-xs text-[var(--text-muted)]">{t.countryLabel}</label>
        <input
          id="country-filter"
          type="text"
          value={country}
          onChange={e => handleCountry(e.target.value)}
          placeholder={t.countryPlaceholder}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="city-filter" className="text-xs text-[var(--text-muted)]">{t.city}</label>
        <input
          id="city-filter"
          type="text"
          value={city}
          onChange={e => handleCity(e.target.value)}
          placeholder={t.cityPlaceholder}
          className={inputClass}
        />
      </div>
    </>
  )
}
