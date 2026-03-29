import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Nav() {
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close menu on route change
  useEffect(() => setMenuOpen(false), [location.pathname])

  const isActive = (path) => location.pathname === path

  const navLinks = [
    { to: '/dashboard',     label: 'Dashboard' },
    { to: '/dining-dollars', label: 'Dining $' },
    { to: '/swipes',        label: 'Swipes' },
  ]

  return (
    <>
      <nav style={{
        background: '#FBF2D8',
        borderBottom: `2px solid ${scrolled ? '#1a1a1a' : 'rgba(0,0,0,0.12)'}`,
        boxShadow: scrolled ? '0 2px 0 rgba(0,0,0,0.06)' : 'none',
        position: 'sticky', top: 0, zIndex: 1000,
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '58px' }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{ width: '4px', height: '28px', borderRadius: '2px', flexShrink: 0 }} />
            <span style={{ fontFamily: "'Chicle', serif", fontSize: '1.35rem', fontWeight: 700, color: '#1a1a1a', letterSpacing: '0.01em' }}>SwipeWise</span>
          </Link>

          {/* Desktop links + Sign in + mobile toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }} className="nav-desktop-links">
              {navLinks.map(({ to, label }) => (
                <Link key={to} to={to} style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: '0.88rem', letterSpacing: '0.08em',
                  color: isActive(to) ? '#D42B2B' : '#1a1a1a',
                  textDecoration: 'none',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  background: isActive(to) ? 'rgba(212,43,43,0.07)' : 'transparent',
                  border: isActive(to) ? '1.5px solid rgba(212,43,43,0.2)' : '1.5px solid transparent',
                  transition: 'all 0.12s ease',
                  position: 'relative',
                }}
                  onMouseEnter={e => { if (!isActive(to)) { e.target.style.background = 'rgba(0,0,0,0.05)'; e.target.style.borderColor = 'rgba(0,0,0,0.1)' } }}
                  onMouseLeave={e => { if (!isActive(to)) { e.target.style.background = 'transparent'; e.target.style.borderColor = 'transparent' } }}
                >
                  {label}
                </Link>
              ))}
            </div>

            <Link to="/login" style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: '0.88rem', letterSpacing: '0.08em',
              color: '#fff', textDecoration: 'none',
              padding: '7px 18px',
              background: '#D42B2B',
              border: '2px solid #1a1a1a',
              borderRadius: '6px',
              boxShadow: '2px 3px 0 #1a1a1a',
              transition: 'all 0.12s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-1px,-1px)'; e.currentTarget.style.boxShadow = '3px 4px 0 #1a1a1a' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '2px 3px 0 #1a1a1a' }}
            >
              Sign In
            </Link>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="nav-mobile-toggle"
              style={{ display: 'none', flexDirection: 'column', gap: '5px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
              aria-label="Toggle menu"
            >
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width: '22px', height: '2px', background: '#1a1a1a', borderRadius: '2px',
                  transition: 'all 0.2s ease',
                  transform: menuOpen
                    ? i === 0 ? 'rotate(45deg) translate(5px, 5px)'
                    : i === 1 ? 'scaleX(0)'
                    : 'rotate(-45deg) translate(5px, -5px)'
                    : 'none',
                  opacity: menuOpen && i === 1 ? 0 : 1,
                }} />
              ))}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="nav-mobile-menu" style={{
            borderTop: '1px solid rgba(0,0,0,0.08)',
            background: '#FBF2D8',
            padding: '0.75rem 2rem 1rem',
            display: 'flex', flexDirection: 'column', gap: '2px',
          }}>
            {navLinks.map(({ to, label }) => (
              <Link key={to} to={to} style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: '0.95rem', letterSpacing: '0.08em',
                color: isActive(to) ? '#D42B2B' : '#1a1a1a',
                textDecoration: 'none', padding: '10px 12px',
                borderRadius: '6px',
                background: isActive(to) ? 'rgba(212,43,43,0.07)' : 'transparent',
                borderLeft: isActive(to) ? '3px solid #D42B2B' : '3px solid transparent',
              }}>
                {label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      <style>{`
        @media (max-width: 640px) {
          .nav-desktop-links { display: none !important; }
          .nav-mobile-toggle { display: flex !important; }
        }
      `}</style>
    </>
  )
}
