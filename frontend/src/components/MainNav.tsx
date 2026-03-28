import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { OboafoLogo } from './OboafoLogo'
import { T } from '../theme'
import { useMediaQuery } from '../hooks/useMediaQuery'

const navLinkStyle = ({ isActive }: { isActive: boolean }) => ({
  fontFamily: T.fontBody,
  fontSize: T.small.size,
  fontWeight: 600,
  color: isActive ? T.primary : T.textSecondary,
  padding: `${T.sp(1)} ${T.sp(2)}`,
  borderRadius: T.rFull,
  background: isActive ? 'rgba(27, 67, 50, 0.08)' : 'transparent',
  textDecoration: 'none',
})

export function MainNav() {
  const [solid, setSolid] = useState(false)
  const isDesktop = useMediaQuery('(min-width: 768px)')

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: solid ? T.bg : 'rgba(250, 247, 242, 0.92)',
        backdropFilter: solid ? 'none' : 'blur(10px)',
        borderBottom: solid ? `1px solid ${T.border}` : '1px solid transparent',
        transition: T.txSlow,
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: `${T.sp(2)} ${isDesktop ? '80px' : '20px'}`,
          display: 'flex',
          alignItems: 'center',
          gap: T.sp(2),
          flexWrap: 'wrap',
        }}
      >
        <Link
          to="/"
          style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
          aria-label="Oboafo home"
        >
          <OboafoLogo size="sm" />
        </Link>

        {isDesktop && (
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              marginLeft: T.sp(3),
              flex: 1,
              justifyContent: 'center',
            }}
            aria-label="Primary"
          >
            <NavLink to="/" end style={navLinkStyle}>
              Home
            </NavLink>
            <NavLink to="/learn" style={navLinkStyle}>
              Learn
            </NavLink>
            <NavLink to="/ask" style={navLinkStyle}>
              Ask Oboafo
            </NavLink>
            <NavLink to="/crisis" style={navLinkStyle}>
              Crisis
            </NavLink>
          </nav>
        )}

      </div>
    </header>
  )
}
