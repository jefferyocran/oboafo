import type { ChatMessage as ChatMessageType } from '../types'
import { AudioButton } from './AudioButton'
import { T } from '../theme'

interface ChatMessageProps {
  message: ChatMessageType
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const isLoading = message.isLoading

  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: '12px',
      gap: '8px',
      alignItems: 'flex-end',
    }}>
      {!isUser && (
        <div style={{
          width: '28px', height: '28px',
          borderRadius: '50%',
          background: T.goldDim,
          border: `1px solid ${T.gold}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.8rem',
          flexShrink: 0,
        }}>
          🤖
        </div>
      )}

      <div style={{
        maxWidth: '78%',
        background: isUser ? T.blueDim : T.surface,
        border: `1px solid ${isUser ? T.blue : T.border}`,
        borderRadius: isUser ? `${T.rLg} ${T.rLg} 4px ${T.rLg}` : `${T.rLg} ${T.rLg} ${T.rLg} 4px`,
        padding: '10px 13px',
      }}>
        {isLoading ? (
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center', padding: '2px 0' }}>
            {[0,1,2].map(i => (
              <div key={i} style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: T.text3,
                animation: `dotPulse 1s ease-in-out ${i * 0.2}s infinite alternate`,
              }}/>
            ))}
            <style>{`@keyframes dotPulse { from { opacity:0.3; transform:scale(0.8); } to { opacity:1; transform:scale(1.1); } }`}</style>
          </div>
        ) : (
          <>
            <p style={{
              margin: 0,
              color: T.text,
              fontSize: '0.9rem',
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
            }}>
              {message.content}
            </p>

            {message.articles && message.articles.length > 0 && (
              <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {message.articles.map(a => (
                  <span key={a} style={{
                    background: T.goldDim,
                    border: `1px solid ${T.gold}`,
                    color: T.gold,
                    borderRadius: '4px',
                    padding: '2px 6px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                  }}>
                    {a}
                  </span>
                ))}
              </div>
            )}

            {!isUser && (
              <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
                <AudioButton id={message.id} text={message.content} size="sm" />
              </div>
            )}

            <p style={{
              margin: '5px 0 0',
              color: T.text4,
              fontSize: '0.68rem',
              textAlign: isUser ? 'right' : 'left',
            }}>
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </>
        )}
      </div>
    </div>
  )
}
