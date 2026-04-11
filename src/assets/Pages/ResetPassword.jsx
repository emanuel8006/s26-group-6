import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { resetPassword } from '../Components/APICalls'

const inputCls = {
  width: '100%',
  padding: '11px 14px',
  border: '2px solid rgba(0,0,0,0.15)',
  borderRadius: '8px',
  fontFamily: "'Inter', sans-serif",
  fontSize: '0.95rem',
  color: '#1a1a1a',
  background: '#fff',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s',
}

export default function ResetPassword() {
  const navigate = useNavigate()
  const [tokens, setTokens] = useState(null) // { accessToken, refreshToken } | 'invalid'
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [status, setStatus] = useState(null) // null | 'loading' | 'success' | string (error)

  useEffect(() => {
    const hash = window.location.hash.slice(1)
    const params = new URLSearchParams(hash)
    const type = params.get('type')
    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')
    if (type === 'recovery' && accessToken && refreshToken) {
      setTokens({ accessToken, refreshToken })
    } else {
      setTokens('invalid')
    }
  }, [])

  const handleSubmit = async () => {
    if (password.length < 6) { setStatus('Password must be at least 6 characters.'); return }
    if (password !== confirm) { setStatus('Passwords do not match.'); return }
    setStatus('loading')
    try {
      const res = await resetPassword({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, newPassword: password })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setStatus(data.detail || 'Something went wrong. Please request a new reset link.')
        return
      }
      setStatus('success')
      setTimeout(() => navigate('/login'), 1500)
    } catch {
      setStatus('Something went wrong. Please request a new reset link.')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAF9F6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '420px', background: '#fff', border: '2.5px solid #1a1a1a', borderRadius: '16px', padding: '2.5rem', boxShadow: '6px 6px 0 #1a1a1a' }}>
        <div style={{ marginBottom: '1.8rem' }}>
          <span style={{ fontFamily: "'Chicle', serif", fontSize: '1.4rem', fontWeight: 700, color: '#D42B2B', cursor: 'pointer' }} onClick={() => navigate('/')}>SwipeWise</span>
        </div>

        {tokens === null && (
          <p style={{ fontFamily: "'Inter', sans-serif", color: '#6B7280' }}>Loading...</p>
        )}

        {tokens === 'invalid' && (
          <>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '1.6rem', color: '#1a1a1a', margin: '0 0 8px' }}>Invalid Link</h2>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', color: '#6B7280', margin: '0 0 1.5rem' }}>This reset link is invalid or has expired. Please request a new one.</p>
            <button onClick={() => navigate('/login')} style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1rem', letterSpacing: '0.08em', color: '#D42B2B', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>← BACK TO SIGN IN</button>
          </>
        )}

        {tokens && tokens !== 'invalid' && (
          <>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '1.8rem', color: '#1a1a1a', margin: '0 0 6px' }}>Set New Password</h2>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.88rem', color: '#6B7280', margin: '0 0 1.5rem' }}>Choose a new password for your account.</p>

            {status === 'success' ? (
              <div style={{ background: '#f0f7eb', border: '2px solid #2d6a1f', borderRadius: '8px', padding: '14px 16px' }}>
                <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.9rem', letterSpacing: '0.05em', color: '#2d6a1f', margin: 0 }}>PASSWORD UPDATED! REDIRECTING TO SIGN IN...</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {typeof status === 'string' && status !== 'loading' && (
                  <div style={{ background: '#FFF0EE', border: '2px solid #D42B2B', borderRadius: '8px', padding: '10px 14px' }}>
                    <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.8rem', letterSpacing: '0.04em', color: '#D42B2B', margin: 0 }}>{status.toUpperCase()}</p>
                  </div>
                )}
                <div>
                  <label style={{ display: 'block', fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.8rem', letterSpacing: '0.1em', color: '#6B7280', marginBottom: '6px' }}>NEW PASSWORD</label>
                  <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} style={inputCls} />
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.8rem', letterSpacing: '0.1em', color: '#6B7280', marginBottom: '6px' }}>CONFIRM PASSWORD</label>
                  <input type="password" placeholder="••••••••" value={confirm} onChange={e => setConfirm(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} style={inputCls} />
                </div>
                <button type="button" disabled={status === 'loading' || !password || !confirm} onClick={handleSubmit} style={{ padding: '13px', background: (status === 'loading' || !password || !confirm) ? 'rgba(0,0,0,0.15)' : '#D42B2B', color: '#fff', border: '2.5px solid #1a1a1a', borderRadius: '8px', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', letterSpacing: '0.08em', cursor: (status === 'loading' || !password || !confirm) ? 'not-allowed' : 'pointer', boxShadow: '4px 4px 0 #1a1a1a', marginTop: '4px' }}>
                  {status === 'loading' ? 'UPDATING...' : 'SET NEW PASSWORD →'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
