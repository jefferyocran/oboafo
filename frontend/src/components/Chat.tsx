import { useState, useRef, useEffect, useCallback } from 'react'
import type { ChatMessage, Language, TranslateReplyLanguage } from '../types'
import { ChatMessage as ChatMessageComponent } from './ChatMessage'
import { SuggestedQuestions } from './SuggestedQuestions'
import { VoiceInput } from './VoiceInput'
import { Disclaimer } from './Disclaimer'
import { useAsk, translateReply, translateText } from '../hooks/useApi'
import { T } from '../theme'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { LanguageSelector } from './LanguageSelector'
import { useLanguage } from '../context/LanguageContext'

const DEFAULT_SUGGESTIONS = [
  'Can my landlord enter without notice?',
  'What are my rights if I am arrested?',
  'Am I entitled to annual leave?',
  'Can I be denied treatment at a hospital?',
]

const SESSION_KEY = 'oboafo-chat-session-v1'

function genId(prefix: string): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function formatAssistantBody(answer: string, steps: string[], disclaimer: string): string {
  const parts = [answer]
  if (steps.length > 0) {
    parts.push('\n**What to do:**\n' + steps.map((s, i) => `${i + 1}. ${s}`).join('\n'))
  }
  parts.push(`\n_${disclaimer}_`)
  return parts.join('\n')
}

function appLanguageToDisplayLang(lang: Language): TranslateReplyLanguage {
  if (lang === 'en' || lang === 'tw' || lang === 'ee' || lang === 'ga') {
    return lang
  }
  return 'tw'
}

function loadSessionMessages(): ChatMessage[] {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return []
    const data = JSON.parse(raw) as Array<Omit<ChatMessage, 'timestamp'> & { timestamp: string }>
    if (!Array.isArray(data)) return []
    return data.map((m) => ({
      ...m,
      timestamp: new Date(m.timestamp),
    }))
  } catch {
    return []
  }
}

function persistSessionMessages(messages: ChatMessage[]) {
  const serializable = messages.map((m) => ({
    ...m,
    timestamp: m.timestamp.toISOString(),
  }))
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(serializable))
  } catch (e) {
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      // Trim to last 20 messages and retry
      try {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(serializable.slice(-20)))
      } catch {
        console.warn('Session storage full — conversation history not saved.')
      }
    }
  }
}

interface ChatProps {
  language: Language
  isOnline: boolean
  prefillQuestion?: string
  onPrefillConsumed?: () => void
}

