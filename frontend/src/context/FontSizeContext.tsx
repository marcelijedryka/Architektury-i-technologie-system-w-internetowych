import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'

export type FontSize = 'small' | 'normal' | 'large'

const SIZES: Record<FontSize, string> = {
  small: '14px',
  normal: '16px',
  large: '19px',
}

interface FontSizeContextValue {
  fontSize: FontSize
  setFontSize: (s: FontSize) => void
}

const FontSizeContext = createContext<FontSizeContextValue>({
  fontSize: 'normal',
  setFontSize: () => {},
})

export function FontSizeProvider({ children }: { children: ReactNode }) {
  const [fontSize, setFontSizeState] = useState<FontSize>(
    () => (localStorage.getItem('fontSize') as FontSize) ?? 'normal'
  )

  useEffect(() => {
    document.documentElement.style.fontSize = SIZES[fontSize]
  }, [fontSize])

  const setFontSize = (s: FontSize) => {
    setFontSizeState(s)
    localStorage.setItem('fontSize', s)
    document.documentElement.style.fontSize = SIZES[s]
  }

  return (
    <FontSizeContext.Provider value={{ fontSize, setFontSize }}>
      {children}
    </FontSizeContext.Provider>
  )
}

export const useFontSize = () => useContext(FontSizeContext)
