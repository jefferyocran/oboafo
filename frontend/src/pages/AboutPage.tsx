import { Link } from 'react-router-dom'
import { T } from '../theme'
import { Disclaimer } from '../components/Disclaimer'

export function AboutPage() {
  return (
    <div style={{ background: T.bg, minHeight: '100%' }}>
      <div
        style={{
          maxWidth: 720,
          margin: '0 auto',
          padding: `${T.sp(5)} 20px ${T.sp(10)}`,
        }}
      >
        <Link
          to="/"
          style={{
            fontFamily: T.fontBody,
            fontSize: T.small.size,
            color: T.primaryLight,
            display: 'inline-block',
            marginBottom: T.sp(2),
          }}
        >
          ← Home
        </Link>

        <h1
          style={{
            fontFamily: T.fontDisplay,
            fontSize: T.h1.size,
            fontWeight: T.h1.weight,
            lineHeight: T.h1.lh,
            color: T.primary,
            margin: `0 0 ${T.sp(2)}`,
          }}
        >
          About Oboafo
        </h1>

        <p
          style={{
            fontFamily: T.fontBody,
            fontSize: T.bodyLg.size,
            lineHeight: T.bodyLg.lh,
            color: T.textSecondary,
            margin: `0 0 ${T.sp(3)}`,
          }}
        >
          Oboafo is a civic rights education tool for everyday Ghanaians. We help you understand what the{' '}
          <strong style={{ color: T.text }}>1992 Constitution</strong> and related frameworks say — in plain language
          and, where available, in languages you speak at home.
        </p>

        <p
          style={{
            fontFamily: T.fontBody,
            fontSize: T.body.size,
            lineHeight: T.body.lh,
            color: T.textSecondary,
            margin: `0 0 ${T.sp(3)}`,
          }}
        >
          The assistant uses retrieval over constitutional text to ground answers. It is meant to inform and empower,
          not to replace a lawyer, the courts, or official institutions.
        </p>

        <div style={{ margin: `${T.sp(4)} 0` }}>
          <Disclaimer />
        </div>

        <section
          style={{
            background: T.disclaimerBg,
            borderRadius: T.rMd,
            border: `1px solid ${T.border}`,
            padding: T.sp(3),
            marginBottom: T.sp(3),
          }}
        >
          <h2
            style={{
              fontFamily: T.fontDisplay,
              fontSize: T.h3.size,
              fontWeight: 600,
              color: T.primary,
              margin: `0 0 ${T.sp(1)}`,
            }}
          >
            Need representation?
          </h2>
          <p
            style={{
              fontFamily: T.fontBody,
              fontSize: T.body.size,
              lineHeight: T.body.lh,
              color: T.textSecondary,
              margin: 0,
            }}
          >
            Contact the{' '}
            <a
              href="https://legalaid.gov.gh/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: T.primary, fontWeight: 600 }}
            >
              Legal Aid Commission of Ghana
            </a>
            : toll-free{' '}
            <a href="tel:0800100060" style={{ color: T.primary, fontWeight: 600 }}>
              0800-100-060
            </a>
            .
          </p>
        </section>

        <p style={{ fontFamily: T.fontBody, fontSize: T.small.size, color: T.textMuted, margin: 0 }}>
          <Link to="/learn" style={{ color: T.primaryLight, fontWeight: 600 }}>
            Browse topics
          </Link>
          {' · '}
          <Link to="/ask" style={{ color: T.primaryLight, fontWeight: 600 }}>
            Ask a question
          </Link>
          {' · '}
          <Link to="/crisis" style={{ color: T.primaryLight, fontWeight: 600 }}>
            Crisis help
          </Link>
        </p>
      </div>
    </div>
  )
}
