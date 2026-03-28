import type { Language } from '../types'
import { LANGUAGE_LABELS, LANGUAGES } from '../types'
import { T } from '../theme'

interface LanguageSelectorProps {
  language: Language
  onChange: (lang: Language) => void
}

export function LanguageSelector({ language, onChange }: LanguageSelectorProps) {
  return (
    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
      {LANGUAGES.map((lang) => {
        const active = language === lang
        return (
          <button
            key={lang}
            onClick={() => onChange(lang)}
            style={{
              padding: '4px 9px',
              borderRadius: T.rFull,
              border: `1.5px solid ${active ? T.gold : T.border}`,
              background: active ? T.goldDim : 'transparent',
              color: active ? T.gold : T.text3,
              fontSize: '0.75rem',
              fontWeight: active ? 700 : 400,
              cursor: 'pointer',
              transition: T.tx,
              whiteSpace: 'nowrap',
            }}
          >
            {LANGUAGE_LABELS[lang]}
          </button>
        )
      })}
    </div>
  )
}
