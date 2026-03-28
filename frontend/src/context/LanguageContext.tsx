import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Language } from '../types'

const STORAGE_KEY = 'oboafo-language-v1'

function readStoredLanguage(): Language | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    if (raw === 'en' || raw === 'tw' || raw === 'ee' || raw === 'ga' || raw === 'dag') return raw
  } catch {
    /* ignore */
  }
  return null
}

interface LanguageContextValue {
  language: Language
  setLanguage: (lang: Language) => void
}

const LanguageContext = createContext<LanguageContextValue>({
  language: 'en',
  setLanguage: () => {},
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => readStoredLanguage() ?? 'en')

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, language)
    } catch {
      /* ignore */
    }
  }, [language])

  function setLanguage(lang: Language) {
    setLanguageState(lang)
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
