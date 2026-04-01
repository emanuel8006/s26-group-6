import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer style={{ background: '#1a1a1a', borderTop: '3px solid #D42B2B', position: 'relative', overflow: 'hidden' }}>
      {/* Grid texture */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)', backgroundSize: '28px 28px', pointerEvents: 'none' }} />

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 2rem 1.5rem', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem', marginBottom: '2rem' }}>

          {/* Logo + tagline */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{ width: '4px', height: '28px', background: '#D42B2B', borderRadius: '2px' }} />
              <span style={{ fontFamily: "'Chicle', serif", fontSize: '1.4rem', color: '#fff' }}>NomNom</span>
            </div>
            <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.8rem', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.35)', margin: 0, maxWidth: '220px', lineHeight: 1.6 }}>
              YOUR NORTHEASTERN DINING PLAN, FINALLY UNDER CONTROL.
            </p>
          </div>

          {/* Links */}
          <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.8rem', letterSpacing: '0.12em', color: '#D42B2B', margin: '0 0 10px' }}>PAGES</p>
              {[
                { label: 'Dashboard',    to: '/dashboard' },
                { label: 'Dining $',     to: '/dining-dollars' },
                { label: 'Swipes',       to: '/swipes' },
                { label: "Today's Menu", to: '/menu' },
              ].map(({ label, to }) => (
                <Link key={to} to={to} style={{ display: 'block', fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.78rem', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.45)', textDecoration: 'none', marginBottom: '6px', transition: 'color 0.12s' }}
                  onMouseEnter={e => e.target.style.color = '#fff'}
                  onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.45)'}>
                  {label}
                </Link>
              ))}
            </div>
            <div>
              <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.8rem', letterSpacing: '0.12em', color: '#D42B2B', margin: '0 0 10px' }}>ACCOUNT</p>
              {[
                { label: 'Sign In',   to: '/login' },
                { label: 'Sign Up',   to: '/login' },
                { label: 'Onboarding', to: '/onboarding' },
              ].map(({ label, to }) => (
                <Link key={label} to={to} style={{ display: 'block', fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.78rem', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.45)', textDecoration: 'none', marginBottom: '6px', transition: 'color 0.12s' }}
                  onMouseEnter={e => e.target.style.color = '#fff'}
                  onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.45)'}>
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.75rem', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.25)', margin: 0 }}>
            © 2026 NOMNOM · NORTHEASTERN UNIVERSITY · BOSTON, MA
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 5px #4ade80' }} />
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.75rem', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.25)' }}>BUILT BY HUSKIES</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
