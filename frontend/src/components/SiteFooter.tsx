import { Link } from 'react-router-dom'
import { OboafoLogo } from './OboafoLogo'
import { LanguageSelector } from './LanguageSelector'
import { useLanguage } from '../context/LanguageContext'
import { T } from '../theme'

export function SiteFooter() {
  const { language, setLanguage } = useLanguage()

  return (
    <footer
      style={{
        borderTop: `1px solid ${T.border}`,
        background: T.surface,
        marginTop: 'auto',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: `${T.sp(5)} 20px ${T.sp(10)}`,
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: T.sp(4),
            marginBottom: T.sp(4),
          }}
        >
          <div>
            <OboafoLogo size="sm" />
            <p
              style={{
                marginTop: T.sp(1),
                fontFamily: T.fontBody,
                fontSize: T.small.size,
                color: T.textSecondary,
                lineHeight: T.small.lh,
              }}
            >
              Know your rights. In your language.
            </p>
          </div>
          <div>
            <p
              style={{
                fontFamily: T.fontDisplay,
                fontWeight: 600,
                fontSize: T.caption.size,
                color: T.primary,
                marginBottom: T.sp(1),
              }}
            >
              Explore
            </p>
            <ul style={{ listStyle: 'none', display: 'grid', gap: 8 }}>
              {(
                [
                  { kind: 'in' as const, to: '/learn', label: 'Learn' },
                  { kind: 'in' as const, to: '/ask', label: 'Ask Oboafo' },
                  { kind: 'in' as const, to: '/crisis', label: 'Crisis help' },
                  { kind: 'in' as const, to: '/1992-constitution-of-ghana.pdf', label: '1992 Constitution (PDF)' },
                  {
                    kind: 'out' as const,
                    href: 'https://legalaid.gov.gh/',
                    label: 'Legal Aid Commission',
                  },
                ] as const
              ).map((item) => (
                <li key={item.label}>
                  {item.kind === 'in' ? (
                    <Link
                      to={item.to}
                      style={{
                        fontFamily: T.fontBody,
                        fontSize: T.small.size,
                        color: T.textSecondary,
                      }}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontFamily: T.fontBody,
                        fontSize: T.small.size,
                        color: T.textSecondary,
                      }}
                    >
                      {item.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p
              style={{
                fontFamily: T.fontDisplay,
                fontWeight: 600,
                fontSize: T.caption.size,
                color: T.primary,
                marginBottom: T.sp(1),
              }}
            >
              Language
            </p>
            <LanguageSelector language={language} onChange={setLanguage} variant="pills" />
          </div>
        </div>
        <div
          style={{
            borderTop: `1px solid ${T.border}`,
            paddingTop: T.sp(3),
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: T.sp(2),
            fontFamily: T.fontBody,
            fontSize: T.caption.size,
            color: T.textMuted,
          }}
        >
          <span>Built for Ghana</span>
          <span aria-hidden>·</span>
          <span role="img" aria-label="Ghana flag">
            🇬🇭
          </span>
          <span style={{ marginLeft: 'auto' }}>© {new Date().getFullYear()} Oboafo</span>
        </div>
      </div>
    </footer>
  )
}
