import type { Topic } from '../types'
import { T } from '../theme'

interface TopicCardProps {
  topic: Topic
  onClick: () => void
}

export function TopicCard({ topic, onClick }: TopicCardProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        padding: '16px',
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderTop: `3px solid ${topic.color}`,
        borderRadius: T.rLg,
        cursor: 'pointer',
        textAlign: 'left',
        transition: T.tx,
        width: '100%',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = T.surface2
        e.currentTarget.style.borderColor = topic.color
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = T.surface
        e.currentTarget.style.borderColor = T.border
        e.currentTarget.style.borderTopColor = topic.color
      }}
    >
      <span style={{ fontSize: '1.8rem' }}>{topic.emoji}</span>
      <div>
        <div style={{ color: T.text, fontWeight: 700, fontSize: '0.92rem', marginBottom: '3px' }}>
          {topic.title}
        </div>
        <div style={{ color: T.text3, fontSize: '0.78rem', lineHeight: 1.4 }}>
          {topic.subtitle}
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '2px' }}>
        {topic.articles.slice(0, 3).map(a => (
          <span key={a} style={{
            background: T.surface3,
            border: `1px solid ${T.border}`,
            color: T.text3,
            borderRadius: '4px',
            padding: '2px 5px',
            fontSize: '0.68rem',
          }}>
            {a}
          </span>
        ))}
      </div>
    </button>
  )
}
