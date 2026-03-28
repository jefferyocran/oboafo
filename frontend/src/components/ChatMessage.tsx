import type { ChatMessage as ChatMessageType } from '../types'

interface ChatMessageProps {
  message: ChatMessageType
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: '12px',
    }}>
      <div style={{
        maxWidth: '80%',
        background: isUser ? '#1a3a5c' : '#1a1f2e',
        border: `1px solid ${isUser ? '#2563eb' : '#374151'}`,
        borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
        padding: '10px 14px',
      }}>
        <p style={{
          margin: 0,
          color: '#e5e7eb',
          fontSize: '0.95rem',
          lineHeight: 1.5,
          whiteSpace: 'pre-wrap',
        }}>
          {message.content}
        </p>

        {message.articles && message.articles.length > 0 && (
          <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {message.articles.map((article) => (
              <span
                key={article}
                style={{
                  background: '#0d1117',
                  border: '1px solid #d4a843',
                  color: '#d4a843',
                  borderRadius: '4px',
                  padding: '2px 6px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                {article}
              </span>
            ))}
          </div>
        )}

        <p style={{
          margin: '4px 0 0',
          color: '#6b7280',
          fontSize: '0.7rem',
          textAlign: isUser ? 'right' : 'left',
        }}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  )
}
