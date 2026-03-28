import type { AppPage } from '../types'
import { T } from '../theme'

interface BottomNavProps {
  page: AppPage
  onNavigate: (page: AppPage) => void
}

const NAV_ITEMS: { page: AppPage; emoji: string; label: string; highlight?: boolean }[] = [
  { page: 'home',   emoji: '🏠', label: 'Home' },
  { page: 'browse', emoji: '📚', label: 'Browse' },
  { page: 'chat',   emoji: '💬', label: 'Ask Oboafo' },
  { page: 'crisis', emoji: '🆘', label: 'Crisis', highlight: true },
]

export function BottomNav({ page, onNavigate }: BottomNavProps) {
  return (
    <nav style={{
      display: 'flex',
      borderTop: `1px solid ${T.border}`,
      background: T.surface,
      flexShrink: 0,
    }}>
      {NAV_ITEMS.map(item => {
        const active = page === item.page || (page === 'topic' && item.page === 'browse')
        const color = item.highlight ? T.red : active ? T.gold : T.text3
        return (
          <button
            key={item.page}
            onClick={() => onNavigate(item.page)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              padding: '10px 4px 8px',
              background: active ? (item.highlight ? T.redDim : T.goldDim) : 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: T.tx,
              borderTop: active ? `2px solid ${color}` : '2px solid transparent',
            }}
          >
            <span style={{ fontSize: '1.15rem' }}>{item.emoji}</span>
            <span style={{ fontSize: '0.65rem', fontWeight: active ? 700 : 400, color, letterSpacing: '0.01em' }}>
              {item.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
