import { T } from '../theme'

interface DisclaimerProps {
  compact?: boolean
}

export function Disclaimer({ compact }: DisclaimerProps) {
  if (compact) {
    return (
      <p style={{ color: T.text4, fontSize: '0.7rem', textAlign: 'center', lineHeight: 1.5, margin: 0 }}>
        Oboafo is an educator, not a lawyer.
        For urgent matters call Legal Aid Commission: <strong style={{ color: T.text3 }}>0800-100-060</strong> (toll-free)
      </p>
    )
  }

  return (
    <div style={{
      background: T.surface,
      border: `1px solid ${T.border}`,
      borderLeft: `3px solid ${T.gold}`,
      borderRadius: T.r,
      padding: '12px 14px',
    }}>
      <p style={{ margin: '0 0 4px', color: T.goldText, fontSize: '0.78rem', fontWeight: 700 }}>
        Important Disclaimer
      </p>
      <p style={{ margin: 0, color: T.text2, fontSize: '0.82rem', lineHeight: 1.6 }}>
        Oboafo provides general legal education based on the 1992 Constitution of Ghana.
        It is <strong>not a lawyer</strong> and this is <strong>not legal advice</strong>.
        For specific legal matters, consult a qualified lawyer.
      </p>
      <p style={{ margin: '8px 0 0', color: T.text2, fontSize: '0.82rem' }}>
        📞 Legal Aid Commission (toll-free): <strong style={{ color: T.gold }}>0800-100-060</strong>
      </p>
    </div>
  )
}
