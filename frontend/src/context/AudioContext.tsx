/**
 * Global Audio Manager — enforces only one audio stream playing at a time.
 * TTS uses the Web Speech API (instant, no backend call) for all languages.
 * Khaya TTS can be swapped in by replacing the speak() implementation.
 */
import { createContext, useContext, useRef, useState, useCallback } from 'react'
import type { AudioState } from '../types'

interface AudioContextValue {
  /** ID of the currently active audio item (null if nothing playing) */
  activeId: string | null
  /** State of the currently active audio */
  audioState: AudioState
  /** Speak a text string. Pass a unique id to track which item is active. */
  speak: (id: string, text: string, lang?: string) => void
  /** Stop whatever is currently playing */
  stop: () => void
}

const AudioCtx = createContext<AudioContextValue>({
  activeId: null,
  audioState: 'idle',
  speak: () => {},
  stop: () => {},
})

// Map app language codes → BCP-47 for Web Speech API
const SPEECH_LANG: Record<string, string> = {
  en: 'en-GH',
  tw: 'ak',      // Akan — limited browser support, falls back to en
  ee: 'ee',
  ga: 'gaa',
  dag: 'dag',
}

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [audioState, setAudioState] = useState<AudioState>('idle')
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel()
    setActiveId(null)
    setAudioState('idle')
  }, [])

  const speak = useCallback((id: string, text: string, lang = 'en') => {
    // If same item is playing, toggle off
    if (activeId === id && audioState === 'playing') {
      stop()
      return
    }

    // Cancel any existing audio first
    window.speechSynthesis?.cancel()

    if (!window.speechSynthesis) return

    setActiveId(id)
    setAudioState('loading')

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = SPEECH_LANG[lang] ?? 'en-GH'
    utterance.rate = 0.9

    utterance.onstart = () => setAudioState('playing')
    utterance.onend = () => {
      setActiveId(null)
      setAudioState('idle')
    }
    utterance.onerror = () => {
      setActiveId(null)
      setAudioState('idle')
    }

    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }, [activeId, audioState, stop])

  return (
    <AudioCtx.Provider value={{ activeId, audioState, speak, stop }}>
      {children}
    </AudioCtx.Provider>
  )
}

export function useAudio() {
  return useContext(AudioCtx)
}
