import { T } from '../theme'

interface OboafoLogoProps {
  size?: 'sm' | 'md'
  showWordmark?: boolean
}

/** Stylized open hand + flame — knowledge passed on (flat, one-color friendly) */
export function OboafoLogo({ size = 'md', showWordmark = true }: OboafoLogoProps) {
  const iconPx = size === 'sm' ? 28 : 36
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: T.sp(1) }}>
      <svg width={iconPx} height={iconPx} viewBox="0 0 48 48" aria-hidden style={{ flexShrink: 0 }}>
        <path
          fill={T.primary}
          d="M22 8c1.2 3.2 0.8 6.4-1.2 9.2-1 1.4-1.4 3-1 4.6l-2.4 1.4c-0.6-2.4 0-5 1.6-7C21.4 14 22.4 11 22 8z"
        />
        <path
          fill={T.primary}
          d="M26 6c2 4 1 8.5-2 12-1.2 1.4-1.6 3.2-1.2 5l-2.6 1.2c-0.8-2.6 0-5.4 2-8C24.6 14 27 10 26 6z"
        />
        <path
          fill={T.accent}
          d="M24 14c2.5 2 3.8 5.2 3.2 8.4-0.3 1.6-1 3-2 4.2L22 25c1.4-1.8 2-4 1.6-6.2C23.2 16.8 23.4 15.2 24 14z"
        />
        <path
          fill={T.primary}
          d="M14 22c0-1.1 0.9-2 2-2h1v14h-2c-1.7 0-3-1.3-3-3V24c0-1.1 0.9-2 2-2zm6 0h4v14h-4V22zm8 0h3c1.1 0 2 0.9 2 2v7c0 1.7-1.3 3-3 3h-2V22z"
        />
        <ellipse cx="24" cy="40" rx="10" ry="2" fill={T.primary} opacity="0.12" />
      </svg>
      {showWordmark && (
        <span
          style={{
            fontFamily: T.fontDisplay,
            fontWeight: 700,
            fontSize: size === 'sm' ? '1.05rem' : '1.25rem',
            color: T.primary,
            letterSpacing: '-0.02em',
          }}
        >
          Oboafo
        </span>
      )}
    </span>
  )
}
