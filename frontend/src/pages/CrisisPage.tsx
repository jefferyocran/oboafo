import { Link } from 'react-router-dom'
import { CrisisButtons } from '../components/CrisisButtons'
import { useLanguage } from '../context/LanguageContext'
import { LanguageSelector } from '../components/LanguageSelector'
import { T } from '../theme'

export function CrisisPage() {
  const { language, setLanguage } = useLanguage()

  return (
    <div style={{ background: T.bg, minHeight: '100%' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: `${T.sp(4)} 20px ${T.sp(8)}` }}>
        <Link
          to="/"
          style={{
            fontFamily: T.fontBody,
            fontSize: T.small.size,
            color: T.primaryLight,
            marginBottom: T.sp(2),
            display: 'inline-block',
          }}
        >
          ← Home
        </Link>
        <div
          style={{
            padding: T.sp(3),
            background: T.redDim,
            border: `1px solid ${T.red}`,
            borderRadius: T.rMd,
            marginBottom: T.sp(3),
          }}
        >
          <h1
            style={{
              margin: `0 0 ${T.sp(1)}`,
              fontSize: T.h2.size,
              fontFamily: T.fontDisplay,
              fontWeight: 700,
              color: T.red,
            }}
          >
            Crisis help
          </h1>
          <p style={{ margin: 0, fontFamily: T.fontBody, fontSize: T.body.size, color: T.textSecondary, lineHeight: T.body.lh }}>
            Quick rights reminders — works offline. Not a substitute for a lawyer or emergency services.
          </p>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              marginTop: T.sp(2),
              padding: '6px 12px',
              background: T.surface,
              borderRadius: T.rFull,
              fontFamily: T.fontBody,
              fontSize: T.caption.size,
              fontWeight: 600,
              color: T.success,
              border: `1px solid ${T.success}`,
            }}
          >
            ✓ No internet required
          </div>
        </div>

        <div style={{ marginBottom: T.sp(2) }}>
          <p
            style={{
              fontFamily: T.fontBody,
              fontSize: T.caption.size,
              fontWeight: 600,
              color: T.textMuted,
              margin: `0 0 ${T.sp(1)}`,
            }}
          >
            Language
          </p>
          <LanguageSelector language={language} onChange={setLanguage} variant="pills" />
        </div>

        <CrisisButtons language={language} />

        <div
          style={{
            marginTop: T.sp(4),
            padding: T.sp(3),
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: T.rMd,
            boxShadow: T.shadowCard,
          }}
        >
          <p style={{ margin: '0 0 8px', color: T.text, fontSize: T.small.size, fontWeight: 600, fontFamily: T.fontBody }}>
            Emergency contacts
          </p>
          {[
            { name: 'Ghana Police Service', phone: '191' },
            { name: 'Ambulance Service', phone: '193' },
            { name: 'Legal Aid Commission (toll-free)', phone: '0800-100-060' },
            { name: 'CHRAJ (Human Rights)', phone: '0302-662-504' },
          ].map((c) => (
            <a
              key={c.phone}
              href={`tel:${c.phone.replace(/\D/g, '')}`}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 14px',
                marginBottom: 8,
                background: T.bg,
                border: `1px solid ${T.border}`,
                borderRadius: T.rSm,
                textDecoration: 'none',
                color: T.text,
                fontFamily: T.fontBody,
                fontSize: T.small.size,
                minHeight: 48,
              }}
            >
              <span>{c.name}</span>
              <span style={{ color: T.primaryLight, fontWeight: 700 }}>{c.phone}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
