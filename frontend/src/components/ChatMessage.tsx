import type { ChatMessage as ChatMessageType, TranslateReplyLanguage } from '../types'
import { LANGUAGE_LABELS, TRANSLATE_REPLY_LANGS } from '../types'
import { AudioButton } from './AudioButton'
import { T } from '../theme'

interface ChatMessageProps {
  message: ChatMessageType
  isOnline?: boolean
  onRetranslate?: (message: ChatMessageType, target: TranslateReplyLanguage) => void
  onTranslateUser?: (message: ChatMessageType, target: TranslateReplyLanguage) => void
  onRetry?: () => void
}

function splitAssistantLead(content: string): { lead: string; rest: string } {
  const idx = content.indexOf('\n\n')
  if (idx <= 0) return { lead: '', rest: content }
  return { lead: content.slice(0, idx).trim(), rest: content.slice(idx + 2).trim() }
}

export function ChatMessage({
  message,
  isOnline = true,
  onRetranslate,
  onTranslateUser,
  onRetry,
}: ChatMessageProps) {
  const isUser = message.role === 'user'
  const isLoading = message.isLoading

  const split =
    !isUser && !isLoading && !message.isError ? splitAssistantLead(message.content) : { lead: '', rest: '' }
  const lead = split.lead
  const rest = split.rest

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: 14,
        gap: 10,
        alignItems: 'flex-end',
        animation: 'fadeSlideUp 0.35s ease',
      }}
    >
      {!isUser && (
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: T.primary,
            border: `2px solid ${T.primaryLight}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.95rem',
            flexShrink: 0,
          }}
          aria-hidden
        >
          🔥
        </div>
      )}

      <div
        style={{
          maxWidth: 'min(100%, 520px)',
          background: isUser ? T.accent : T.surface,
          border: isUser ? `1px solid ${T.accentLight}` : `1px solid ${T.border}`,
          borderLeft: isUser ? 'none' : `4px solid ${T.primary}`,
          borderRadius: isUser ? T.rMd : T.rMd,
          padding: '12px 16px',
          boxShadow: isUser ? 'none' : T.shadowCard,
        }}
      >
        {isLoading ? (
          <div>
            <div style={{ display: 'flex', gap: 5, alignItems: 'center', padding: '4px 0' }}>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: T.textMuted,
                    animation: `dotPulse 1s ease-in-out ${i * 0.2}s infinite alternate`,
                  }}
                />
              ))}
            </div>
            <p
              style={{
                margin: '8px 0 0',
                fontFamily: T.fontBody,
                fontSize: T.caption.size,
                color: T.textMuted,
              }}
            >
              Oboafo is thinking…
            </p>
          </div>
        ) : (
          <>
            {!isUser && lead ? (
              <>
                <p
                  style={{
                    margin: '0 0 8px',
                    fontFamily: T.fontDisplay,
                    fontWeight: 600,
                    fontSize: T.body.size,
                    lineHeight: 1.35,
                    color: T.primary,
                  }}
                >
                  {lead}
                </p>
                {rest ? (
                  <p
                    style={{
                      margin: 0,
                      color: T.text,
                      fontFamily: T.fontBody,
                      fontSize: T.body.size,
                      lineHeight: T.body.lh,
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {rest}
                  </p>
                ) : null}
              </>
            ) : (
              <p
                style={{
                  margin: 0,
                  color: isUser ? T.primary : T.text,
                  fontFamily: T.fontBody,
                  fontSize: T.body.size,
                  lineHeight: T.body.lh,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {message.content}
              </p>
            )}

            {message.articles && message.articles.length > 0 && (
              <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {message.articles.map((a) => (
                  <span
                    key={a}
                    style={{
                      background: T.goldDim,
                      border: `1px solid ${T.accent}`,
                      color: T.primary,
                      borderRadius: T.rSm,
                      padding: '4px 8px',
                      fontSize: T.caption.size,
                      fontWeight: 600,
                      fontFamily: T.fontBody,
                    }}
                  >
                    {a}
                  </span>
                ))}
              </div>
            )}

            {isUser && message.userCanonicalText && onTranslateUser && (
              <div
                style={{
                  marginTop: 12,
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 6,
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: T.caption.size, color: T.textSecondary }}>
                  Your message in:
                  {message.userTranslating ? ' …' : ''}
                </span>
                {TRANSLATE_REPLY_LANGS.map((code) => {
                  const active = message.userDisplayLanguage === code
                  return (
                    <button
                      key={code}
                      type="button"
                      disabled={!isOnline || message.userTranslating || active}
                      onClick={() => onTranslateUser(message, code)}
                      style={{
                        fontSize: T.caption.size,
                        padding: '6px 10px',
                        borderRadius: T.rFull,
                        border: `1px solid ${active ? T.primary : T.border}`,
                        background: active ? T.goldDim : T.surface,
                        color: T.primary,
                        cursor: !isOnline || message.userTranslating || active ? 'default' : 'pointer',
                        opacity: !isOnline || message.userTranslating ? 0.5 : 1,
                        fontFamily: T.fontBody,
                        minHeight: 36,
                      }}
                    >
                      {LANGUAGE_LABELS[code]}
                    </button>
                  )
                })}
              </div>
            )}

            {!isUser && message.isError && onRetry && (
              <div style={{ marginTop: 12 }}>
                <button
                  type="button"
                  onClick={onRetry}
                  disabled={!isOnline}
                  style={{
                    fontSize: T.small.size,
                    fontWeight: 600,
                    padding: '10px 16px',
                    borderRadius: T.rFull,
                    border: `1px solid ${T.accent}`,
                    background: T.goldDim,
                    color: T.primary,
                    cursor: !isOnline ? 'not-allowed' : 'pointer',
                    fontFamily: T.fontBody,
                    minHeight: 48,
                  }}
                >
                  Retry request
                </button>
              </div>
            )}

            {!isUser && message.canonical && onRetranslate && (
              <div
                style={{
                  marginTop: 12,
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 6,
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: T.caption.size, color: T.textMuted, marginRight: 4 }}>
                  Show in:
                  {message.retranslating ? ' …' : ''}
                </span>
                {TRANSLATE_REPLY_LANGS.map((code) => {
                  const active = message.displayLanguage === code
                  return (
                    <button
                      key={code}
                      type="button"
                      disabled={!isOnline || message.retranslating || active}
                      onClick={() => onRetranslate(message, code)}
                      style={{
                        fontSize: T.caption.size,
                        padding: '6px 10px',
                        borderRadius: T.rFull,
                        border: `1px solid ${active ? T.primary : T.border}`,
                        background: active ? T.greenDim : T.bg,
                        color: active ? T.primary : T.textSecondary,
                        cursor: !isOnline || message.retranslating || active ? 'default' : 'pointer',
                        opacity: !isOnline || message.retranslating ? 0.5 : 1,
                        fontFamily: T.fontBody,
                        minHeight: 36,
                      }}
                    >
                      {LANGUAGE_LABELS[code]}
                    </button>
                  )
                })}
              </div>
            )}

            {!isUser && !message.isError && (
              <div style={{ marginTop: 10, display: 'flex', justifyContent: 'flex-end' }}>
                <AudioButton
                  id={message.id}
                  text={message.content}
                  size="sm"
                  speakLanguage={message.displayLanguage}
                />
              </div>
            )}

            <p
              style={{
                margin: '8px 0 0',
                color: isUser ? T.textSecondary : T.textMuted,
                fontSize: T.caption.size,
                fontFamily: T.fontBody,
                textAlign: isUser ? 'right' : 'left',
              }}
            >
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>

          </>
        )}
      </div>
    </div>
  )
}
