import { useState } from 'react'
import type { Topic } from '../types'
import { TopicCard } from '../components/TopicCard'
import { TopicPage } from '../components/TopicPage'
import { T } from '../theme'

interface BrowsePageProps {
  topics: Topic[]
  initialTopicId?: string
  onAskAbout: (question: string) => void
}

export function BrowsePage({ topics, initialTopicId, onAskAbout }: BrowsePageProps) {
  const [selectedId, setSelectedId] = useState<string | null>(initialTopicId ?? null)

  const selected = topics.find(t => t.id === selectedId)

  if (selected) {
    return (
      <div style={{ height: '100%', overflow: 'hidden' }}>
        <TopicPage
          topic={selected}
          allTopics={topics}
          onBack={() => setSelectedId(null)}
          onAskAbout={onAskAbout}
          onRelatedTopic={setSelectedId}
        />
      </div>
    )
  }

  return (
    <div style={{ overflowY: 'auto', height: '100%' }}>
      {/* Header */}
      <div style={{
        padding: '16px',
        borderBottom: `1px solid ${T.border}`,
        background: T.surface,
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: T.text }}>
          📚 Browse Rights
        </h2>
        <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: T.text3 }}>
          Choose a life situation to learn your rights
        </p>
      </div>

      {/* Topic grid */}
      <div style={{
        padding: '14px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '10px',
      }}>
        {topics.map(topic => (
          <TopicCard
            key={topic.id}
            topic={topic}
            onClick={() => setSelectedId(topic.id)}
          />
        ))}
      </div>
    </div>
  )
}
