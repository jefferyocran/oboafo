import { useState, useRef, useEffect } from 'react'
import type { ChatMessage, Language } from '../types'
import { ChatMessage as ChatMessageComponent } from './ChatMessage'
import { SuggestedQuestions } from './SuggestedQuestions'
import { VoiceInput } from './VoiceInput'
import { Disclaimer } from './Disclaimer'
import { useAsk } from '../hooks/useApi'
import { T } from '../theme'

const DEFAULT_SUGGESTIONS = [
  'Can police search me without a warrant?',
  'What are my rights if I\'m arrested?',
  'Can my landlord evict me without notice?',
  'Am I innocent until proven guilty in Ghana?',
]

interface ChatProps {
  language: Language
  isOnline: boolean
  prefillQuestion?: string
  onPrefillConsumed?: () => void
}

export function Chat({ language, isOnline, prefillQuestion, onPrefillConsumed }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLInputElement>(null)
  const { ask, loading } = useAsk()

  const showWelcome = messages.length === 0

  // Handle topic pre-fill
  useEffect(() => {
    if (prefillQuestion) {
      setInput(prefillQuestion)
      inputRef.current?.focus()
      onPrefillConsumed?.()
    }
  }, [prefillQuestion, onPrefillConsumed])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(text: string) {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')

    if (!isOnline) {
      setMessages(prev => [...prev, {
        id: `sys-${Date.now()}`,
        role: 'assistant',
        content: "You're offline. The AI chat requires internet. Use 🆘 Crisis Mode for instant offline help.",
        timestamp: new Date(),
      }])
      return
    }

    // Loading bubble
    const loadingId = `loading-${Date.now()}`
    setMessages(prev => [...prev, { id: loadingId, role: 'assistant', content: '...', timestamp: new Date(), isLoading: true }])

    const response = await ask({ message: trimmed, language })

    setMessages(prev => prev.filter(m => m.id !== loadingId))

    if (response) {
      const parts = [response.answer]
      if (response.action_steps.length > 0) {
        parts.push('\n**What to do:**\n' + response.action_steps.map((s, i) => `${i + 1}. ${s}`).join('\n'))
      }
      parts.push(`\n_${response.disclaimer}_`)

      setMessages(prev => [...prev, {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: parts.join('\n'),
        articles: response.articles_cited,
        timestamp: new Date(),
      }])
    } else {
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.',
        timestamp: new Date(),
      }])
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: T.bg }}>

      {/* Header */}
      <div style={{ padding: '14px 16px', borderBottom: `1px solid ${T.border}`, background: T.surface, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.3rem' }}>🤖</span>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: T.text }}>Ask Oboafo</p>
            <p style={{ margin: 0, fontSize: '0.72rem', color: isOnline ? T.green : T.text3 }}>
              {isOnline ? '● Online' : '● Offline — Chat unavailable'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {showWelcome && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              background: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: T.rLg,
              padding: '16px',
              marginBottom: '16px',
            }}>
              <p style={{ margin: '0 0 6px', fontWeight: 700, color: T.text, fontSize: '0.95rem' }}>
                Hello! I'm Oboafo 🇬🇭
              </p>
              <p style={{ margin: 0, color: T.text2, fontSize: '0.85rem', lineHeight: 1.6 }}>
                I explain your rights under the 1992 Constitution of Ghana — in plain language.
                Ask me anything, or choose a question below.
              </p>
            </div>
            <SuggestedQuestions
              questions={DEFAULT_SUGGESTIONS}
              onSelect={sendMessage}
            />
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessageComponent key={msg.id} message={msg} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div style={{ borderTop: `1px solid ${T.border}`, background: T.surface, padding: '10px 12px', flexShrink: 0 }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', alignItems: 'center', position: 'relative' }}>
          <VoiceInput
            language={language}
            onTranscript={text => setInput(text)}
            disabled={loading || !isOnline}
          />
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={isOnline ? 'Ask about your rights…' : 'Offline — use Crisis Mode'}
            disabled={loading || !isOnline}
            style={{
              flex: 1,
              background: T.surface2,
              border: `1px solid ${T.border}`,
              borderRadius: T.r,
              color: T.text,
              padding: '10px 12px',
              fontSize: '0.9rem',
              outline: 'none',
              transition: T.tx,
            }}
            onFocus={e => { e.target.style.borderColor = T.gold }}
            onBlur={e => { e.target.style.borderColor = T.border }}
          />
          <button
            type="submit"
            disabled={loading || !input.trim() || !isOnline}
            style={{
              background: T.gold,
              color: T.bg,
              border: 'none',
              borderRadius: T.r,
              padding: '10px 14px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: (loading || !input.trim() || !isOnline) ? 'not-allowed' : 'pointer',
              opacity: (loading || !input.trim() || !isOnline) ? 0.45 : 1,
              flexShrink: 0,
              transition: T.tx,
            }}
          >
            {loading ? '…' : 'Ask'}
          </button>
        </form>
        <div style={{ marginTop: '8px' }}>
          <Disclaimer compact />
        </div>
      </div>
    </div>
  )
}
