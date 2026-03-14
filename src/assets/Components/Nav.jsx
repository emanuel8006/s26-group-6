import React from 'react'
import { usePageTransition } from './CorkBoardTransition'

export default function Nav() {
  const navigateTo = usePageTransition()

  const handleClick = (e, path) => {
    e.preventDefault()
    navigateTo(path)
  }

  return (
    <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', background: '#FBF2D8', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
      <a href="/" onClick={e => handleClick(e, '/')} style={{ fontFamily: "'Chicle', serif", fontSize: '1.4rem', fontWeight: 700, color: '#1a1a1a', textDecoration: 'none' }}>NomNom</a>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <a href="/dashboard" onClick={e => handleClick(e, '/dashboard')} style={{ textDecoration: 'none', color: '#1a1a1a', fontFamily: "'Bebas Neue', sans-serif" }}>Dashboard</a>
        <a href="/dining-dollars" onClick={e => handleClick(e, '/dining-dollars')} style={{ textDecoration: 'none', color: '#1a1a1a', fontFamily: "'Bebas Neue', sans-serif" }}>Dining $</a>
        <a href="/swipes" onClick={e => handleClick(e, '/swipes')} style={{ textDecoration: 'none', color: '#1a1a1a', fontFamily: "'Bebas Neue', sans-serif" }}>Swipes</a>
        <a href="/food-good" onClick={e => handleClick(e, '/food-good')} style={{ textDecoration: 'none', color: '#1a1a1a', fontFamily: "'Bebas Neue', sans-serif" }}>Is Food Good?</a>
        <a href="/login" onClick={e => handleClick(e, '/login')} style={{ padding: '0.5rem 1.3rem', background: '#D42B2B', color: '#fff', fontFamily: "'Bebas Neue', sans-serif", textDecoration: 'none', borderRadius: '8px', border: '3px solid #1a1a1a', boxShadow: '3px 4px 0px #1a1a1a' }}>Sign In</a>
      </div>
    </nav>
  )
}