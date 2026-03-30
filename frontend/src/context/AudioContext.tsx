/**
 * Global audio manager — one stream at a time.
 * Khaya TTS: POST /api/tts when VITE_TTS_USE_KHAYA is not `false`.
 * Playback uses the Web Audio API after unlocking AudioContext in the same synchronous
 * user gesture as the button tap — otherwise `HTMLAudioElement.play()` often fails after
 * `await fetch` (Safari / strict autoplay), and we incorrectly fell back to Web Speech.
 * If Khaya fails, optionally fall back to Web Speech (VITE_TTS_BROWSER_FALLBACK=false disables).
 */
import {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  type MutableRefObject,
} from 'react'
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
const KHAYA_TTS_MAX_CHARS_PER_CHUNK = (() => {
  const raw = import.meta.env.VITE_TTS_KHAYA_CHUNK_CHARS
  const parsed = Number.parseInt((raw || '').trim(), 10)
  if (!Number.isFinite(parsed)) return 300
  // Keep chunk size in a safe range for Khaya stability.
  return Math.min(450, Math.max(120, parsed))
})()

/** Language codes accepted by POST /api/tts → Khaya (see backend TTS_LANG_CODES). */
const KHAYA_TTS_CODES = new Set(['tw', 'ee', 'ga'])

function canUseBrowserTts(lang: string): boolean {
  return (lang || '').trim().toLowerCase() === 'en'
}

function khayaVoiceCodeForEnglish(): string | null {
  const raw = import.meta.env.VITE_TTS_KHAYA_VOICE_FOR_EN
  const lowered = raw?.trim().toLowerCase()
  if (lowered === 'none' || lowered === 'false') return null
  const code = (raw?.trim() || 'tw').toLowerCase()
  return KHAYA_TTS_CODES.has(code) ? code : null
}

function resolveKhayaApiLanguage(uiLang: string): string | null {
  if (!USE_KHAYA_TTS) return null
  const l = uiLang.trim().toLowerCase()
  if (!l) return khayaVoiceCodeForEnglish()
  if (KHAYA_TTS_CODES.has(l)) return l
  if (l === 'en') return khayaVoiceCodeForEnglish()
  return 'tw'
}

const SPEECH_LANG: Record<string, string> = {
  en: 'en-GH',
  tw: 'ak',
  ee: 'ee',
  ga: 'gaa',
}

let sharedAudioContext: AudioContext | null = null

function getOrCreateAudioContext(): AudioContext {
  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) {
    throw new Error('Web Audio API not supported')
  }
  if (!sharedAudioContext || sharedAudioContext.state === 'closed') {
    sharedAudioContext = new Ctor()
  }
  return sharedAudioContext
}

/**
 * Must run synchronously inside the click/tap handler (no await before this) so Safari and
 * other browsers keep the gesture for later decodeAudioData / playback.
 */
function unlockWebAudioFromUserGesture(): void {
  try {
    const ctx = getOrCreateAudioContext()
    if (ctx.state === 'suspended') {
      void ctx.resume()
    }
  } catch {
    /* ignore — Khaya path will try HTMLAudio fallback */
  }
}

function stripForTts(text: string): string {
  if (!text) return ''
  let t = text.replace(/\*\*/g, '').replace(/__/g, '')
  t = t.replace(/^\s*[-•*]{1,4}\s+/gm, '')
  t = t.replace(/\n{3,}/g, '\n\n').trim()
  return t
}

function chunkForKhayaTts(text: string, maxChars = KHAYA_TTS_MAX_CHARS_PER_CHUNK): string[] {
  const cleaned = stripForTts(text)
  if (!cleaned) return []
  if (cleaned.length <= maxChars) return [cleaned]

  const parts: string[] = []
  const paragraphs = cleaned.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
  const sentenceSplit = /(?<=[.!?])\s+/

  const pushSized = (value: string) => {
    const v = value.trim()
    if (!v) return
    if (v.length <= maxChars) {
      parts.push(v)
      return
    }
    const sentences = v.split(sentenceSplit).map((s) => s.trim()).filter(Boolean)
    let buf = ''
    for (const s of sentences) {
      if (!buf) {
        if (s.length <= maxChars) {
          buf = s
        } else {
          for (let i = 0; i < s.length; i += maxChars) {
            parts.push(s.slice(i, i + maxChars))
          }
        }
        continue
      }
      const next = `${buf} ${s}`
      if (next.length <= maxChars) {
        buf = next
      } else {
        parts.push(buf)
        if (s.length <= maxChars) {
          buf = s
        } else {
          for (let i = 0; i < s.length; i += maxChars) {
            parts.push(s.slice(i, i + maxChars))
          }
          buf = ''
        }
      }
    }
    if (buf) parts.push(buf)
  }

  for (const para of paragraphs) pushSized(para)
  return parts.length ? parts : [cleaned.slice(0, maxChars)]
}

