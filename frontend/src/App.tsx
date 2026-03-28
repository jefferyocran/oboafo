import { useState } from 'react'
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import { LanguageProvider } from './context/LanguageContext'
import { AudioProvider } from './context/AudioContext'
import { MainNav } from './components/MainNav'
import { SiteFooter } from './components/SiteFooter'
import { OfflineBanner } from './components/OfflineBanner'
import { BottomNav } from './components/BottomNav'
import { LanguageSheet } from './components/LanguageSheet'
import { LandingPage } from './pages/LandingPage'
import { LearnPage } from './pages/LearnPage'
import { TopicRoute } from './pages/TopicRoute'
import { AskPage } from './pages/AskPage'
import { CrisisPage } from './pages/CrisisPage'
import { useOnlineStatus } from './hooks/useOnlineStatus'
import { useMediaQuery } from './hooks/useMediaQuery'
import { T } from './theme'

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AudioProvider>
          <AppRoutes />
        </AudioProvider>
      </LanguageProvider>
    </BrowserRouter>
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/learn" element={<LearnPage />} />
        <Route path="/topic/:topicId" element={<TopicRoute />} />
        <Route path="/ask" element={<AskPage />} />
        <Route path="/crisis" element={<CrisisPage />} />
      </Route>
    </Routes>
  )
}

function RootLayout() {
  const isOnline = useOnlineStatus()
  const isMobile = useMediaQuery('(max-width: 767px)')
  const [langOpen, setLangOpen] = useState(false)

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        background: T.bg,
        color: T.text,
      }}
    >
      <MainNav />
      <OfflineBanner isOnline={isOnline} />
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          paddingBottom: isMobile ? 64 : 0,
        }}
      >
        <Outlet />
      </main>
      <SiteFooter />
      {isMobile && <BottomNav onOpenLanguage={() => setLangOpen(true)} />}
      {langOpen && <LanguageSheet onClose={() => setLangOpen(false)} />}
    </div>
  )
}
