import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import { translations } from '../translations'
import type { Lang, T } from '../translations'

interface LangContextValue {
  lang: Lang
  t: T
  setLang: (l: Lang) => void
}

const LangContext = createContext<LangContextValue>({
  lang: 'pl',
  t: translations.pl,
  setLang: () => {},
})

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(
    () => (localStorage.getItem('lang') as Lang) ?? 'pl'
  )

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem('lang', l)
  }

  return (
    <LangContext.Provider value={{ lang, t: translations[lang], setLang }}>
      {children}
    </LangContext.Provider>
  )
}

export const useLang = () => useContext(LangContext)
