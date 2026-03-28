import type { Language } from '../types'
import { LANGUAGE_LABELS, LANGUAGES } from '../types'
import { T } from '../theme'

interface LanguageSelectorProps {
  language: Language
  onChange: (lang: Language) => void
  variant?: 'pills' | 'select'
  id?: string
  labelId?: string
}

export function LanguageSelector({
  language,
  onChange,
  variant = 'pills',
  id,
  labelId,
}: LanguageSelectorProps) {
  if (variant === 'select') {
    return (
      <select
        id={id}
        aria-labelledby={labelId}
        aria-label="Interface language"
        value={language}
        onChange={(e) => onChange(e.target.value as Language)}
        style={{
          minHeight: 48,
          padding: '0 14px',
          borderRadius: T.rFull,
          border: `1px solid ${T.border}`,
          background: T.surface,
          color: T.text,
          fontFamily: T.fontBody,
          fontSize: T.small.size,
          fontWeight: 500,
          cursor: 'pointer',
          boxShadow: T.shadowCard,
        }}
      >
        {LANGUAGES.map((lang) => (
          <option key={lang} value={lang}>
            {LANGUAGE_LABELS[lang]}
          </option>
        ))}
      </select>
    )
  }

  return (
    <div
      role="group"
      aria-label="Interface language"
      style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}
    >
      {LANGUAGES.map((lang) => {
        const active = language === lang
        return (
          <button
            key={lang}
            type="button"
            onClick={() => onChange(lang)}
            style={{
              minHeight: 48,
              padding: '0 14px',
              borderRadius: T.rFull,
              border: `2px solid ${active ? T.accent : T.border}`,
              background: active ? T.goldDim : T.surface,
              color: active ? T.primary : T.textSecondary,
              fontFamily: T.fontBody,
              fontSize: T.small.size,
              fontWeight: active ? 600 : 400,
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