async function fetchKhayaTtsBuffer(
  text: string,
  language: string,
  signal: AbortSignal,
): Promise<ArrayBuffer> {
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
  const buf = await res.arrayBuffer()
  if (buf.byteLength < 32) {
    throw new Error('TTS response empty or too small')
  }
  // Khaya returns binary; JSON errors sometimes slip through as 200 with small bodies
  if (new Uint8Array(buf)[0] === 0x7b) {
    throw new Error('TTS returned JSON instead of audio')
  }
  return buf
}

async function playBufferWithHtmlAudio(
  buffer: ArrayBuffer,
  audioElRef: MutableRefObject<HTMLAudioElement | null>,
  blobUrlRef: MutableRefObject<string | null>,
  signal: AbortSignal,
  onPlay: () => void,
): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const h = new Uint8Array(buffer.slice(0, 4))
    const isWav = h[0] === 0x52 && h[1] === 0x49 && h[2] === 0x46 && h[3] === 0x46 // RIFF
    const mime = isWav ? 'audio/wav' : 'audio/mpeg'
    const blob = new Blob([buffer], { type: mime })
    const url = URL.createObjectURL(blob)
    blobUrlRef.current = url
    const audio = new Audio(url)
    audioElRef.current = audio

    const onAbort = () => {
      cleanup()
      try {
        audio.pause()
      } catch {
        /* ignore */
      }
      reject(new Error('Playback aborted'))
    }

    const cleanup = () => {
      signal.removeEventListener('abort', onAbort)
      audio.onplay = null
      audio.onended = null
      audio.onerror = null
    }

    signal.addEventListener('abort', onAbort, { once: true })
    audio.onplay = onPlay
    audio.onended = () => {
      cleanup()
      resolve()
    }
    audio.onerror = () => {
      cleanup()
      reject(new Error('HTML audio playback failed'))
    }
    void audio.play().catch((e) => {
      cleanup()
      reject(e)
    })
  })
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
  const bufferSourceRef = useRef<AudioBufferSourceNode | null>(null)

  const cleanupKhaya = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    const src = bufferSourceRef.current
    if (src) {
      try {
        src.stop(0)
      } catch {
        /* already stopped */
      }
      try {
        src.disconnect()
      } catch {
        /* ignore */
      }
      bufferSourceRef.current = null
    }
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

      const fallbackToBrowser = () => {
        if (BROWSER_FALLBACK_ON_KHAYA_ERROR && canUseBrowserTts(lang)) {
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

      const runKhaya = async (apiLang: string) => {
        const ac = new AbortController()
        abortRef.current = ac
        try {
          const chunks = chunkForKhayaTts(plain)
          for (let i = 0; i < chunks.length; i += 1) {
            const chunk = chunks[i]
            const buffer = await fetchKhayaTtsBuffer(chunk, apiLang, ac.signal)
            if (ac.signal.aborted) return

            const ctx = getOrCreateAudioContext()
            let decoded: AudioBuffer | null = null
            try {
              decoded = await ctx.decodeAudioData(buffer.slice(0))
            } catch {
              decoded = null
            }
            if (ac.signal.aborted) return

            if (decoded) {
              await new Promise<void>((resolve, reject) => {
                const source = ctx.createBufferSource()
                bufferSourceRef.current = source
                source.buffer = decoded
                source.connect(ctx.destination)

                const onAbort = () => {
                  cleanup()
                  try {
                    source.stop(0)
                  } catch {
                    /* ignore */
                  }
                  reject(new Error('Playback aborted'))
                }

                const cleanup = () => {
                  ac.signal.removeEventListener('abort', onAbort)
                  source.onended = null
                  try {
                    source.disconnect()
                  } catch {
                    /* ignore */
                  }
                  if (bufferSourceRef.current === source) bufferSourceRef.current = null
                }

                ac.signal.addEventListener('abort', onAbort, { once: true })
                source.onended = () => {
                  cleanup()
                  resolve()
                }
                setAudioState('playing')
                try {
                  source.start(0)
                } catch (e) {
                  cleanup()
                  reject(e instanceof Error ? e : new Error('AudioBufferSource start failed'))
                }
              })
            } else {
              await playBufferWithHtmlAudio(
                buffer,
                audioElRef,
                blobUrlRef,
                ac.signal,
                () => setAudioState('playing'),
              )
            }
          }
        } catch {
          if (ac.signal.aborted) {
            if (abortRef.current === ac) abortRef.current = null
            return
          }
          const remaining = chunkForKhayaTts(plain).join(' ')
          cleanupKhaya()
          if (BROWSER_FALLBACK_ON_KHAYA_ERROR && canUseBrowserTts(lang)) {
            setAudioState('loading')
            speakWithWebSpeech(
              remaining,
              lang,
              () => setAudioState('playing'),
              () => {
                setActiveId(null)
                setAudioState('idle')
              },
            )
          } else {
            fallbackToBrowser()
          }
          return
        }
        cleanupKhaya()
        setActiveId(null)
        setAudioState('idle')
      }

      const khayaApiLang = resolveKhayaApiLanguage(lang)
      if (khayaApiLang) {
        unlockWebAudioFromUserGesture()
        void runKhaya(khayaApiLang)
      } else if (canUseBrowserTts(lang)) {
        // Browser speech is intentionally limited to English only.
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
