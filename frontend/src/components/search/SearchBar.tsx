import { useState } from 'react'
import { useLang } from '../../context/LangContext'

interface Props {
  onSearch: (params: { phrase?: string; dateFrom?: string; dateTo?: string }) => void
}

export function SearchBar({ onSearch }: Props) {
  const { t } = useLang()
  const [phrase, setPhrase] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const inputClass = 'rounded border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm px-3 py-2 focus:border-[var(--accent)] focus:outline-none'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch({ phrase: phrase || undefined, dateFrom: dateFrom || undefined, dateTo: dateTo || undefined })
  }

  return (
    <form onSubmit={handleSubmit} role="search" className="flex flex-wrap gap-2 items-end">
      <div className="flex flex-col gap-1">
        <label htmlFor="phrase" className="text-xs text-[var(--text-muted)]">{t.searchPlaceholder}</label>
        <input id="phrase" type="search" value={phrase} onChange={e => setPhrase(e.target.value)}
          placeholder={t.searchPlaceholder} className={`${inputClass} min-w-[200px]`} />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="dateFrom" className="text-xs text-[var(--text-muted)]">{t.dateFrom}</label>
        <input id="dateFrom" type="text" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
          placeholder="1900" className={`${inputClass} w-24`} />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="dateTo" className="text-xs text-[var(--text-muted)]">{t.dateTo}</label>
        <input id="dateTo" type="text" value={dateTo} onChange={e => setDateTo(e.target.value)}
          placeholder="2000" className={`${inputClass} w-24`} />
      </div>
      <button type="submit" className="px-4 py-2 rounded bg-[var(--accent)] text-white text-sm hover:opacity-90">
        {t.search}
      </button>
    </form>
  )
}
