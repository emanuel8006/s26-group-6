import React from 'react'
import { Link } from 'react-router-dom'

export default function Nav() {
  return (
    <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', background: '#FBF2D8', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
      <Link to="/" style={{ fontFamily: "'Chicle', serif", fontSize: '1.4rem', fontWeight: 700, color: '#1a1a1a', textDecoration: 'none' }}>NomNom</Link>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Link to="/dashboard" style={{ textDecoration: 'none', color: '#1a1a1a', fontFamily: "'Bebas Neue', sans-serif" }}>Dashboard</Link>
        <Link to="/dining-dollars" style={{ textDecoration: 'none', color: '#1a1a1a', fontFamily: "'Bebas Neue', sans-serif" }}>Dining $</Link>
        <Link to="/swipes" style={{ textDecoration: 'none', color: '#1a1a1a', fontFamily: "'Bebas Neue', sans-serif" }}>Swipes</Link>
        <Link to="/login" style={{ padding: '0.5rem 1.3rem', background: '#D42B2B', color: '#fff', fontFamily: "'Bebas Neue', sans-serif", textDecoration: 'none', borderRadius: '8px', border: '3px solid #1a1a1a', boxShadow: '3px 4px 0px #1a1a1a' }}>Sign In</Link>
      </div>
    </nav>
  )
}