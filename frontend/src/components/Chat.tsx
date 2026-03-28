import { useState, useRef, useEffect } from 'react'
import type { ChatMessage, Language } from '../types'
import { ChatMessage as ChatMessageComponent } from './ChatMessage'
import { useAsk } from '../hooks/useApi'

interface ChatProps {
  language: Language
  isOnline: boolean
}

export function Chat({ language, isOnline }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! I can help you understand your rights under the 1992 Constitution of Ghana. Ask me anything — for example: "Can police search me without a warrant?" or "What are my rights if I\'m arrested?"',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const { ask, loading } = useAsk()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')

    if (!isOnline) {
      setMessages((prev) => [
        ...prev,
        {
          id: `offline-${Date.now()}`,
          role: 'assistant',
          content: "You're currently offline. The AI chat requires an internet connection. Please use Crisis Mode for instant offline help.",
          timestamp: new Date(),
        },
      ])
      return
    }

    const response = await ask({ message: text, language })

    if (response) {
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: `${response.answer}\n\n${response.action_steps.length > 0 ? '**What to do:**\n' + response.action_steps.map((s, i) => `${i + 1}. ${s}`).join('\n') : ''}\n\n_${response.disclaimer}_`,
        articles: response.articles_cited,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
    } else {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: 'Sorry, I could not process your request. Please try again.',
          timestamp: new Date(),
        },
      ])
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
      }}>
        {messages.map((msg) => (
          <ChatMessageComponent key={msg.id} message={msg} />
        ))}
        {loading && (
          <div style={{ textAlign: 'left', color: '#6b7280', fontSize: '0.85rem', padding: '8px 0' }}>
            Thinking...
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          borderTop: '1px solid #1f2937',
          padding: '12px 16px',
          display: 'flex',
          gap: '8px',
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isOnline ? 'Ask about your rights...' : 'Offline — use Crisis Mode'}
          disabled={loading}
          style={{
            flex: 1,
            background: '#1a1f2e',
            border: '1px solid #374151',
            borderRadius: '8px',
            color: '#e5e7eb',
            padding: '10px 12px',
            fontSize: '0.9rem',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          style={{
            background: '#d4a843',
            color: '#0d1117',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 16px',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            opacity: loading || !input.trim() ? 0.5 : 1,
          }}
        >
          Ask
        </button>
      </form>

      <p style={{ textAlign: 'center', color: '#4b5563', fontSize: '0.7rem', padding: '4px 16px 8px' }}>
        This is guidance, not legal advice. Consult a qualified lawyer for legal matters.
      </p>
    </div>
  )
}
