import { T } from '../theme'

interface DisclaimerProps {
  compact?: boolean
}

export function Disclaimer({ compact }: DisclaimerProps) {
  if (compact) {
    return (
      <p
        style={{
          color: T.textSecondary,
          fontSize: 14,
          textAlign: 'center',
          lineHeight: T.small.lh,
          margin: 0,
          fontFamily: T.fontBody,
        }}
      >
        Oboafo is an educator, not a lawyer. Legal Aid (toll-free):{' '}
        <strong style={{ color: T.text }}>0800-100-060</strong>
      </p>
    )
  }

  return (
    <div
      style={{
        background: T.disclaimerBg,
        border: `1px solid ${T.border}`,
        borderLeft: `4px solid ${T.accent}`,
        borderRadius: T.rMd,
        padding: T.sp(2),
      }}
    >
      <p
        style={{
          margin: '0 0 6px',
          color: T.primary,
          fontSize: T.small.size,
          fontWeight: 600,
          fontFamily: T.fontBody,
        }}
      >
        Important disclaimer
      </p>
      <p
        style={{
          margin: 0,
          color: T.textSecondary,
          fontSize: T.body.size,
          lineHeight: T.body.lh,
          fontFamily: T.fontBody,
        }}
      >
        Oboafo provides general legal education based on the 1992 Constitution of Ghana. It is{' '}
        <strong style={{ color: T.text }}>not a lawyer</strong> and this is{' '}
        <strong style={{ color: T.text }}>not legal advice</strong>. For specific legal matters, consult a qualified
        lawyer.
      </p>
      <p style={{ margin: '10px 0 0', color: T.textSecondary, fontSize: T.body.size, fontFamily: T.fontBody }}>
        Legal Aid Commission (toll-free):{' '}
        <strong style={{ color: T.primary }}>0800-100-060</strong>
      </p>
    </div>
  )
}
