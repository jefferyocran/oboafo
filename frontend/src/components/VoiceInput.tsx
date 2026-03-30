/**
 * VoiceInput — microphone button with waveform visualization.
 *
 * Flow:
 * 1. User taps mic → request microphone permission
 * 2. Record audio via MediaRecorder
 * 3. Send audio to backend /api/transcribe (Khaya ASR)
 * 4. On transcript result → user confirms
 * 5. On confirm → call onTranscript(text)
 *
 * Falls back to text input when mic permission is denied or ASR fails.
 */
import { useState, useRef, useEffect } from 'react'
import { Waveform } from './Waveform'
import { T } from '../theme'
import type { Language } from '../types'
import { API_BASE } from '../config'

interface VoiceInputProps {
  language: Language
  onTranscript: (text: string) => void
  disabled?: boolean
}

type RecordState = 'idle' | 'recording' | 'transcribing' | 'confirming' | 'denied'

export function VoiceInput({ language, onTranscript, disabled }: VoiceInputProps) {
  const [state, setState] = useState<RecordState>('idle')
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string>('')
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const r = recorderRef.current
      if (r && r.state !== 'inactive') {
        r.stop()
      }
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [])

  function supportedMimeType(): string | undefined {
    if (typeof MediaRecorder === 'undefined' || typeof MediaRecorder.isTypeSupported !== 'function') {
      return undefined
    }
    const options = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4']
    return options.find((m) => MediaRecorder.isTypeSupported(m))
  }

  async function transcribeBlob(blob: Blob): Promise<void> {
    const form = new FormData()
    const ext = blob.type.includes('ogg') ? 'ogg' : blob.type.includes('mp4') ? 'm4a' : 'webm'
    form.append('audio', blob, `recording.${ext}`)

    const res = await fetch(`${API_BASE}/transcribe?language=${encodeURIComponent(language)}`, {
      method: 'POST',
      body: form,
    })
    const raw = await res.text()
    let parsed: { transcript?: string; detail?: string; error?: string } = {}
    try {
      parsed = raw ? (JSON.parse(raw) as typeof parsed) : {}
    } catch {
      /* keep parsed empty */
    }
    if (!res.ok) {
      const msg = parsed.detail || parsed.error || raw || `Transcription failed (${res.status})`
      throw new Error(msg)
    }
    const text = (parsed.transcript || '').trim()
    if (!text) {
      throw new Error('No transcript detected. Try speaking clearly and closer to the mic.')
    }
    setDraft(text)
    setState('confirming')
  }

  async function startRecording() {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('Mic recording is not supported in this browser.')
      setState('denied')
      return
    }

    try {
      setError('')
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      chunksRef.current = []

      const mimeType = supportedMimeType()
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream)
      recorderRef.current = recorder

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) chunksRef.current.push(event.data)
      }

      recorder.onstop = () => {
        const recorded = new Blob(chunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        })
        stream.getTracks().forEach((t) => t.stop())
        streamRef.current = null

        if (!recorded.size) {
          setError('No audio captured. Try again.')
          setState('idle')
          return
        }
        setState('transcribing')
        void transcribeBlob(recorded)
          .catch((e: unknown) => {
            const msg = e instanceof Error ? e.message : 'Could not transcribe audio.'
            setError(msg)
            setState('idle')
          })
          .finally(() => {
            recorderRef.current = null
            chunksRef.current = []
          })
      }

      recorder.start()
      setState('recording')
    } catch {
      setError('Microphone permission denied.')
      setState('denied')
    }
  }

  function stopRecording() {
    const recorder = recorderRef.current
    if (!recorder) return
    if (recorder.state !== 'inactive') recorder.stop()
  }

  function confirm() {
    onTranscript(draft)
    setDraft('')
    setError('')
    setState('idle')
  }

  function discard() {
    setDraft('')
    setError('')
    setState('idle')
  }

  if (state === 'denied') {
    return (
      <span style={{ fontSize: '0.75rem', color: T.text3, padding: '4px 6px' }}>
        {error || 'Mic blocked'}
      </span>
    )
  }

  if (state === 'confirming') {
    return (
      <div style={{
        position: 'absolute',
        bottom: '100%',
        left: 0, right: 0,
        background: T.surface2,
        border: `1px solid ${T.border}`,
        borderRadius: T.rLg,
        padding: '12px',
        marginBottom: '6px',
        zIndex: 10,
      }}>
        <p style={{ margin: '0 0 8px', color: T.text2, fontSize: '0.78rem' }}>
          Heard — is this right?
        </p>
        <p style={{ margin: '0 0 10px', color: T.text, fontSize: '0.9rem', fontStyle: 'italic' }}>
          "{draft}"
        </p>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={confirm} style={confirmBtn(T.accent, T.surface)}>
            Send
          </button>
          <button onClick={discard} style={confirmBtn(T.borderHi, T.text2)}>
            Discard
          </button>
        </div>
      </div>
    )
  }

  const isRecording = state === 'recording'
  const isTranscribing = state === 'transcribing'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
      <button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={disabled || isTranscribing}
        title={
          isTranscribing ? 'Transcribing audio...' : isRecording ? 'Stop recording' : 'Speak your question'
        }
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          border: `2px solid ${isRecording ? T.accent : T.borderHi}`,
          background: isRecording ? T.goldDim : 'transparent',
          color: isRecording ? T.primary : T.textMuted,
          cursor: disabled || isTranscribing ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: T.tx,
          opacity: disabled || isTranscribing ? 0.55 : 1,
          position: 'relative',
          animation: isRecording ? 'pulseRing 1.6s ease-out infinite' : 'none',
        }}
      >
        {isRecording ? (
          <Waveform active barCount={5} color={T.accent} />
        ) : isTranscribing ? (
          <span style={{ fontSize: '0.72rem', fontWeight: 700 }}>...</span>
        ) : (
          <span style={{ fontSize: '1.15rem' }}>🎙️</span>
        )}
      </button>
      {!isRecording && !isTranscribing && error ? (
        <span style={{ fontSize: '0.72rem', color: T.text3, maxWidth: 180, textAlign: 'center' }}>
          {error}
        </span>
      ) : null}
    </div>
  )
}

function confirmBtn(bg: string, color: string): React.CSSProperties {
  return {
    flex: 1,
    padding: '7px',
    background: bg,
    border: 'none',
    borderRadius: T.r,
    color,
    fontSize: '0.82rem',
    fontWeight: 600,
    cursor: 'pointer',
  }
}
