import { useState } from 'react'
import type { Topic } from '../types'
import { AudioButton } from './AudioButton'
import { Disclaimer } from './Disclaimer'
import { T } from '../theme'

interface TopicPageProps {
  topic: Topic
  onBack: () => void
  onAskAbout: (question: string) => void
  onRelatedTopic: (id: string) => void
  allTopics: Topic[]
}

const SECTIONS = [
  { key: 'know',     label: '📖 What You Should Know', color: T.blue },
  { key: 'do',       label: '✅ What You Can Do',       color: T.green },
  { key: 'watchout', label: '⚠️ Watch Out For',          color: '#f59e0b' },
] as const

export function TopicPage({ topic, onBack, onAskAbout, onRelatedTopic, allTopics }: TopicPageProps) {
  const [openSection, setOpenSection] = useState<string | null>('know')

  const fullText = [
    topic.sections.know.points.join('. '),
    topic.sections.do.points.join('. '),
    topic.sections.watchout.points.join('. '),
  ].join('. ')

  const related = allTopics.filter(t => topic.relatedTopics.includes(t.id))

  return (
    <div style={{ overflowY: 'auto', height: '100%', background: T.bg }}>
      {/* Hero */}
      <div style={{
        background: `linear-gradient(135deg, ${T.surface} 0%, ${T.surface2} 100%)`,
        borderBottom: `1px solid ${T.border}`,
        padding: '16px',
      }}>
        <button
          onClick={onBack}
          style={{ background: 'none', border: 'none', color: T.text3, cursor: 'pointer', fontSize: '0.82rem', padding: '0 0 12px', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          ← Back
        </button>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span style={{ fontSize: '2rem' }}>{topic.emoji}</span>
              <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: T.text }}>{topic.title}</h1>
            </div>
            <p style={{ margin: 0, color: T.text2, fontSize: '0.85rem', lineHeight: 1.5 }}>{topic.subtitle}</p>
          </div>
          <AudioButton id={`topic-full-${topic.id}`} text={fullText} label="Listen" />
        </div>

        {/* Article badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '12px' }}>
          {topic.articles.map(a => (
            <span key={a} style={{
              background: T.goldDim,
              border: `1px solid ${T.gold}`,
              color: T.gold,
              borderRadius: '4px',
              padding: '2px 7px',
              fontSize: '0.72rem',
              fontWeight: 600,
            }}>{a}</span>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {/* Key Facts */}
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.rLg, padding: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '0.82rem', color: T.goldText, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Key Facts
            </p>
            <AudioButton id={`topic-keyfacts-${topic.id}`} text={topic.keyFacts.join('. ')} size="sm" />
          </div>
          <ul style={{ margin: 0, padding: '0 0 0 16px', display: 'grid', gap: '6px' }}>
            {topic.keyFacts.map((f, i) => (
              <li key={i} style={{ color: T.text2, fontSize: '0.85rem', lineHeight: 1.5 }}>{f}</li>
            ))}
          </ul>
        </div>

        {/* Accordion sections */}
        {SECTIONS.map(({ key, label, color }) => {
          const section = topic.sections[key]
          const isOpen = openSection === key
          const sectionText = section.points.join('. ')
          return (
            <div key={key} style={{ background: T.surface, border: `1px solid ${isOpen ? color : T.border}`, borderRadius: T.rLg, overflow: 'hidden', transition: T.tx }}>
              <button
                onClick={() => setOpenSection(isOpen ? null : key)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '13px 14px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  gap: '8px',
                }}
              >
                <span style={{ color: isOpen ? color : T.text2, fontWeight: 600, fontSize: '0.88rem', textAlign: 'left' }}>{label}</span>
                <span style={{ color: T.text3, fontSize: '0.9rem', flexShrink: 0 }}>{isOpen ? '▲' : '▼'}</span>
              </button>

              {isOpen && (
                <div style={{ padding: '0 14px 14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
                    <AudioButton id={`topic-${topic.id}-${key}`} text={sectionText} size="sm" />
                  </div>
                  <ul style={{ margin: 0, padding: '0 0 0 16px', display: 'grid', gap: '8px' }}>
                    {section.points.map((p, i) => (
                      <li key={i} style={{ color: T.text2, fontSize: '0.875rem', lineHeight: 1.6 }}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )
        })}

        {/* Ask Oboafo CTA */}
        <div style={{ background: T.blueDim, border: `1px solid ${T.blue}`, borderRadius: T.rLg, padding: '14px' }}>
          <p style={{ margin: '0 0 10px', color: T.blue, fontWeight: 700, fontSize: '0.85rem' }}>
            💬 Ask Oboafo about {topic.title.toLowerCase()}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {topic.suggestedQuestions.map(q => (
              <button
                key={q}
                onClick={() => onAskAbout(q)}
                style={{
                  padding: '8px 11px',
                  background: T.surface,
                  border: `1px solid ${T.border}`,
                  borderRadius: T.r,
                  color: T.text2,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  lineHeight: 1.4,
                  transition: T.tx,
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = T.blue; e.currentTarget.style.color = T.text }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.text2 }}
              >
                <span style={{ color: T.blue, marginRight: '5px' }}>→</span>{q}
              </button>
            ))}
          </div>
        </div>

        {/* Related Topics */}
        {related.length > 0 && (
          <div>
            <p style={{ margin: '0 0 8px', color: T.text3, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Related Topics
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
              {related.map(t => (
                <button
                  key={t.id}
                  onClick={() => onRelatedTopic(t.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '6px 11px',
                    background: T.surface,
                    border: `1px solid ${T.border}`,
                    borderRadius: T.rFull,
                    color: T.text2,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    transition: T.tx,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = t.color; e.currentTarget.style.color = T.text }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.text2 }}
                >
                  <span>{t.emoji}</span><span>{t.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sources */}
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.r, padding: '12px 14px' }}>
          <p style={{ margin: '0 0 8px', color: T.text3, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Sources
          </p>
          {topic.sources.map((s, i) => (
            <p key={i} style={{ margin: i === 0 ? 0 : '4px 0 0', color: T.text3, fontSize: '0.78rem', lineHeight: 1.5 }}>
              <span style={{ color: T.text2 }}>{s.label}</span> — {s.reference}
            </p>
          ))}
        </div>

        <Disclaimer />
      </div>
    </div>
  )
}
