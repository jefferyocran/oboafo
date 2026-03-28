/**
 * VoiceInput — microphone button with waveform visualization.
 *
 * Flow:
 * 1. User taps mic → request microphone permission
 * 2. Record audio via MediaRecorder
 * 3. Show animated waveform while recording
 * 4. On stop → display transcription for user confirmation
 * 5. On confirm → call onTranscript(text)
 *
 * Uses Web Speech API for transcription (works in Chrome, no backend needed).
 * Falls back to text input message if mic is denied.
 */
import { useState, useRef, useEffect } from 'react'
import { Waveform } from './Waveform'
import { T } from '../theme'
import type { Language } from '../types'

interface VoiceInputProps {
  language: Language
  onTranscript: (text: string) => void
  disabled?: boolean
}

// Web Speech API language map
const SPEECH_LANG: Record<Language, string> = {
  en: 'en-GH',
  tw: 'ak-GH',
  ee: 'ee-GH',
  ga: 'gaa-GH',
}

type RecordState = 'idle' | 'recording' | 'confirming' | 'denied'

export function VoiceInput({ language, onTranscript, disabled }: VoiceInputProps) {
  const [state, setState] = useState<RecordState>('idle')
  const [draft, setDraft] = useState('')
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop()
    }
  }, [])

  function startRecording() {
    const SpeechRecognition =
      (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      // Browser doesn't support speech recognition
      setState('denied')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = SPEECH_LANG[language] ?? 'en-GH'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const text = event.results[0][0].transcript
      setDraft(text)
      setState('confirming')
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'not-allowed') {
        setState('denied')
      } else {
        setState('idle')
      }
    }

    recognition.onend = () => {
      if (state === 'recording') setState('idle')
    }

    recognitionRef.current = recognition
    recognition.start()
    setState('recording')
  }

  function stopRecording() {
    recognitionRef.current?.stop()
    setState('idle')
  }

  function confirm() {
    onTranscript(draft)
    setDraft('')
    setState('idle')
  }

  function discard() {
    setDraft('')
    setState('idle')
  }

  if (state === 'denied') {
    return (
      <span style={{ fontSize: '0.75rem', color: T.text3, padding: '4px 6px' }}>
        Mic blocked
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

  return (
    <button
      onClick={isRecording ? stopRecording : startRecording}
      disabled={disabled}
      title={isRecording ? 'Stop recording' : 'Speak your question'}
      style={{
        width: 48,
        height: 48,
        borderRadius: '50%',
        border: `2px solid ${isRecording ? T.accent : T.borderHi}`,
        background: isRecording ? T.goldDim : 'transparent',
        color: isRecording ? T.primary : T.textMuted,
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        transition: T.tx,
        opacity: disabled ? 0.4 : 1,
        position: 'relative',
        animation: isRecording ? 'pulseRing 1.6s ease-out infinite' : 'none',
      }}
    >
      {isRecording ? <Waveform active barCount={5} color={T.accent} /> : <span style={{ fontSize: '1.15rem' }}>🎙️</span>}
    </button>
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
