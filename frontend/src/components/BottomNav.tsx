import { NavLink } from 'react-router-dom'
import { T } from '../theme'

interface BottomNavProps {
  onOpenLanguage: () => void
}

export function BottomNav({ onOpenLanguage }: BottomNavProps) {
  const item = (to: string, end: boolean | undefined, emoji: string, label: string) => (
    <NavLink to={to} end={end} style={{ flex: 1, textDecoration: 'none' }}>
      {({ isActive }) => (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            minHeight: 56,
            padding: '8px 4px',
            background: isActive ? T.goldDim : 'transparent',
            border: 'none',
            borderTop: isActive ? `3px solid ${T.accent}` : '3px solid transparent',
            cursor: 'pointer',
            color: isActive ? T.primary : T.textMuted,
            fontFamily: T.fontBody,
          }}
        >
          <span style={{ fontSize: '1.2rem' }} aria-hidden>
            {emoji}
          </span>
          <span style={{ fontSize: 11, fontWeight: isActive ? 700 : 500 }}>{label}</span>
        </div>
      )}
    </NavLink>
  )

  return (
    <nav
      aria-label="Mobile primary"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        borderTop: `1px solid ${T.border}`,
        background: T.surface,
        zIndex: 90,
        paddingBottom: 'env(safe-area-inset-bottom)',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.06)',
      }}
    >
      {item('/', true, '🏠', 'Home')}
      {item('/learn', false, '📚', 'Learn')}
      {item('/ask', false, '💬', 'Ask')}
      {item('/crisis', false, '🆘', 'Crisis')}
      <button
        type="button"
        onClick={onOpenLanguage}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          minHeight: 56,
          padding: '8px 4px',
          background: 'transparent',
          border: 'none',
          borderTop: '3px solid transparent',
          cursor: 'pointer',
          color: T.textMuted,
          fontFamily: T.fontBody,
        }}
        aria-label="Choose language"
      >
        <span style={{ fontSize: '1.2rem' }} aria-hidden>
          🌐
        </span>
        <span style={{ fontSize: 11, fontWeight: 500 }}>Language</span>
      </button>
    </nav>
  )
}
