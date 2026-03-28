interface OfflineBannerProps {
  isOnline: boolean
}

export function OfflineBanner({ isOnline }: OfflineBannerProps) {
  if (isOnline) return null

  return (
    <div style={{
      background: '#b45309',
      color: '#fef3c7',
      padding: '8px 16px',
      textAlign: 'center',
      fontSize: '0.85rem',
      fontWeight: 500,
    }}>
      You're offline — Crisis Mode works anytime. Chat requires internet.
    </div>
  )
}
