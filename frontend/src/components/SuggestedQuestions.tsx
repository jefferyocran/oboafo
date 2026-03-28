import { T } from '../theme'

interface SuggestedQuestionsProps {
  questions: string[]
  onSelect: (q: string) => void
}

export function SuggestedQuestions({ questions, onSelect }: SuggestedQuestionsProps) {
  return (
    <div>
      <p style={{ margin: '0 0 8px', color: T.text3, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Suggested questions
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {questions.map((q) => (
          <button
            key={q}
            onClick={() => onSelect(q)}
            style={{
              padding: '9px 12px',
              background: T.surface2,
              border: `1px solid ${T.border}`,
              borderRadius: T.r,
              color: T.text2,
              fontSize: '0.85rem',
              cursor: 'pointer',
              textAlign: 'left',
              lineHeight: 1.4,
              transition: T.tx,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = T.gold
              e.currentTarget.style.color = T.text
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = T.border
              e.currentTarget.style.color = T.text2
            }}
          >
            <span style={{ color: T.gold, marginRight: '6px' }}>→</span>
            {q}
          </button>
        ))}
      </div>
    </div>
  )
}
