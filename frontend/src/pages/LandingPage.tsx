import { Link } from 'react-router-dom'
import { T } from '../theme'
import { LEARN_CATEGORY_TEASERS } from '../data/learnCategories'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { CrisisButtons } from '../components/CrisisButtons'
import { useLanguage } from '../context/LanguageContext'

export function LandingPage() {
  const isOnline = useOnlineStatus()
  const isMobile = useMediaQuery('(max-width: 767px)')
  const { language } = useLanguage()
  const heroSize = isMobile ? 40 : T.hero.size
  const h2Size = isMobile ? 24 : T.h2.size

  return (
    <div style={{ background: T.bg }}>
      {/* Hero */}
      <section
        style={{
          minHeight: isMobile ? 'auto' : 'min(92vh, 900px)',
          maxWidth: 1200,
          margin: '0 auto',
          padding: `${T.sp(4)} 20px ${T.sp(6)}`,
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '3fr 2fr',
          gap: T.sp(5),
          alignItems: 'center',
        }}
        className="oboafo-stagger"
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: T.sp(1),
              marginBottom: T.sp(2),
            }}
          >
            <span
              style={{
                width: 28,
                height: 2,
                background: T.accent,
                borderRadius: 1,
              }}
              aria-hidden
            />
            <span
              style={{
                fontFamily: T.fontBody,
                fontSize: T.caption.size,
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: T.accent,
              }}
            >
              Civic rights education
            </span>
          </div>
          <h1
            style={{
              fontFamily: T.fontDisplay,
              fontSize: heroSize,
              fontWeight: T.hero.weight,
              lineHeight: T.hero.lh,
              color: T.primary,
              margin: `0 0 ${T.sp(2)}`,
            }}
          >
            Know your rights.
            <br />
            In your language.
          </h1>
          <p
            style={{
              fontFamily: T.fontBody,
              fontSize: T.bodyLg.size,
              lineHeight: T.bodyLg.lh,
              color: T.textSecondary,
              maxWidth: 520,
              margin: `0 0 ${T.sp(3)}`,
            }}
          >
            Oboafo helps everyday Ghanaians understand their rights — in Twi, Ga, Ewe, and English.
            Learn at your own pace or ask a question.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: T.sp(2), marginBottom: T.sp(2) }}>
            <Link
              to="/learn"
              style={{
                minHeight: 48,
                padding: '0 24px',
                borderRadius: T.rFull,
                background: T.accent,
                color: T.surface,
                fontFamily: T.fontBody,
                fontSize: T.button.size,
                fontWeight: 600,
                letterSpacing: T.button.ls,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
                boxShadow: T.shadowCard,
              }}
            >
              Start Learning
            </Link>
            <Link
              to="/ask"
              style={{
                minHeight: 48,
                padding: '0 24px',
                borderRadius: T.rFull,
                border: `2px solid ${T.primary}`,
                color: T.primary,
                fontFamily: T.fontBody,
                fontSize: T.button.size,
                fontWeight: 600,
                letterSpacing: T.button.ls,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
                background: T.surface,
              }}
            >
              Ask Oboafo
            </Link>
          </div>
          <p
            style={{
              fontFamily: T.fontBody,
              fontSize: T.small.size,
              color: T.textMuted,
              margin: 0,
            }}
          >
            Not a legal service. An educator. Free to use.
          </p>
          <div
            style={{
              marginTop: T.sp(3),
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 12px',
              borderRadius: T.rFull,
              background: isOnline ? T.greenDim : T.redDim,
              border: `1px solid ${isOnline ? T.success : T.red}`,
              fontFamily: T.fontBody,
              fontSize: T.caption.size,
              fontWeight: 600,
              color: isOnline ? T.success : T.red,
            }}
          >
            <span aria-hidden>●</span>
            {isOnline ? 'Online — full features' : 'Offline — crisis cards still work'}
          </div>
        </div>

        <HeroIllustration isMobile={isMobile} />
      </section>

      {/* Language strip */}
      <section
        style={{
          background: T.languageStripBg,
          borderTop: `1px solid ${T.border}`,
          borderBottom: `1px solid ${T.border}`,
          padding: `${T.sp(2)} 20px`,
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: T.sp(1.5),
            fontFamily: T.fontBody,
            fontSize: T.small.size,
            color: T.textSecondary,
          }}
        >
          <span style={{ fontWeight: 600, color: T.primary }}>Available in:</span>
          {['English', 'Twi', 'Ga', 'Ewe'].map((lang) => (
            <span
              key={lang}
              style={{
                padding: '6px 14px',
                borderRadius: T.rFull,
                background: T.surface,
                border: `1px solid ${T.accent}`,
                color: T.primary,
                fontWeight: 500,
                fontSize: T.caption.size,
              }}
            >
              {lang}
            </span>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: `${T.sp(7)} 20px` }}>
        <h2
          style={{
            fontFamily: T.fontDisplay,
            fontSize: h2Size,
            fontWeight: T.h2.weight,
            lineHeight: T.h2.lh,
            color: T.primary,
            textAlign: 'center',
            margin: `0 0 ${T.sp(5)}`,
          }}
        >
          How Oboafo works
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: T.sp(4),
          }}
        >
          {[
            {
              n: '1',
              title: 'Choose your language',
              desc: 'Pick from five languages so explanations feel natural.',
              icon: '🌐',
            },
            {
              n: '2',
              title: 'Browse your rights',
              desc: 'Explore situations that affect your daily life.',
              icon: '📚',
            },
            {
              n: '3',
              title: 'Ask anything',
              desc: 'Speak or type — get a plain-language answer grounded in Ghanaian law.',
              icon: '💬',
            },
          ].map((step, i) => (
            <div
              key={step.n}
              style={{
                position: 'relative',
                padding: T.sp(3),
                background: T.surface,
                borderRadius: T.rMd,
                boxShadow: T.shadowCard,
                border: `1px solid ${T.border}`,
                animation: `fadeSlideUp 0.5s ease ${0.1 * i}s both`,
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 16,
                  fontFamily: T.fontDisplay,
                  fontSize: 56,
                  fontWeight: 700,
                  color: T.accent,
                  opacity: 0.2,
                  lineHeight: 1,
                }}
                aria-hidden
              >
                {step.n}
              </span>
              <div style={{ fontSize: '2rem', marginBottom: T.sp(1) }}>{step.icon}</div>
              <h3
                style={{
                  fontFamily: T.fontDisplay,
                  fontSize: T.h3.size,
                  fontWeight: 600,
                  color: T.primary,
                  margin: `0 0 ${T.sp(1)}`,
                }}
              >
                {step.title}
              </h3>
              <p
                style={{
                  fontFamily: T.fontBody,
                  fontSize: T.body.size,
                  lineHeight: T.body.lh,
                  color: T.textSecondary,
                  margin: 0,
                }}
              >
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories preview */}
      <section style={{ padding: `0 20px ${T.sp(7)}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2
            style={{
              fontFamily: T.fontDisplay,
              fontSize: h2Size,
              fontWeight: T.h2.weight,
              color: T.primary,
              margin: `0 0 ${T.sp(1)}`,
            }}
          >
            What would you like to understand?
          </h2>
          <p
            style={{
              fontFamily: T.fontBody,
              fontSize: T.body.size,
              color: T.textSecondary,
              margin: `0 0 ${T.sp(3)}`,
            }}
          >
            Pick a situation that applies to you
          </p>
          <div
            style={{
              display: 'flex',
              gap: T.sp(2),
              overflowX: 'auto',
              paddingBottom: T.sp(1),
              scrollSnapType: 'x mandatory',
            }}
          >
            {LEARN_CATEGORY_TEASERS.map((t) => (
              <Link
                key={t.topicId}
                to={`/topic/${t.topicId}`}
                style={{
                  flex: '0 0 260px',
                  scrollSnapAlign: 'start',
                  background: T.surface,
                  borderRadius: T.rMd,
                  padding: T.sp(3),
                  border: `1px solid ${T.border}`,
                  boxShadow: T.shadowCard,
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: T.tx,
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>{t.emoji}</div>
                <div
                  style={{
                    fontFamily: T.fontDisplay,
                    fontWeight: 600,
                    fontSize: T.body.size,
                    color: T.primary,
                    marginBottom: 6,
                  }}
                >
                  {t.learnTitle}
                </div>
                <div
                  style={{
                    fontFamily: T.fontBody,
                    fontSize: T.small.size,
                    color: T.textSecondary,
                    lineHeight: T.small.lh,
                  }}
                >
                  {t.learnDescription}
                </div>
              </Link>
            ))}
            <Link
              to="/learn"
              style={{
                flex: '0 0 140px',
                scrollSnapAlign: 'start',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: T.fontBody,
                fontWeight: 600,
                color: T.primaryLight,
                textDecoration: 'none',
                alignSelf: 'center',
              }}
            >
              See all topics →
            </Link>
          </div>
        </div>
      </section>

      {/* Crisis teaser */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: `0 20px ${T.sp(6)}` }}>
        <div
          style={{
            background: T.surface,
            borderRadius: T.rMd,
            border: `1px solid ${T.border}`,
            padding: T.sp(3),
            boxShadow: T.shadowCard,
          }}
        >
          <h2
            style={{
              fontFamily: T.fontDisplay,
              fontSize: T.h3.size,
              color: T.red,
              margin: `0 0 ${T.sp(2)}`,
            }}
          >
            Need help right now?
          </h2>
          <p
            style={{
              fontFamily: T.fontBody,
              fontSize: T.small.size,
              color: T.textSecondary,
              margin: `0 0 ${T.sp(2)}`,
            }}
          >
            Crisis cards work offline — your rights at a glance.
          </p>
          <CrisisButtons language={language} />
        </div>
      </section>

      {/* Trust */}
      <section
        style={{
          background: T.disclaimerBg,
          borderTop: `1px solid ${T.border}`,
          padding: `${T.sp(6)} 20px`,
        }}
      >
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: T.sp(2) }} aria-hidden>
            ⚖️
          </div>
          <p
            style={{
              fontFamily: T.fontBody,
              fontSize: T.body.size,
              lineHeight: T.body.lh,
              color: T.textSecondary,
              margin: 0,
            }}
          >
            Oboafo is an educational tool, not a law firm. We explain what the law says in plain language so you
            can advocate for yourself. For legal representation, contact the{' '}
            <strong style={{ color: T.text }}>Legal Aid Commission of Ghana</strong>:{' '}
            <a href="tel:0800100060" style={{ color: T.primary, fontWeight: 600 }}>
              0800-100-060
            </a>{' '}
            (toll free).
          </p>
        </div>
      </section>
    </div>
  )
}

function HeroIllustration({ isMobile }: { isMobile: boolean }) {
  return (
    <div style={{ position: 'relative', minHeight: isMobile ? 280 : 360 }}>
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: T.rLg,
          background: `linear-gradient(145deg, rgba(27,67,50,0.12) 0%, rgba(212,160,23,0.15) 100%)`,
          overflow: 'hidden',
        }}
      >
        <svg width="100%" height="100%" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="kente" width="40" height="40" patternUnits="userSpaceOnUse">
              <rect width="40" height="40" fill="rgba(27,67,50,0.06)" />
              <path d="M0 20h40M20 0v40" stroke="rgba(212,160,23,0.25)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="400" height="400" fill="url(#kente)" />
          <circle cx="280" cy="120" r="48" fill="rgba(45,106,79,0.35)" />
          <circle cx="120" cy="260" r="72" fill="rgba(212,160,23,0.2)" />
        </svg>
      </div>
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          padding: T.sp(4),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: isMobile ? 260 : 340,
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: '8%',
            top: '18%',
            width: 100,
            height: 140,
            borderRadius: 24,
            background: T.primaryLight,
            opacity: 0.35,
            transform: 'rotate(-8deg)',
          }}
          aria-hidden
        />
        <div
          style={{
            background: T.surface,
            borderRadius: T.rMd,
            padding: T.sp(2),
            maxWidth: 280,
            boxShadow: T.shadowModal,
            border: `1px solid ${T.border}`,
            marginTop: isMobile ? 0 : 24,
            marginLeft: isMobile ? 0 : 32,
          }}
        >
          <p
            style={{
              fontFamily: T.fontBody,
              fontSize: T.caption.size,
              color: T.textMuted,
              margin: `0 0 ${T.sp(1)}`,
            }}
          >
            Sample (Twi)
          </p>
          <p
            style={{
              fontFamily: T.fontBody,
              fontSize: T.small.size,
              color: T.text,
              lineHeight: 1.5,
              margin: `0 0 ${T.sp(1)}`,
            }}
          >
            “Me landlord no tumi nnhyɛ me efie mu a ɔnnka kyerɛ me ansa?”
          </p>
          <p
            style={{
              fontFamily: T.fontBody,
              fontSize: T.small.size,
              color: T.textSecondary,
              lineHeight: 1.5,
              margin: 0,
              borderLeft: `3px solid ${T.primary}`,
              paddingLeft: 10,
            }}
          >
            Oboafo: W’adwuma no wɔ ho kwan ma w’ani so wɔ ɔman yi mmara mu…
          </p>
        </div>
      </div>
    </div>
  )
}
