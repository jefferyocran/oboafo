/**
 * Global audio manager — one stream at a time.
 * When the user taps Listen, we use Khaya TTS via POST /api/tts whenever Khaya is enabled
 * (VITE_TTS_USE_KHAYA is not `false`). Ghanaian languages map directly; English uses a Khaya
 * voice (default Twi engine) unless VITE_TTS_KHAYA_VOICE_FOR_EN=none|false.
 * Unknown language codes still call Khaya with the Twi voice.
 * If Khaya fails, we optionally fall back to Web Speech (VITE_TTS_BROWSER_FALLBACK=false disables).
 * Set VITE_TTS_USE_KHAYA=false to use only the browser for all playback.
 */
import { createContext, useContext, useRef, useState, useCallback } from 'react'
import { API_BASE } from '../config'
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

const USE_KHAYA_TTS = import.meta.env.VITE_TTS_USE_KHAYA !== 'false'
const BROWSER_FALLBACK_ON_KHAYA_ERROR = import.meta.env.VITE_TTS_BROWSER_FALLBACK !== 'false'

/** Language codes accepted by POST /api/tts → Khaya (see backend TTS_LANG_CODES). */
const KHAYA_TTS_CODES = new Set(['tw', 'ee', 'ga', 'dag'])

/**
 * Which Khaya voice to use when the content language is English (Khaya has no en TTS).
 * Defaults to `tw` so Listen still calls the Khaya API. Set VITE_TTS_KHAYA_VOICE_FOR_EN=none to use Web Speech for en.
 */
function khayaVoiceCodeForEnglish(): string | null {
  const raw = import.meta.env.VITE_TTS_KHAYA_VOICE_FOR_EN
  const lowered = raw?.trim().toLowerCase()
  if (lowered === 'none' || lowered === 'false') return null
  const code = (raw?.trim() || 'tw').toLowerCase()
  return KHAYA_TTS_CODES.has(code) ? code : null
}

/**
 * Resolves the `language` field sent to /api/tts, or null → Web Speech only (Khaya disabled).
 * Any unrecognized code still uses Khaya with the Twi engine so Listen always hits the API when Khaya is on.
 */
function resolveKhayaApiLanguage(uiLang: string): string | null {
  if (!USE_KHAYA_TTS) return null
  const l = uiLang.trim().toLowerCase()
  if (!l) return khayaVoiceCodeForEnglish()
  if (KHAYA_TTS_CODES.has(l)) return l
  if (l === 'en') return khayaVoiceCodeForEnglish()
  return 'tw'
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

      const runKhaya = async (apiLang: string) => {
        const ac = new AbortController()
        abortRef.current = ac
        try {
          const blob = await fetchKhayaTts(plain, apiLang, ac.signal)
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
            if (BROWSER_FALLBACK_ON_KHAYA_ERROR) {
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
            } else {
              setActiveId(null)
              setAudioState('idle')
            }
          }
          try {
            await audio.play()
          } catch {
            cleanupKhaya()
            if (BROWSER_FALLBACK_ON_KHAYA_ERROR) {
              speakWithWebSpeech(
                plain,
                lang,
                () => setAudioState('playing'),
                () => {
                  setActiveId(null)
                  setAudioState('idle')
                },
              )
            } else {
              setActiveId(null)
              setAudioState('idle')
            }
            return
          }
        } catch {
          if (ac.signal.aborted) return
          cleanupKhaya()
          if (BROWSER_FALLBACK_ON_KHAYA_ERROR) {
            speakWithWebSpeech(
              plain,
              lang,
              () => setAudioState('playing'),
              () => {
                setActiveId(null)
                setAudioState('idle')
              },
            )
          } else {
            setActiveId(null)
            setAudioState('idle')
          }
        }
      }

      const khayaApiLang = resolveKhayaApiLanguage(lang)
      if (khayaApiLang) {
        void runKhaya(khayaApiLang)
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
