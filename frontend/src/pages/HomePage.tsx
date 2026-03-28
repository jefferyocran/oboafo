import type { AppPage } from '../types'
import { CrisisButtons } from '../components/CrisisButtons'
import { AudioButton } from '../components/AudioButton'
import { Disclaimer } from '../components/Disclaimer'
import { useLanguage } from '../context/LanguageContext'
import { T } from '../theme'

interface HomePageProps {
  isOnline: boolean
  onNavigate: (page: AppPage) => void
}

const HERO_TEXT = 'Know your rights under the 1992 Constitution of Ghana. Available offline for crisis situations.'

export function HomePage({ isOnline, onNavigate }: HomePageProps) {
  const { language } = useLanguage()

  return (
    <div style={{ overflowY: 'auto', height: '100%' }}>
      {/* Hero banner */}
      <div style={{
        background: `linear-gradient(160deg, #0f1829 0%, #1a2a1a 100%)`,
        borderBottom: `1px solid ${T.border}`,
        padding: '24px 16px 20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <span style={{ fontSize: '2rem' }}>🇬🇭</span>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, color: T.text, letterSpacing: '-0.01em' }}>
              Know Your Rights
            </h1>
            <p style={{ margin: 0, fontSize: '0.72rem', color: T.gold, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              1992 Constitution of Ghana
            </p>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <AudioButton id="hero" text={HERO_TEXT} size="sm" />
          </div>
        </div>
        <p style={{ margin: 0, color: T.text2, fontSize: '0.88rem', lineHeight: 1.6 }}>
          {HERO_TEXT}
        </p>

        {/* Online/offline status pill */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          marginTop: '12px',
          padding: '4px 10px',
          background: isOnline ? T.greenDim : T.redDim,
          border: `1px solid ${isOnline ? T.green : T.red}`,
          borderRadius: T.rFull,
          fontSize: '0.72rem',
          color: isOnline ? T.green : T.red,
          fontWeight: 600,
        }}>
          <span style={{ fontSize: '0.6rem' }}>●</span>
          {isOnline ? 'Online — all features available' : 'Offline — Crisis Mode works anytime'}
        </div>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Quick actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <QuickCard
            emoji="📚"
            title="Browse Rights"
            desc="By life situation"
            color={T.blue}
            onClick={() => onNavigate('browse')}
          />
          <QuickCard
            emoji="💬"
            title="Ask Oboafo"
            desc={isOnline ? 'AI legal guide' : 'Needs internet'}
            color={T.gold}
            onClick={() => onNavigate('chat')}
            disabled={!isOnline}
          />
        </div>

        {/* Crisis section */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span style={{ color: T.red, fontWeight: 800, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              🆘 Crisis Mode
            </span>
            <span style={{
              background: T.greenDim,
              border: `1px solid ${T.green}`,
              color: T.green,
              borderRadius: T.rFull,
              padding: '2px 7px',
              fontSize: '0.65rem',
              fontWeight: 700,
            }}>
              Works offline
            </span>
          </div>
          <CrisisButtons language={language} />
        </div>

        <Disclaimer />
      </div>
    </div>
  )
}

function QuickCard({
  emoji, title, desc, color, onClick, disabled,
}: {
  emoji: string; title: string; desc: string; color: string
  onClick: () => void; disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        padding: '14px',
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderTop: `3px solid ${disabled ? T.border : color}`,
        borderRadius: T.rLg,
        cursor: disabled ? 'not-allowed' : 'pointer',
        textAlign: 'left',
        opacity: disabled ? 0.5 : 1,
        transition: T.tx,
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = T.surface2 }}
      onMouseLeave={e => { e.currentTarget.style.background = T.surface }}
    >
      <span style={{ fontSize: '1.5rem' }}>{emoji}</span>
      <div>
        <div style={{ color: T.text, fontWeight: 700, fontSize: '0.85rem' }}>{title}</div>
        <div style={{ color: T.text3, fontSize: '0.75rem', marginTop: '2px' }}>{desc}</div>
      </div>
    </button>
  )
}
