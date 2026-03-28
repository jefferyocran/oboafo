/**
 * Listen button — reads any text aloud via the global AudioContext.
 * Pass a unique `id` and the `text` to read. Uses current app language.
 */
import { useAudio } from '../context/AudioContext'
import { useLanguage } from '../context/LanguageContext'
import { Waveform } from './Waveform'
import { T } from '../theme'

interface AudioButtonProps {
  id: string
  text: string
  label?: string
  size?: 'sm' | 'md'
}

export function AudioButton({ id, text, label, size = 'md' }: AudioButtonProps) {
  const { speak, activeId, audioState } = useAudio()
  const { language } = useLanguage()

  const isThisPlaying = activeId === id && audioState === 'playing'
  const isThisLoading = activeId === id && audioState === 'loading'

  const pad = size === 'sm' ? '5px 10px' : '7px 14px'
  const fs  = size === 'sm' ? '0.75rem' : '0.82rem'

  return (
    <button
      onClick={() => speak(id, text, language)}
      title={isThisPlaying ? 'Stop' : 'Listen'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: pad,
        background: isThisPlaying ? T.goldDim : 'transparent',
        border: `1px solid ${isThisPlaying ? T.gold : T.borderHi}`,
        borderRadius: T.rFull,
        color: isThisPlaying ? T.gold : T.text3,
        fontSize: fs,
        cursor: 'pointer',
        transition: T.tx,
        flexShrink: 0,
      }}
    >
      {isThisLoading ? (
        <span style={{ opacity: 0.6 }}>…</span>
      ) : isThisPlaying ? (
        <>
          <Waveform active barCount={5} color={T.gold} />
          <span>Stop</span>
        </>
      ) : (
        <>
          <span>🔊</span>
          {label && <span>{label}</span>}
        </>
      )}
    </button>
  )
}
