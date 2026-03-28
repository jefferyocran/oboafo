import { T } from '../theme'

interface OfflineBannerProps {
  isOnline: boolean
}

export function OfflineBanner({ isOnline }: OfflineBannerProps) {
  if (isOnline) return null

  return (
    <div
      style={{
        background: T.warning,
        color: T.surface,
        padding: `${T.sp(1)} 16px`,
        textAlign: 'center',
        fontSize: T.small.size,
        fontWeight: 600,
        fontFamily: T.fontBody,
      }}
    >
      You&apos;re offline — Crisis still works. Chat needs internet.
    </div>
  )
}
