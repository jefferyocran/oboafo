import { useState } from 'react'
import type { AppPage } from './types'
import { LanguageProvider, useLanguage } from './context/LanguageContext'
import { AudioProvider } from './context/AudioContext'
import { LanguageSelector } from './components/LanguageSelector'
import { OfflineBanner } from './components/OfflineBanner'
import { BottomNav } from './components/BottomNav'
import { Chat } from './components/Chat'
import { HomePage } from './pages/HomePage'
import { BrowsePage } from './pages/BrowsePage'
import { CrisisPage } from './pages/CrisisPage'
import { TOPICS } from './data/topics'
import { useOnlineStatus } from './hooks/useOnlineStatus'
import { T } from './theme'

export default function App() {
  return (
    <LanguageProvider>
      <AudioProvider>
        <AppShell />
      </AudioProvider>
    </LanguageProvider>
  )
}

function AppShell() {
  const [page, setPage] = useState<AppPage>('home')
  const [browseTopicId, setBrowseTopicId] = useState<string | undefined>()
  const [chatPrefill, setChatPrefill] = useState<string | undefined>()
  const { language, setLanguage } = useLanguage()
  const isOnline = useOnlineStatus()

  function navigateTo(p: AppPage) {
    setPage(p)
  }

  function handleAskAbout(question: string) {
    setChatPrefill(question)
    setPage('chat')
  }

  function handleBrowseTopic(topicId: string) {
    setBrowseTopicId(topicId)
    setPage('browse')
  }

  return (
    <div style={{
      height: '100dvh',
      background: T.bg,
      color: T.text,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      maxWidth: '480px',
      margin: '0 auto',
      overflow: 'hidden',
      boxShadow: '0 0 60px rgba(0,0,0,0.5)',
    }}>
      <OfflineBanner isOnline={isOnline} />

      {/* Top header */}
      <header style={{
        padding: '10px 16px',
        borderBottom: `1px solid ${T.border}`,
        background: T.surface,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        flexShrink: 0,
      }}>
        <button
          onClick={() => setPage('home')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <span style={{ fontSize: '1.3rem' }}>🇬🇭</span>
          <div style={{ textAlign: 'left' }}>
            <div style={{ color: T.gold, fontWeight: 800, fontSize: '0.88rem' }}>Oboafo</div>
            <div style={{ color: T.text3, fontSize: '0.64rem' }}>Ghana Constitutional Rights</div>
          </div>
        </button>

        {/* 🌐 Language switcher */}
        <LanguageSelector language={language} onChange={setLanguage} />
      </header>

      {/* Page content */}
      <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {page === 'home' && (
          <HomePage isOnline={isOnline} onNavigate={navigateTo} />
        )}
        {(page === 'browse' || page === 'topic') && (
          <BrowsePage
            topics={TOPICS}
            initialTopicId={browseTopicId}
            onAskAbout={handleAskAbout}
          />
        )}
        {page === 'chat' && (
          <Chat
            language={language}
            isOnline={isOnline}
            prefillQuestion={chatPrefill}
            onPrefillConsumed={() => setChatPrefill(undefined)}
          />
        )}
        {page === 'crisis' && <CrisisPage />}
      </main>

      {/* Bottom navigation */}
      <BottomNav page={page} onNavigate={navigateTo} />
    </div>
  )
}