export function Chat({ language, isOnline, prefillQuestion, onPrefillConsumed }: ChatProps) {
  const { setLanguage } = useLanguage()
  const isDesktop = useMediaQuery('(min-width: 900px)')
  const [messages, setMessages] = useState<ChatMessage[]>(loadSessionMessages)
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { ask, inFlight } = useAsk()

  const showWelcome = messages.length === 0

  useEffect(() => {
    persistSessionMessages(messages)
  }, [messages])

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

  const handleTranslateUser = useCallback(
    async (msg: ChatMessage, target: TranslateReplyLanguage) => {
      if (!msg.userCanonicalText || msg.userCanonicalLang == null || !isOnline) return
      const id = msg.id
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, userTranslating: true } : m)),
      )
      try {
        const res = await translateText({
          text: msg.userCanonicalText,
          source: msg.userCanonicalLang,
          target,
        })
        setMessages((prev) =>
          prev.map((m) =>
            m.id === id
              ? {
                  ...m,
                  content: res.text,
                  userDisplayLanguage: target,
                  userTranslating: false,
                  translationError: undefined,
                }
              : m,
          ),
        )
      } catch (e) {
        const msg2 = e instanceof Error ? e.message : 'Translation failed.'
        setMessages((prev) =>
          prev.map((m) =>
            m.id === id ? { ...m, userTranslating: false, translationError: msg2 } : m,
          ),
        )
      }
    },
    [isOnline],
  )

  const handleRetranslate = useCallback(
    async (msg: ChatMessage, target: TranslateReplyLanguage) => {
      const messageId = msg.id
      if (!msg.canonical || !isOnline) return

      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, retranslating: true } : m)),
      )

      const c = msg.canonical
      if (target === 'en') {
        const content = formatAssistantBody(
          c.answerEnglish,
          c.actionStepsEnglish,
          c.disclaimerEnglish,
        )
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId
              ? { ...m, content, displayLanguage: 'en', retranslating: false }
              : m,
          ),
        )
        return
      }

      try {
        const res = await translateReply({
          answer_english: c.answerEnglish,
          action_steps_english: c.actionStepsEnglish,
          disclaimer_english: c.disclaimerEnglish,
          target,
        })
        const content = formatAssistantBody(res.answer, res.action_steps, res.disclaimer)
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId
              ? { ...m, content, displayLanguage: target, retranslating: false, translationError: undefined }
              : m,
          ),
        )
      } catch (e) {
        const errMsg = e instanceof Error ? e.message : 'Translation failed.'
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId ? { ...m, retranslating: false, translationError: errMsg } : m,
          ),
        )
      }
    },
    [isOnline],
  )

  function clearConversation() {
    setMessages([])
    try {
      sessionStorage.removeItem(SESSION_KEY)
    } catch {
      /* ignore */
    }
  }

  async function sendMessage(
    text: string,
    options?: {
      retry?: boolean
      language?: Language
      removeErrorId?: string
      pairedUserId?: string
    },
  ) {
    const trimmed = text.trim()
    if (!trimmed) return

    const askLanguage = options?.retry && options?.language ? options.language : language
    let userId: string

    if (!options?.retry) {
      userId = genId('u')
      const canon = appLanguageToDisplayLang(language)
      const userMsg: ChatMessage = {
        id: userId,
        role: 'user',
        content: trimmed,
        inputLanguage: language,
        submittedText: trimmed,
        userCanonicalText: trimmed,
        userCanonicalLang: canon,
        userDisplayLanguage: canon,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, userMsg])
      setInput('')
    } else {
      if (!options.pairedUserId || !options.removeErrorId) return
      userId = options.pairedUserId
      setMessages((prev) => prev.filter((m) => m.id !== options.removeErrorId))
    }

    if (!isOnline) {
      setMessages((prev) => [
        ...prev,
        {
          id: genId('sys'),
          role: 'assistant',
          content:
            "You're offline. The AI chat requires internet. Use 🆘 Crisis Mode for instant offline help.",
          timestamp: new Date(),
          pairedUserId: options?.retry ? userId : undefined,
        },
      ])
      return
    }

    const loadingId = genId('loading')
    setMessages((prev) => [
      ...prev,
      {
        id: loadingId,
        role: 'assistant',
        content: '…',
        timestamp: new Date(),
        isLoading: true,
        pairedUserId: userId,
      },
    ])

    const result = await ask({ message: trimmed, language: askLanguage })

    setMessages((prev) => prev.filter((m) => m.id !== loadingId))

    if (result.ok) {
      const response = result.data
      const parts = [response.answer]
      if (response.action_steps.length > 0) {
        parts.push(
          '\n**What to do:**\n' +
            response.action_steps.map((s, i) => `${i + 1}. ${s}`).join('\n'),
        )
      }
      parts.push(`\n_${response.disclaimer}_`)

      const displayLang = appLanguageToDisplayLang(askLanguage)

      setMessages((prev) => [
        ...prev,
        {
          id: genId('a'),
          role: 'assistant',
          content: parts.join('\n'),
          articles: response.articles_cited,
          timestamp: new Date(),
          pairedUserId: userId,
          canonical: {
            answerEnglish: response.answer_english,
            actionStepsEnglish: response.action_steps_english,
            disclaimerEnglish: response.disclaimer_english,
          },
          displayLanguage: displayLang,
        },
      ])
    } else {
      setMessages((prev) => [
        ...prev,
        {
          id: genId('err'),
          role: 'assistant',
          content: result.error,
          timestamp: new Date(),
          isError: true,
          pairedUserId: userId,
        },
      ])
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    sendMessage(input)
  }

  const sidebarInner = (
    <>
      <h2
        style={{
          fontFamily: T.fontDisplay,
          fontSize: isDesktop ? T.h2.size : T.h3.size,
          fontWeight: T.h2.weight,
          color: T.primary,
          margin: `0 0 ${T.sp(1)}`,
        }}
      >
        Ask Oboafo
      </h2>
      <p
        style={{
          fontFamily: T.fontBody,
          fontSize: T.small.size,
          lineHeight: T.small.lh,
          color: T.textSecondary,
          margin: `0 0 ${T.sp(2)}`,
        }}
      >
        Type or speak your question in any language. Oboafo will explain your rights simply and clearly.
      </p>
      <p
        id="chat-lang-label"
        style={{
          fontFamily: T.fontBody,
          fontSize: T.caption.size,
          fontWeight: 600,
          color: T.text,
          margin: `0 0 ${T.sp(1)}`,
        }}
      >
        I want to speak in:
      </p>
      <LanguageSelector
        language={language}
        onChange={setLanguage}
        variant="pills"
        labelId="chat-lang-label"
      />
      <p
        style={{
          fontFamily: T.fontBody,
          fontSize: T.caption.size,
          color: T.textMuted,
          margin: `${T.sp(1)} 0 ${T.sp(2)}`,
        }}
      >
        Oboafo will listen and respond in your chosen language.
      </p>
      <div
        style={{
          height: 1,
          background: T.border,
          margin: `${T.sp(2)} 0`,
        }}
      />
      <p
        style={{
          fontFamily: T.fontBody,
          fontSize: T.caption.size,
          fontWeight: 600,
          color: T.primary,
          margin: `0 0 ${T.sp(1)}`,
        }}
      >
        Suggested questions
      </p>
      <SuggestedQuestions questions={DEFAULT_SUGGESTIONS} onSelect={sendMessage} layout="stack" />
      <div style={{ marginTop: T.sp(3) }}>
        <Disclaimer compact />
      </div>
    </>
  )

  return (
    <div
      style={{
        display: 'flex',
        flex: 1,
        flexDirection: isDesktop ? 'row' : 'column',
        minHeight: 0,
        background: T.bg,
        width: '100%',
        maxWidth: 1200,
        margin: '0 auto',
      }}
    >
      {isDesktop ? (
        <aside
          style={{
            width: 300,
            flexShrink: 0,
            borderRight: `1px solid ${T.border}`,
            padding: T.sp(3),
            overflowY: 'auto',
            background: T.surface,
          }}
        >
          {sidebarInner}
        </aside>
      ) : (
        <div
          style={{
            flexShrink: 0,
            borderBottom: `1px solid ${T.border}`,
            background: T.surface,
            padding: `${T.sp(2)} 16px`,
            overflowX: 'auto',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: T.sp(2) }}>
            <div>
              <span
                style={{
                  fontFamily: T.fontBody,
                  fontSize: T.caption.size,
                  fontWeight: 600,
                  color: T.textMuted,
                  marginRight: 8,
                }}
              >
                Language
              </span>
              <LanguageSelector language={language} onChange={setLanguage} variant="select" />
            </div>
            <SuggestedQuestions questions={DEFAULT_SUGGESTIONS} onSelect={sendMessage} layout="row" />
          </div>
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div
          style={{
            padding: `${T.sp(2)} 16px`,
            borderBottom: `1px solid ${T.border}`,
            background: T.surface,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: T.sp(2),
          }}
        >
          <div>
            <p style={{ margin: 0, fontFamily: T.fontBody, fontWeight: 600, fontSize: T.body.size, color: T.text }}>
              Chat
            </p>
            <p style={{ margin: 0, fontFamily: T.fontBody, fontSize: T.caption.size, color: isOnline ? T.success : T.textMuted }}>
              {!isOnline
                ? 'Offline — chat needs internet'
                : inFlight > 0
                  ? `Oboafo is thinking… (${inFlight})`
                  : 'Ready'}
            </p>
          </div>
          <button
            type="button"
            onClick={clearConversation}
            disabled={messages.length === 0}
            title="Clear this conversation"
            style={{
              fontFamily: T.fontBody,
              fontSize: T.caption.size,
              fontWeight: 600,
              padding: '10px 14px',
              borderRadius: T.rFull,
              border: `1px solid ${T.border}`,
              background: T.bg,
              color: T.textSecondary,
              cursor: messages.length === 0 ? 'not-allowed' : 'pointer',
              opacity: messages.length === 0 ? 0.4 : 1,
              minHeight: 48,
            }}
          >
            New chat
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
          {showWelcome && (
            <div style={{ marginBottom: 24 }}>
              <div
                style={{
                  textAlign: 'center',
                  padding: `${T.sp(4)} ${T.sp(2)}`,
                  marginBottom: T.sp(3),
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: T.sp(2) }} aria-hidden>
                  🔥
                </div>
                <p
                  style={{
                    fontFamily: T.fontDisplay,
                    fontWeight: 600,
                    fontSize: T.h3.size,
                    color: T.primary,
                    margin: `0 0 ${T.sp(1)}`,
                  }}
                >
                  Ask me anything about your rights in Ghana
                </p>
                <p style={{ fontFamily: T.fontBody, fontSize: T.small.size, color: T.textSecondary, margin: 0 }}>
                  Choose a suggestion or type below.
                </p>
              </div>
              <SuggestedQuestions questions={DEFAULT_SUGGESTIONS} onSelect={sendMessage} layout="wrap" />
            </div>
          )}

          {messages.map((msg) => (
            <ChatMessageComponent
              key={msg.id}
              message={msg}
              isOnline={isOnline}
              onRetranslate={handleRetranslate}
              onTranslateUser={handleTranslateUser}
              onRetry={(() => {
                if (!msg.isError || !msg.pairedUserId) return undefined
                const user = messages.find(
                  (m) =>
                    m.id === msg.pairedUserId &&
                    m.role === 'user' &&
                    !!m.submittedText &&
                    !!m.inputLanguage,
                )
                if (!user) return undefined
                return () => {
                  void sendMessage(user.submittedText!, {
                    retry: true,
                    language: user.inputLanguage!,
                    removeErrorId: msg.id,
                    pairedUserId: user.id,
                  })
                }
              })()}
            />
          ))}
          <div ref={bottomRef} />
        </div>

        <div
          style={{
            borderTop: `1px solid ${T.border}`,
            background: T.surface,
            padding: `${T.sp(2)} 16px`,
            flexShrink: 0,
          }}
        >
          <form
            onSubmit={handleSubmit}
            style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}
          >
            <VoiceInput
              language={language}
              onTranscript={(text) => setInput(text)}
              disabled={!isOnline}
            />
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isOnline ? 'Type your question…' : 'Offline — open Crisis from the menu'}
              disabled={!isOnline}
              aria-label="Type your question"
              style={{
                flex: 1,
                minWidth: 120,
                minHeight: 48,
                background: T.bg,
                border: `1px solid ${T.border}`,
                borderRadius: T.rFull,
                color: T.text,
                padding: '12px 18px',
                fontSize: T.body.size,
                outline: 'none',
                transition: T.tx,
                fontFamily: T.fontBody,
              }}
              onFocus={(e) => {
                e.target.style.borderColor = T.accent
              }}
              onBlur={(e) => {
                e.target.style.borderColor = T.border
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || !isOnline}
              aria-label="Send question"
              style={{
                minWidth: 48,
                minHeight: 48,
                borderRadius: T.rFull,
                background: T.primary,
                color: T.surface,
                border: 'none',
                fontSize: '1.1rem',
                cursor: !input.trim() || !isOnline ? 'not-allowed' : 'pointer',
                opacity: !input.trim() || !isOnline ? 0.45 : 1,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
              }}
            >
              →
            </button>
          </form>
          {!isDesktop && (
            <div style={{ marginTop: 10 }}>
              <Disclaimer compact />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
