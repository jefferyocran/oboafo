/**
 * Global audio manager — one stream at a time.
 * Prefers Khaya TTS via POST /api/tts (Ghanaian voices); falls back to Web Speech API on failure.
 * Set VITE_TTS_USE_KHAYA=false to use only the browser.
 */
import { createContext, useContext, useRef, useState, useCallback } from 'react'
import type { AudioState } from '../types'

interface AudioContextValue {
  activeId: string | null
  audioState: AudioState
  speak: (id: string, text: string, lang?: string) => void
  stop: () => void
}

const AudioCtx = createContext<AudioContextValue>({
  activeId: null,
  audioState: 'idle',
  speak: () => {},
  stop: () => {},
})

const API_BASE = '/api'

const USE_KHAYA_TTS = import.meta.env.VITE_TTS_USE_KHAYA !== 'false'

/** Khaya TTS supports Twi, Ewe, Ga (not English — use Web Speech). */
function shouldUseKhayaBackend(lang: string): boolean {
  return USE_KHAYA_TTS && lang !== 'en'
}

// Map app language codes → BCP-47 for Web Speech API fallback
const SPEECH_LANG: Record<string, string> = {
  en: 'en-GH',
  tw: 'ak',
  ee: 'ee',
  ga: 'gaa',
  dag: 'en-GH',
}

/** Strip markdown-ish noise so TTS reads more naturally. */
function stripForTts(text: string): string {
  if (!text) return ''
  let t = text.replace(/\*\*/g, '').replace(/__/g, '')
  t = t.replace(/^\s*[-•*]{1,4}\s+/gm, '')
  t = t.replace(/\n{3,}/g, '\n\n').trim()
  return t
}

async function fetchKhayaTts(
  text: string,
  language: string,
  signal: AbortSignal,
): Promise<Blob> {
  const res = await fetch(`${API_BASE}/tts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, language }),
    signal,
  })
  if (!res.ok) {
    let msg = res.statusText
    try {
      const raw = await res.text()
      const j = JSON.parse(raw) as { detail?: string }
      if (typeof j?.detail === 'string') msg = j.detail
      else if (raw) msg = raw.slice(0, 200)
    } catch {
      /* keep msg */
    }
    throw new Error(msg)
  }
  return res.blob()
}

function speakWithWebSpeech(
  text: string,
  lang: string,
  onStart: () => void,
  onDone: () => void,
): void {
  if (!window.speechSynthesis) {
    onDone()
    return
  }
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = SPEECH_LANG[lang] ?? 'en-GH'
  utterance.rate = 0.9
  utterance.onstart = onStart
  utterance.onend = onDone
  utterance.onerror = onDone
  window.speechSynthesis.speak(utterance)
}

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [audioState, setAudioState] = useState<AudioState>('idle')
  const abortRef = useRef<AbortController | null>(null)
  const blobUrlRef = useRef<string | null>(null)
  const audioElRef = useRef<HTMLAudioElement | null>(null)

  const cleanupKhaya = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    const el = audioElRef.current
    if (el) {
      el.pause()
      el.removeAttribute('src')
      el.load()
      audioElRef.current = null
    }
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current)
      blobUrlRef.current = null
    }
  }, [])

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel()
    cleanupKhaya()
    setActiveId(null)
    setAudioState('idle')
  }, [cleanupKhaya])

  const speak = useCallback(
    (id: string, text: string, lang = 'en') => {
      if (activeId === id && (audioState === 'playing' || audioState === 'loading')) {
        stop()
        return
      }

      stop()

      const plain = stripForTts(text)
      if (!plain) return

      setActiveId(id)
      setAudioState('loading')

      const runKhaya = async () => {
        const ac = new AbortController()
        abortRef.current = ac
        try {
          const blob = await fetchKhayaTts(plain, lang, ac.signal)
          if (ac.signal.aborted) return
          const url = URL.createObjectURL(blob)
          blobUrlRef.current = url
          const audio = new Audio(url)
          audioElRef.current = audio
          audio.onplay = () => setAudioState('playing')
          audio.onended = () => {
            cleanupKhaya()
            setActiveId(null)
            setAudioState('idle')
          }
          audio.onerror = () => {
            cleanupKhaya()
            setAudioState('loading')
            speakWithWebSpeech(
              plain,
              lang,
              () => setAudioState('playing'),
              () => {
                setActiveId(null)
                setAudioState('idle')
              },
            )
          }
          try {
            await audio.play()
          } catch {
            cleanupKhaya()
            speakWithWebSpeech(
              plain,
              lang,
              () => setAudioState('playing'),
              () => {
                setActiveId(null)
                setAudioState('idle')
              },
            )
            return
          }
        } catch {
          if (ac.signal.aborted) return
          cleanupKhaya()
          speakWithWebSpeech(
            plain,
            lang,
            () => setAudioState('playing'),
            () => {
              setActiveId(null)
              setAudioState('idle')
            },
          )
        }
      }

      if (shouldUseKhayaBackend(lang)) {
        void runKhaya()
      } else {
        speakWithWebSpeech(
          plain,
          lang,
          () => setAudioState('playing'),
          () => {
            setActiveId(null)
            setAudioState('idle')
          },
        )
      }
    },
    [activeId, audioState, stop, cleanupKhaya],
  )

  return (
    <AudioCtx.Provider value={{ activeId, audioState, speak, stop }}>
      {children}
    </AudioCtx.Provider>
  )
}

export function useAudio() {
  return useContext(AudioCtx)
}
