import { useState } from 'react'
import type { CrisisScenario, CrisisResponse, Language } from '../types'
import { CRISIS_SCENARIOS, getCrisisResponse } from '../data/crisisResponses'

interface CrisisButtonsProps {
  language: Language
}

export function CrisisButtons({ language }: CrisisButtonsProps) {
  const [activeResponse, setActiveResponse] = useState<CrisisResponse | null>(null)

  function handleScenario(scenario: CrisisScenario) {
    // Always use local cached data — works offline
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
      <h2 style={{ color: '#f87171', fontSize: '1rem', fontWeight: 700, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Crisis Mode — Instant Help
      </h2>
      <div style={{ display: 'grid', gap: '10px' }}>
        {CRISIS_SCENARIOS.map(({ id, emoji, labelEn }) => (
          <button
            key={id}
            onClick={() => handleScenario(id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '14px 16px',
              background: '#1a0a0a',
              border: '1px solid #991b1b',
              borderRadius: '10px',
              color: '#fca5a5',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#2a1010'
              e.currentTarget.style.borderColor = '#ef4444'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#1a0a0a'
              e.currentTarget.style.borderColor = '#991b1b'
            }}
          >
            <span style={{ fontSize: '1.4rem' }}>{emoji}</span>
            <span>{labelEn}</span>
          </button>
        ))}
      </div>
      <p style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '10px' }}>
        Works offline — no internet needed
      </p>
    </div>
  )
}

function CrisisDetail({ response, onBack }: { response: CrisisResponse; onBack: () => void }) {
  return (
    <div style={{ animation: 'fadeIn 0.2s ease' }}>
      <button
        onClick={onBack}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#9ca3af',
          cursor: 'pointer',
          fontSize: '0.85rem',
          padding: '0 0 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        ← Back
      </button>

      <h2 style={{ color: '#f87171', fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>
        {response.title}
      </h2>

      <section style={{ marginBottom: '20px' }}>
        <h3 style={{ color: '#d4a843', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
          Your Rights
        </h3>
        <div style={{ display: 'grid', gap: '8px' }}>
          {response.rights.map((right, i) => (
            <div
              key={i}
              style={{
                background: '#0f1a0f',
                border: '1px solid #166534',
                borderRadius: '8px',
                padding: '10px 12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '10px',
              }}
            >
              <p style={{ margin: 0, color: '#86efac', fontSize: '0.9rem', lineHeight: 1.4 }}>
                {right.text}
              </p>
              <span style={{
                flexShrink: 0,
                background: '#0d1117',
                border: '1px solid #d4a843',
                color: '#d4a843',
                borderRadius: '4px',
                padding: '2px 6px',
                fontSize: '0.7rem',
                fontWeight: 700,
              }}>
                {right.article}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: '20px' }}>
        <h3 style={{ color: '#d4a843', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
          What To Do
        </h3>
        <ol style={{ margin: 0, paddingLeft: '20px', display: 'grid', gap: '6px' }}>
          {response.actions.map((action, i) => (
            <li key={i} style={{ color: '#e5e7eb', fontSize: '0.9rem', lineHeight: 1.4 }}>
              {action}
            </li>
          ))}
        </ol>
      </section>

      {response.emergency_contacts.length > 0 && (
        <section>
          <h3 style={{ color: '#d4a843', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
            Emergency Contacts
          </h3>
          <div style={{ display: 'grid', gap: '6px' }}>
            {response.emergency_contacts.map((contact, i) => (
              <a
                key={i}
                href={`tel:${contact.phone}`}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 12px',
                  background: '#0d1117',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: '#e5e7eb',
                  fontSize: '0.85rem',
                }}
              >
                <span>{contact.name}</span>
                <span style={{ color: '#60a5fa', fontWeight: 600 }}>{contact.phone}</span>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
