import { useState } from 'react'
import type { CrisisScenario, CrisisResponse, Language } from '../types'
import { CRISIS_SCENARIOS, getCrisisResponse } from '../data/crisisResponses'
import { T } from '../theme'

interface CrisisButtonsProps {
  language: Language
}

export function CrisisButtons({ language }: CrisisButtonsProps) {
  const [activeResponse, setActiveResponse] = useState<CrisisResponse | null>(null)

  function handleScenario(scenario: CrisisScenario) {
    const response = getCrisisResponse(scenario, language)
    setActiveResponse(response)
  }

  function handleBack() {
    setActiveResponse(null)
  }

  if (activeResponse) {
    return <CrisisDetail response={activeResponse} onBack={handleBack} />
  }

  return (
    <div>
      <h2
        style={{
          color: T.red,
          fontSize: T.body.size,
          fontWeight: 700,
          marginBottom: 12,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          fontFamily: T.fontBody,
        }}
      >
        Choose a situation
      </h2>
      <div style={{ display: 'grid', gap: 10 }}>
        {CRISIS_SCENARIOS.map(({ id, emoji, labelEn }) => (
          <button
            key={id}
            type="button"
            onClick={() => handleScenario(id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              minHeight: 48,
              padding: '14px 16px',
              background: T.surface,
              border: `1px solid ${T.redBorder}`,
              borderRadius: T.rMd,
              color: T.red,
              fontSize: T.body.size,
              fontWeight: 600,
              cursor: 'pointer',
              textAlign: 'left',
              transition: T.tx,
              fontFamily: T.fontBody,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = T.redDim
              e.currentTarget.style.borderColor = T.red
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = T.surface
              e.currentTarget.style.borderColor = T.redBorder
            }}
          >
            <span style={{ fontSize: '1.4rem' }} aria-hidden>
              {emoji}
            </span>
            <span>{labelEn}</span>
          </button>
        ))}
      </div>
      <p style={{ color: T.textMuted, fontSize: T.caption.size, marginTop: 10, fontFamily: T.fontBody }}>
        Works offline — no internet needed
      </p>
    </div>
  )
}

function CrisisDetail({ response, onBack }: { response: CrisisResponse; onBack: () => void }) {
  return (
    <div style={{ animation: 'fadeIn 0.2s ease' }}>
      <button
        type="button"
        onClick={onBack}
        style={{
          background: 'transparent',
          border: 'none',
          color: T.primaryLight,
          cursor: 'pointer',
          fontSize: T.small.size,
          padding: '0 0 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          fontFamily: T.fontBody,
          minHeight: 48,
        }}
      >
        ← Back
      </button>

      <h2
        style={{
          color: T.red,
          fontSize: T.h3.size,
          fontFamily: T.fontDisplay,
          fontWeight: 700,
          marginBottom: 16,
        }}
      >
        {response.title}
      </h2>

      <section style={{ marginBottom: 20 }}>
        <h3
          style={{
            color: T.accent,
            fontSize: T.caption.size,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: 10,
            fontFamily: T.fontBody,
          }}
        >
          Your rights
        </h3>
        <div style={{ display: 'grid', gap: 8 }}>
          {response.rights.map((right, i) => (
            <div
              key={i}
              style={{
                background: T.greenDim,
                border: `1px solid ${T.success}`,
                borderRadius: T.rSm,
                padding: '12px 14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 10,
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: T.text,
                  fontSize: T.body.size,
                  lineHeight: T.body.lh,
                  fontFamily: T.fontBody,
                }}
              >
                {right.text}
              </p>
              <span
                style={{
                  flexShrink: 0,
                  background: T.surface,
                  border: `1px solid ${T.accent}`,
                  color: T.primary,
                  borderRadius: T.rSm,
                  padding: '4px 8px',
                  fontSize: T.caption.size,
                  fontWeight: 700,
                  fontFamily: T.fontBody,
                }}
              >
                {right.article}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: 20 }}>
        <h3
          style={{
            color: T.accent,
            fontSize: T.caption.size,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: 10,
            fontFamily: T.fontBody,
          }}
        >
          What to do
        </h3>
        <ol
          style={{
            margin: 0,
            paddingLeft: 20,
            display: 'grid',
            gap: 6,
            fontFamily: T.fontBody,
            fontSize: T.body.size,
            color: T.text,
            lineHeight: T.body.lh,
          }}
        >
          {response.actions.map((action, i) => (
            <li key={i}>{action}</li>
          ))}
        </ol>
      </section>

      {response.emergency_contacts.length > 0 && (
        <section>
          <h3
            style={{
              color: T.accent,
              fontSize: T.caption.size,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: 10,
              fontFamily: T.fontBody,
            }}
          >
            Emergency contacts
          </h3>
          <div style={{ display: 'grid', gap: 6 }}>
            {response.emergency_contacts.map((contact, i) => (
              <a
                key={i}
                href={`tel:${contact.phone.replace(/[^+\d]/g, '')}`}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  minHeight: 48,
                  padding: '12px 14px',
                  background: T.surface,
                  border: `1px solid ${T.border}`,
                  borderRadius: T.rSm,
                  textDecoration: 'none',
                  color: T.text,
                  fontSize: T.small.size,
                  fontFamily: T.fontBody,
                }}
              >
                <span>{contact.name}</span>
                <span style={{ color: T.primaryLight, fontWeight: 600 }}>{contact.phone}</span>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
