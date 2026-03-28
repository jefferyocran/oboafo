import { Link } from 'react-router-dom'
import type { Topic } from '../types'
import { AudioButton } from './AudioButton'
import { Disclaimer } from './Disclaimer'
import { T } from '../theme'
import { useMediaQuery } from '../hooks/useMediaQuery'

interface TopicPageProps {
  topic: Topic
  onBack: () => void
  onAskAbout: (question: string) => void
  allTopics: Topic[]
}

const SECTION_KEYS = ['know', 'do', 'watchout'] as const
const SECTION_LABELS: Record<(typeof SECTION_KEYS)[number], string> = {
  know: 'What you should know',
  do: 'What you can do',
  watchout: 'Watch out for',
}

export function TopicPage({ topic, onBack, onAskAbout, allTopics }: TopicPageProps) {
  const isDesktop = useMediaQuery('(min-width: 900px)')
  const pageTitle = topic.displayTitle ?? topic.title
  const pageSubtitle = topic.displaySubtitle ?? topic.subtitle

  const fullText = [
    topic.sections.know.points.join('. '),
    topic.sections.do.points.join('. '),
    topic.sections.watchout.points.join('. '),
  ].join('. ')

  const related = allTopics.filter((t) => topic.relatedTopics.includes(t.id))

  const sidebar = (
    <aside
      style={{
        position: isDesktop ? 'sticky' : 'relative',
        top: isDesktop ? 24 : undefined,
        alignSelf: 'start',
      }}
    >
      <div
        style={{
          background: T.surface,
          borderRadius: T.rMd,
          border: `1px solid ${T.border}`,
          boxShadow: T.shadowCard,
          padding: T.sp(3),
        }}
      >
        <h2
          style={{
            fontFamily: T.fontDisplay,
            fontSize: T.h3.size,
            fontWeight: 600,
            color: T.primary,
            margin: `0 0 ${T.sp(2)}`,
          }}
        >
          Key facts
        </h2>
        <ul
          style={{
            margin: `0 0 ${T.sp(3)}`,
            paddingLeft: 18,
            fontFamily: T.fontBody,
            fontSize: T.body.size,
            lineHeight: T.body.lh,
            color: T.textSecondary,
            display: 'grid',
            gap: 8,
          }}
        >
          {topic.keyFacts.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => onAskAbout(topic.suggestedQuestions[0] ?? `Tell me about ${pageTitle}`)}
          style={{
            width: '100%',
            minHeight: 48,
            borderRadius: T.rFull,
            border: 'none',
            background: T.accent,
            color: T.surface,
            fontFamily: T.fontBody,
            fontSize: T.button.size,
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: T.shadowCard,
          }}
        >
          Ask Oboafo about this
        </button>
      </div>
    </aside>
  )

  return (
    <div style={{ background: T.bg, minHeight: '100%' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: `${T.sp(3)} 20px ${T.sp(8)}` }}>
        <nav
          aria-label="Breadcrumb"
          style={{
            fontFamily: T.fontBody,
            fontSize: 13,
            color: T.textMuted,
            marginBottom: T.sp(2),
          }}
        >
          <Link to="/" style={{ color: T.textMuted }}>
            Home
          </Link>
          {' › '}
          <Link to="/learn" style={{ color: T.textMuted }}>
            Learn
          </Link>
          {' › '}
          <span style={{ color: T.textSecondary }}>{pageTitle}</span>
        </nav>

        <button
          type="button"
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: T.primaryLight,
            cursor: 'pointer',
            fontFamily: T.fontBody,
            fontSize: T.small.size,
            marginBottom: T.sp(2),
            padding: 0,
            minHeight: 48,
          }}
        >
          ← Back to topics
        </button>

        <header
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: T.sp(2),
            marginBottom: T.sp(4),
          }}
        >
          <div style={{ display: 'flex', gap: T.sp(2), alignItems: 'flex-start' }}>
            <span style={{ fontSize: '3rem', lineHeight: 1 }} aria-hidden>
              {topic.emoji}
            </span>
            <div>
              <h1
                style={{
                  fontFamily: T.fontDisplay,
                  fontSize: T.h1.size,
                  fontWeight: T.h1.weight,
                  lineHeight: T.h1.lh,
                  color: T.primary,
                  margin: `0 0 ${T.sp(1)}`,
                }}
              >
                {pageTitle}
              </h1>
              <p
                style={{
                  fontFamily: T.fontBody,
                  fontSize: T.bodyLg.size,
                  lineHeight: T.bodyLg.lh,
                  color: T.textSecondary,
                  margin: 0,
                  maxWidth: 560,
                }}
              >
                {pageSubtitle}
              </p>
            </div>
          </div>
          <AudioButton id={`topic-full-${topic.id}`} text={fullText} label="Listen to this page" />
        </header>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            marginBottom: T.sp(4),
          }}
        >
          {topic.articles.map((a) => (
            <span
              key={a}
              style={{
                fontFamily: T.fontBody,
                fontSize: T.caption.size,
                fontWeight: 600,
                padding: '6px 10px',
                borderRadius: T.rSm,
                background: T.goldDim,
                border: `1px solid ${T.accent}`,
                color: T.primary,
              }}
            >
              {a}
            </span>
          ))}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isDesktop ? 'minmax(0, 1fr) 300px' : '1fr',
            gap: T.sp(4),
            alignItems: 'start',
          }}
        >
          <div>
            {SECTION_KEYS.map((key, idx) => {
              const section = topic.sections[key]
              const sectionText = section.points.join('. ')
              return (
                <section
                  key={key}
                  style={{
                    marginBottom: T.sp(4),
                    paddingBottom: T.sp(4),
                    borderBottom: idx < SECTION_KEYS.length - 1 ? `1px solid ${T.border}` : 'none',
                  }}
                >
                  <h2
                    style={{
                      fontFamily: T.fontDisplay,
                      fontSize: T.h2.size,
                      fontWeight: T.h2.weight,
                      lineHeight: T.h2.lh,
                      color: T.primary,
                      borderLeft: `4px solid ${T.primary}`,
                      paddingLeft: 12,
                      margin: `0 0 ${T.sp(2)}`,
                    }}
                  >
                    {SECTION_LABELS[key]}
                  </h2>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: T.sp(1) }}>
                    <AudioButton id={`topic-${topic.id}-${key}`} text={sectionText} size="sm" label="Listen" />
                  </div>
                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: 20,
                      fontFamily: T.fontBody,
                      fontSize: T.bodyLg.size,
                      lineHeight: T.bodyLg.lh,
                      color: T.text,
                      display: 'grid',
                      gap: 10,
                    }}
                  >
                    {section.points.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </section>
              )
            })}

            <div style={{ marginTop: T.sp(4), marginBottom: T.sp(3) }}>
              <Disclaimer />
            </div>

            <section style={{ marginBottom: T.sp(4) }}>
              <h2
                style={{
                  fontFamily: T.fontDisplay,
                  fontSize: T.small.size,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: T.textMuted,
                  margin: `0 0 ${T.sp(1)}`,
                }}
              >
                This information is sourced from
              </h2>
              <ul style={{ margin: 0, paddingLeft: 18, fontFamily: T.fontBody, fontSize: T.small.size, color: T.textSecondary }}>
                {topic.sources.map((s, i) => (
                  <li key={i} style={{ marginBottom: 6 }}>
                    <strong style={{ color: T.text }}>{s.label}</strong> — {s.reference}
                  </li>
                ))}
              </ul>
            </section>

            {related.length > 0 && (
              <section>
                <h2
                  style={{
                    fontFamily: T.fontDisplay,
                    fontSize: T.h3.size,
                    fontWeight: 600,
                    color: T.primary,
                    margin: `0 0 ${T.sp(2)}`,
                  }}
                >
                  You might also want to know about
                </h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: T.sp(2) }}>
                  {related.map((t) => (
                    <Link
                      key={t.id}
                      to={`/topic/${t.id}`}
                      style={{
                        flex: '1 1 200px',
                        minHeight: 48,
                        padding: T.sp(2),
                        background: T.surface,
                        borderRadius: T.rMd,
                        border: `1px solid ${T.border}`,
                        boxShadow: T.shadowCard,
                        textDecoration: 'none',
                        color: T.text,
                        fontFamily: T.fontBody,
                        fontSize: T.small.size,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        transition: T.tx,
                      }}
                    >
                      <span style={{ fontSize: '1.5rem' }}>{t.emoji}</span>
                      <span style={{ fontWeight: 600 }}>{t.title}</span>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {isDesktop && sidebar}
        </div>

        {!isDesktop && <div style={{ marginTop: T.sp(4) }}>{sidebar}</div>}

        <div
          style={{
            marginTop: T.sp(4),
            background: T.disclaimerBg,
            borderRadius: T.rMd,
            padding: T.sp(3),
            border: `1px solid ${T.border}`,
          }}
        >
          <p
            style={{
              fontFamily: T.fontBody,
              fontSize: T.small.size,
              lineHeight: T.small.lh,
              color: T.textSecondary,
              margin: 0,
            }}
          >
            <strong style={{ color: T.text }}>Legal Aid Commission</strong> (toll-free):{' '}
            <a href="tel:0800100060" style={{ color: T.primary, fontWeight: 600 }}>
              0800-100-060
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
