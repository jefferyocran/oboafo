/**
 * Animated waveform — shown while recording or audio is playing.
 * Pure CSS animation, no dependencies.
 */
interface WaveformProps {
  active: boolean
  color?: string
  barCount?: number
}

export function Waveform({ active, color = '#d4a843', barCount = 7 }: WaveformProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '20px' }}>
      {Array.from({ length: barCount }).map((_, i) => (
        <div
          key={i}
          style={{
            width: '3px',
            borderRadius: '2px',
            background: color,
            height: active ? undefined : '4px',
            animation: active
              ? `waveBar 0.8s ease-in-out ${(i * 0.1).toFixed(1)}s infinite alternate`
              : 'none',
            minHeight: '4px',
            maxHeight: '20px',
            opacity: active ? 1 : 0.3,
            transition: 'opacity 0.2s',
          }}
        />
      ))}
      <style>{`
        @keyframes waveBar {
          from { height: 4px; }
          to   { height: 20px; }
        }
      `}</style>
    </div>
  )
}
