import { useState } from 'react'
import type { Language, AppView } from './types'
import { LanguageSelector } from './components/LanguageSelector'
import { OfflineBanner } from './components/OfflineBanner'
import { CrisisButtons } from './components/CrisisButtons'
import { Chat } from './components/Chat'
import { useOnlineStatus } from './hooks/useOnlineStatus'

export default function App() {
  const [language, setLanguage] = useState<Language>('en')
  const [view, setView] = useState<AppView>('home')
  const isOnline = useOnlineStatus()

  return (
    <div style={{
      minHeight: '100dvh',
      background: '#0d1117',
      color: '#e5e7eb',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      display: 'flex',
      flexDirection: 'column',
      maxWidth: '480px',
      margin: '0 auto',
    }}>
      <OfflineBanner isOnline={isOnline} />

      {/* Header */}
      <header style={{
        padding: '16px',
        borderBottom: '1px solid #1f2937',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
      }}>
        <button
          onClick={() => setView('home')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <span style={{ fontSize: '1.4rem' }}>🇬🇭</span>
          <div>
            <div style={{ color: '#d4a843', fontWeight: 700, fontSize: '0.95rem', textAlign: 'left' }}>Ghana Rights</div>
            <div style={{ color: '#6b7280', fontSize: '0.7rem' }}>1992 Constitution</div>
          </div>
        </button>
        <LanguageSelector language={language} onChange={setLanguage} />
      </header>

      {/* Main content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {view === 'home' && (
          <HomeView
            onStartChat={() => setView('chat')}
            language={language}
            isOnline={isOnline}
          />
        )}
        {view === 'chat' && (
          <Chat language={language} isOnline={isOnline} />
        )}
      </main>
    </div>
  )
}

function HomeView({
  onStartChat,
  language,
  isOnline,
}: {
  onStartChat: () => void
  language: Language
  isOnline: boolean
}) {
  return (
    <div style={{ padding: '20px 16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Hero */}
      <div>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f9fafb', margin: '0 0 6px' }}>
          Know Your Rights
        </h1>
        <p style={{ color: '#9ca3af', fontSize: '0.9rem', margin: 0, lineHeight: 1.5 }}>
          Instant, free legal guidance based on the 1992 Constitution of Ghana. Works offline for crisis situations.
        </p>
      </div>

      {/* Chat CTA */}
      <button
        onClick={onStartChat}
        disabled={!isOnline}
        title={!isOnline ? 'Chat requires internet connection' : ''}
        style={{
          background: isOnline ? '#1a3a5c' : '#1a1f2e',
          border: `1px solid ${isOnline ? '#2563eb' : '#374151'}`,
          borderRadius: '12px',
          padding: '16px',
          cursor: isOnline ? 'pointer' : 'not-allowed',
          textAlign: 'left',
          opacity: isOnline ? 1 : 0.6,
          transition: 'all 0.15s',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <span style={{ fontSize: '1.3rem' }}>💬</span>
          <span style={{ color: '#93c5fd', fontWeight: 700, fontSize: '0.95rem' }}>
            Ask a Legal Question
          </span>
          {!isOnline && <span style={{ fontSize: '0.7rem', color: '#f87171', marginLeft: 'auto' }}>Needs WiFi</span>}
        </div>
        <p style={{ margin: 0, color: '#6b7280', fontSize: '0.85rem' }}>
          "Can police search me without a warrant?" — AI explains your rights with cited articles.
        </p>
      </button>

      {/* Crisis Mode */}
      <CrisisButtons language={language} />

      {/* Footer disclaimer */}
      <p style={{ color: '#374151', fontSize: '0.72rem', textAlign: 'center', lineHeight: 1.5 }}>
        This app provides general legal information based on the 1992 Constitution of Ghana.
        It is not a substitute for professional legal advice.
        In an emergency, call the Ghana Police Service at 191.
      </p>
    </div>
  )
}
