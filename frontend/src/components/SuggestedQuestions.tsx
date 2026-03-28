import { T } from '../theme'

interface SuggestedQuestionsProps {
  questions: string[]
  onSelect: (q: string) => void
  layout?: 'stack' | 'row' | 'wrap'
}

const chipBase = {
  padding: '10px 14px',
  background: T.surface,
  border: `1px solid ${T.border}`,
  borderRadius: T.rFull,
  color: T.textSecondary,
  fontFamily: T.fontBody,
  fontSize: T.small.size,
  cursor: 'pointer' as const,
  textAlign: 'left' as const,
  lineHeight: 1.4,
  transition: T.tx,
  minHeight: 48,
}

export function SuggestedQuestions({
  questions,
  onSelect,
  layout = 'stack',
}: SuggestedQuestionsProps) {
  const flexDir = layout === 'stack' ? 'column' : 'row'
  const flexWrap = layout === 'wrap' ? 'wrap' : layout === 'row' ? 'nowrap' : 'nowrap'

  return (
    <div
      role="list"
      style={{
        display: 'flex',
        flexDirection: flexDir,
        flexWrap,
        gap: 8,
        alignItems: layout === 'stack' ? 'stretch' : 'flex-start',
      }}
    >
      {questions.map((q) => (
        <button
          key={q}
          type="button"
          role="listitem"
          onClick={() => onSelect(q)}
          style={{
            ...chipBase,
            ...(layout === 'row' ? { flex: '0 0 auto', whiteSpace: 'nowrap' as const } : {}),
            ...(layout === 'wrap' ? { flex: '1 1 200px' } : {}),
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = T.accent
            e.currentTarget.style.transform = 'scale(1.02)'
            e.currentTarget.style.color = T.text
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = T.border
            e.currentTarget.style.transform = 'none'
            e.currentTarget.style.color = T.textSecondary
          }}
        >
          {q}
        </button>
      ))}
    </div>
  )
}
