import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Chat } from '../components/Chat'
import { useLanguage } from '../context/LanguageContext'
import { useOnlineStatus } from '../hooks/useOnlineStatus'

export function AskPage() {
  const { language } = useLanguage()
  const isOnline = useOnlineStatus()
  const location = useLocation()
  const navigate = useNavigate()
  const [prefill, setPrefill] = useState<string | undefined>(undefined)

  useEffect(() => {
    const state = location.state as { prefillQuestion?: string } | null
    if (state?.prefillQuestion) {
      setPrefill(state.prefillQuestion)
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.pathname, location.state, navigate])

  return (
    <Chat
      language={language}
      isOnline={isOnline}
      prefillQuestion={prefill}
      onPrefillConsumed={() => setPrefill(undefined)}
    />
  )
}
