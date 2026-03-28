import { CrisisButtons } from '../components/CrisisButtons'
import { useLanguage } from '../context/LanguageContext'
import { T } from '../theme'

export function CrisisPage() {
  const { language } = useLanguage()

  return (
    <div style={{ overflowY: 'auto', height: '100%' }}>
      <div style={{
        padding: '16px',
        background: `linear-gradient(160deg, #1a0505 0%, #0a0e1a 100%)`,
        borderBottom: `1px solid ${T.redBorder}`,
      }}>
        <h2 style={{ margin: '0 0 4px', fontSize: '1.15rem', fontWeight: 800, color: T.red }}>
          🆘 Crisis Mode
        </h2>
        <p style={{ margin: 0, fontSize: '0.82rem', color: T.text2, lineHeight: 1.5 }}>
          Instant rights guidance — works offline, no internet needed.
        </p>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          marginTop: '10px',
          padding: '5px 10px',
          background: T.greenDim,
          border: `1px solid ${T.green}`,
          borderRadius: T.rFull,
          fontSize: '0.72rem',
          color: T.green,
          fontWeight: 700,
        }}>
          ✓ No internet required
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        <CrisisButtons language={language} />

        <div style={{
          marginTop: '20px',
          padding: '12px 14px',
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: T.r,
        }}>
          <p style={{ margin: '0 0 6px', color: T.text2, fontSize: '0.82rem', fontWeight: 600 }}>
            Emergency Contacts
          </p>
          {[
            { name: 'Ghana Police Service',          phone: '191' },
            { name: 'Ambulance Service',              phone: '193' },
            { name: 'Legal Aid Commission (toll-free)',phone: '0800-100-060' },
            { name: 'CHRAJ (Human Rights)',            phone: '0302-662-504' },
          ].map(c => (
            <a
              key={c.phone}
              href={`tel:${c.phone}`}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '9px 0',
                borderBottom: `1px solid ${T.border}`,
                textDecoration: 'none',
                color: T.text,
                fontSize: '0.85rem',
              }}
            >
              <span style={{ color: T.text2 }}>{c.name}</span>
              <span style={{ color: T.blue, fontWeight: 700 }}>{c.phone}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
