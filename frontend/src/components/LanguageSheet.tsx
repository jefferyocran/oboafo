import { LanguageSelector } from './LanguageSelector'
import { useLanguage } from '../context/LanguageContext'
import { T } from '../theme'

interface LanguageSheetProps {
  onClose: () => void
}

export function LanguageSheet({ onClose }: LanguageSheetProps) {
  const { language, setLanguage } = useLanguage()

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lang-sheet-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(0,0,0,0.35)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 480,
          background: T.surface,
          borderTopLeftRadius: T.rLg,
          borderTopRightRadius: T.rLg,
          padding: T.sp(3),
          boxShadow: T.shadowModal,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: T.sp(2) }}>
          <h2
            id="lang-sheet-title"
            style={{
              fontFamily: T.fontDisplay,
              fontSize: T.h3.size,
              fontWeight: 600,
              color: T.primary,
              margin: 0,
            }}
          >
            Language
          </h2>
          <button
            type="button"
            onClick={onClose}
            style={{
              minWidth: 48,
              minHeight: 48,
              borderRadius: T.rFull,
              border: `1px solid ${T.border}`,
              background: T.bg,
              cursor: 'pointer',
              fontFamily: T.fontBody,
              fontSize: T.body.size,
            }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <LanguageSelector
          language={language}
          onChange={(lang) => {
            setLanguage(lang)
            onClose()
          }}
          variant="pills"
        />
      </div>
    </div>
  )
}
