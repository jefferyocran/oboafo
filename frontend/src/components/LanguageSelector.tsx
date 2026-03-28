import type { Language } from '../types'
import { LANGUAGE_LABELS } from '../types'

interface LanguageSelectorProps {
  language: Language
  onChange: (lang: Language) => void
}

const LANGUAGES: Language[] = ['en', 'tw', 'ee', 'ga']

export function LanguageSelector({ language, onChange }: LanguageSelectorProps) {
  return (
    <div style={{ display: 'flex', gap: '6px' }}>
      {LANGUAGES.map((lang) => (
        <button
          key={lang}
          onClick={() => onChange(lang)}
          style={{
            padding: '4px 10px',
            borderRadius: '999px',
            border: '1px solid',
            borderColor: language === lang ? '#d4a843' : '#374151',
            background: language === lang ? '#d4a843' : 'transparent',
            color: language === lang ? '#0d1117' : '#9ca3af',
            fontSize: '0.8rem',
            fontWeight: language === lang ? 700 : 400,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          {LANGUAGE_LABELS[lang]}
        </button>
      ))}
    </div>
  )
}
