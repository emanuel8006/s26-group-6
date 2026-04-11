import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, register, getData, updateMealPlan } from '../Components/APICalls'

export async function loadAndStoreUserData() {
  const mealPlanRes = await getData({
    columnList: ['plan_name', 'swipes_start', 'dining_dollars_start', 'start_date', 'end_date', 'swipes_current', 'dining_dollars_current', 'dietary_preferences', 'dietary_restrictions'],
    tableName: 'meal_plans'
  })
  const mealPlan = (await mealPlanRes.json())?.data?.[0] || {}

  const fields = {
    oasis_plan_name:                mealPlan.plan_name ?? null,
    oasis_swipes_start:             mealPlan.swipes_start ?? null,
    oasis_dining_dollars_start:     mealPlan.dining_dollars_start ?? null,
    oasis_start_date:               mealPlan.start_date ?? null,
    oasis_end_date:                 mealPlan.end_date ?? null,
    oasis_swipes_current:           mealPlan.swipes_current ?? null,
    oasis_dining_dollars_current:   mealPlan.dining_dollars_current ?? null,
    oasis_dietary_preferences:      mealPlan.dietary_preferences ? JSON.stringify(mealPlan.dietary_preferences) : null,
    oasis_dietary_restrictions:     mealPlan.dietary_restrictions ? JSON.stringify(mealPlan.dietary_restrictions) : null,
  }

  for (const [key, value] of Object.entries(fields)) {
    if (value !== null) localStorage.setItem(key, value)
  }

  // New meal plan fields — in a separate call so missing DB columns don't break login
  try {
    const extRes = await getData({ columnList: ['swipes_per_week', 'dollars_per_week', 'offdays'], tableName: 'meal_plans' })
    if (extRes.ok) {
      const ext = (await extRes.json())?.data?.[0] || {}
      if (ext.swipes_per_week != null) localStorage.setItem('oasis_swipes_per_week', ext.swipes_per_week)
      if (ext.dollars_per_week != null) localStorage.setItem('oasis_dollars_per_week', ext.dollars_per_week)
      if (ext.offdays) localStorage.setItem('oasis_offdays', JSON.stringify(ext.offdays))
    }
  } catch {}

  return fields
}

const inputCls = {
  width: '100%',
  padding: '11px 14px',
  border: '2px solid rgba(0,0,0,0.15)',
  borderRadius: '8px',
  fontSize: '0.9rem',
  fontFamily: "'Inter', sans-serif",
  background: '#fff',
  color: '#1a1a1a',
  outline: 'none',
  boxSizing: 'border-box',
  boxShadow: '2px 3px 0px rgba(0,0,0,0.08)',
  transition: 'border-color 0.15s',
}


function ErrorBox({ message }) {
  if (!message) return null
  return (
    <div style={{
      background: '#FFF0EE', border: '2px solid #D42B2B', borderRadius: '8px',
      padding: '10px 14px', boxShadow: '3px 3px 0 #D42B2B',
      fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.85rem',
      letterSpacing: '0.05em', color: '#D42B2B', marginBottom: '4px',
    }}>
      {message}
    </div>
  )
}

function SuccessBox({ message }) {
  if (!message) return null
  return (
    <div style={{
      background: '#f0f7eb', border: '2px solid #2d6a1f', borderRadius: '8px',
      padding: '10px 14px', boxShadow: '3px 3px 0 #2d6a1f',
      fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.85rem',
      letterSpacing: '0.05em', color: '#2d6a1f', marginBottom: '4px',
    }}>
      {message}
    </div>
  )
}

export default function Login() {
  const [tab, setTab] = useState('signin')
  const [diet, setDiet] = useState([])
  const [cuisine, setCuisine] = useState([])
  const navigate = useNavigate()
  const [signInError, setSignInError] = useState('')
  const [signUpError, setSignUpError] = useState('')
  const [signUpSuccess, setSignUpSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignUp = async (e) => {
    e.preventDefault()
    setSignUpError('')
    setSignUpSuccess('')

    const formData = new FormData(e.target)
    const fullName = formData.get('fullName')?.trim()
    const username = formData.get('username')?.trim()
    const email = formData.get('email')?.trim()
    const password = formData.get('password')
    // Validation
    if (!fullName) return setSignUpError('Please enter your full name.')
    if (!username) return setSignUpError('Please enter a username.')
    if (!email) return setSignUpError('Please enter your email.')
    if (!password) return setSignUpError('Please enter a password.')
    if (password.length < 6) return setSignUpError('Password must be at least 6 characters.')

    setLoading(true)
    try {
      const registerResponse = await register({ email, password, fullName, username })
      const registerResponseJson = await registerResponse.json().catch(() => ({}))

      if (!registerResponse.ok) {
        if (registerResponse.status === 409 || (registerResponseJson?.detail || '').toLowerCase().includes('already registered')) {
          return setSignUpError('You already have an account with this email. Sign in instead.')
        }
        return setSignUpError('Registration failed. Please try again.')
      }

      const loginResponse = await login({ email, password })
      if (!loginResponse || !loginResponse.ok) {
        return setSignUpError('Account created! Please sign in manually.')
      }

      const loginData = await loginResponse.json()
      localStorage.setItem('oasis_token', loginData.token_str)
      localStorage.setItem('sw_logged_in', 'true')
      setSignUpSuccess('Account created! Redirecting...')

      // If the user already completed onboarding before signing up, push that
      // data to the DB and go straight to the dashboard instead of re-onboarding.
      const hasOnboardingData = !!localStorage.getItem('oasis_end_date')
      if (hasOnboardingData) {
        const ls = (key) => localStorage.getItem(key)
        await updateMealPlan({
          planName:             ls('oasis_plan_name'),
          swipesStart:          ls('oasis_swipes_start') ? parseInt(ls('oasis_swipes_start')) : null,
          swipesCurrent:        ls('oasis_swipes_current') ? parseInt(ls('oasis_swipes_current')) : null,
          diningDollarsStart:   ls('oasis_dining_dollars_start') ? parseFloat(ls('oasis_dining_dollars_start')) : null,
          diningDollarsCurrent: ls('oasis_dining_dollars_current') ? parseFloat(ls('oasis_dining_dollars_current')) : null,
          startDate:            ls('oasis_start_date'),
          endDate:              ls('oasis_end_date'),
          swipesPerWeek:        ls('oasis_swipes_per_week') ? parseInt(ls('oasis_swipes_per_week')) : null,
          dollarsPerWeek:       ls('oasis_dollars_per_week') ? parseFloat(ls('oasis_dollars_per_week')) : null,
          offdays:              ls('oasis_offdays') ? JSON.parse(ls('oasis_offdays')) : null,
          dietaryPreferences:   ls('oasis_dietary_preferences') ? JSON.parse(ls('oasis_dietary_preferences')) : null,
          dietaryRestrictions:  ls('oasis_dietary_restrictions') ? JSON.parse(ls('oasis_dietary_restrictions')) : null,
        }).catch(() => {})
        setTimeout(() => navigate('/dashboard'), 1000)
      } else {
        setTimeout(() => navigate('/onboarding'), 1000)
      }
    } catch (err) {
      setSignUpError('You already have an account with this email. Sign in instead.')
    } finally {
      setLoading(false)
    }
  }

  const handleSignIn = async (e) => {
    e.preventDefault()
    setSignInError('')

    const formData = new FormData(e.target)
    const email = formData.get('email')?.trim()
    const password = formData.get('password')

    if (!email) return setSignInError('Please enter your email.')
    if (!password) return setSignInError('Please enter your password.')

    setLoading(true)
    try {
      const loginResponse = await login({ email, password })
      if (!loginResponse || !loginResponse.ok) {
        return setSignInError("Incorrect email or password. If you don't have an account yet, sign up first.")
      }
      const loginData = await loginResponse.json()
      localStorage.setItem('oasis_token', loginData.token_str)
      localStorage.setItem('sw_logged_in', 'true')
    } catch (err) {
      return setSignInError("Incorrect email or password. If you don't have an account yet, sign up first.")
    } finally {
      setLoading(false)
    }

    try {
      const profile = await loadAndStoreUserData()
      if (!profile.oasis_end_date) {
        return navigate('/onboarding')
      }
      navigate('/dashboard')
    } catch (err) {
      navigate('/dashboard')
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'Inter', sans-serif" }}>

      {/* ── Left panel ── */}
      <div style={{
        width: '46%', background: '#1a1a1a', position: 'relative',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '3rem', overflow: 'hidden', flexShrink: 0,
      }} className="login-left-panel">
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '28px 28px', zIndex: 0 }} />
        <div style={{ position: 'absolute', top: '-60px', right: '-40px', width: '180px', height: '400px', background: '#D42B2B', opacity: 0.12, transform: 'rotate(20deg)', zIndex: 0, borderRadius: '4px' }} />
        <div style={{ position: 'absolute', bottom: '-40px', left: '-30px', width: '120px', height: '300px', background: '#FFE45C', opacity: 0.07, transform: 'rotate(-15deg)', zIndex: 0, borderRadius: '4px' }} />
        <svg style={{ position: 'absolute', top: '12%', right: '8%', opacity: 0.07, transform: 'rotate(18deg)', zIndex: 0 }} width="50" height="140" viewBox="0 0 50 140" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <line x1="10" y1="8" x2="10" y2="48"/><line x1="20" y1="8" x2="20" y2="48"/><line x1="30" y1="8" x2="30" y2="48"/>
          <path d="M10 48 Q15 60 20 60 Q25 60 30 48"/><line x1="20" y1="60" x2="20" y2="132"/>
        </svg>
        <svg style={{ position: 'absolute', bottom: '14%', right: '10%', opacity: 0.07, transform: 'rotate(-10deg)', zIndex: 0 }} width="44" height="140" viewBox="0 0 44 140" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="22" cy="22" rx="14" ry="18"/><line x1="22" y1="40" x2="22" y2="135"/>
        </svg>
        <svg style={{ position: 'absolute', top: '42%', left: '6%', opacity: 0.06, transform: 'rotate(8deg)', zIndex: 0 }} width="90" height="70" viewBox="0 0 90 70" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 20 L10 62 Q10 68 20 68 L70 68 Q80 68 80 62 L84 20 Z"/>
          <line x1="6" y1="20" x2="84" y2="20"/><line x1="26" y1="10" x2="26" y2="20"/><line x1="45" y1="8" x2="45" y2="20"/><line x1="64" y1="10" x2="64" y2="20"/>
          <path d="M84 30 Q96 30 96 44 Q96 58 84 58"/>
        </svg>
        <svg style={{ position: 'absolute', bottom: '30%', left: '8%', opacity: 0.06, transform: 'rotate(-18deg)', zIndex: 0 }} width="80" height="80" viewBox="0 0 80 80" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="40" cy="40" rx="36" ry="36"/><ellipse cx="40" cy="40" rx="26" ry="26"/><ellipse cx="40" cy="40" rx="12" ry="12"/>
        </svg>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '3.5rem' }}>
            <div style={{ width: '4px', height: '32px', borderRadius: '2px' }} />
            <span onClick={() => navigate('/')} style={{ fontFamily: "'Chicle', serif", fontSize: '1.6rem', fontWeight: 700, color: '#fff', cursor: 'pointer' }}>SwipeWise</span>
          </div>
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 'clamp(2rem, 3.5vw, 3rem)', color: '#fff', lineHeight: 1.1, margin: '0 0 1.2rem' }}>
              Your dining plan,<br/>
              <span style={{ color: '#FFE45C', fontStyle: 'italic' }}>finally</span>{' '}under control.
            </h1>
            <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', letterSpacing: '0.04em', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, maxWidth: '320px' }}>
              Track swipes, manage dining dollars, and make every meal count — all in one place.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '280px' }}>
            {[
              { num: '$3,820', desc: 'average dining plan cost per semester' },
              { num: '5 min',  desc: 'to get fully set up' },
              { num: '100%',   desc: 'free to use' },
            ].map(({ num, desc }) => (
              <div key={num} style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px 14px' }}>
                <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '1.1rem', color: '#FFE45C', flexShrink: 0, minWidth: '54px' }}>{num}</span>
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.45)', lineHeight: 1.4 }}>{desc.toUpperCase()}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.2)', margin: 0 }}>© 2026 SwipeWise · OASIS</p>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div style={{
        flex: 1, background: '#FAF9F6',
        backgroundImage: 'linear-gradient(rgba(0,0,0,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.035) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '2rem',
      }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <div style={{ marginBottom: '2rem' }}>
            <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', letterSpacing: '0.14em', color: '#D42B2B', margin: '0 0 6px' }}>
              {tab === 'signin' ? 'WELCOME BACK' : 'GET STARTED'}
            </p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '2rem', color: '#1a1a1a', margin: 0, lineHeight: 1.1 }}>
              {tab === 'signin' ? 'Sign in to SwipeWise.' : 'Create your account.'}
            </h2>
          </div>

          <div style={{ display: 'flex', marginBottom: '1.8rem', border: '2px solid #1a1a1a', borderRadius: '8px', overflow: 'hidden', boxShadow: '3px 3px 0 #1a1a1a' }}>
            {[['signin', 'Sign In'], ['signup', 'Sign Up']].map(([key, label]) => (
              <button key={key} type="button" onClick={() => { setTab(key); setSignInError(''); setSignUpError(''); setSignUpSuccess('') }} style={{
                flex: 1, padding: '10px', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem',
                letterSpacing: '0.08em', cursor: 'pointer', transition: 'all 0.12s',
                background: tab === key ? '#1a1a1a' : '#fff',
                color: tab === key ? '#fff' : '#9CA3AF',
                border: 'none', borderRight: key === 'signin' ? '2px solid #1a1a1a' : 'none',
              }}>{label}</button>
            ))}
          </div>

          {tab === 'signin' && (
            <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <ErrorBox message={signInError} />
              <div>
                <label style={{ display: 'block', fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.8rem', letterSpacing: '0.1em', color: '#6B7280', marginBottom: '6px' }}>EMAIL</label>
                <input name="email" type="email" placeholder="you@northeastern.edu" style={inputCls} />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', letterSpacing: '0.1em', color: '#9CA3AF' }}>PASSWORD</label>
                  <a href="#" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', letterSpacing: '0.06em', color: '#D42B2B', textDecoration: 'none' }}>FORGOT PASSWORD?</a>
                </div>
                <input name="password" type="password" placeholder="••••••••" style={inputCls} />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" style={{ width: '15px', height: '15px', accentColor: '#D42B2B', cursor: 'pointer' }} />
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', letterSpacing: '0.06em', color: '#6B7280' }}>REMEMBER ME</span>
              </label>
              <button type="submit" disabled={loading} style={{
                padding: '13px', background: loading ? 'rgba(0,0,0,0.15)' : '#D42B2B', color: '#fff',
                border: '2.5px solid #1a1a1a', borderRadius: '8px',
                fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', letterSpacing: '0.08em',
                cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '4px 4px 0 #1a1a1a', transition: 'all 0.12s', marginTop: '4px',
              }}>{loading ? 'SIGNING IN...' : 'SIGN IN →'}</button>
              <p style={{ textAlign: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', letterSpacing: '0.06em', color: '#9CA3AF', margin: '4px 0 0' }}>
                DON'T HAVE AN ACCOUNT?{' '}
                <button type="button" onClick={() => { setTab('signup'); setSignInError('') }} style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', letterSpacing: '0.06em', color: '#D42B2B', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>SIGN UP FREE</button>
              </p>
            </form>
          )}

          {tab === 'signup' && (
            <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <ErrorBox message={signUpError} />
              <SuccessBox message={signUpSuccess} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', letterSpacing: '0.1em', color: '#9CA3AF', marginBottom: '6px' }}>FULL NAME</label>
                  <input name="fullName" type="text" placeholder="Your name" style={inputCls} />
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', letterSpacing: '0.1em', color: '#9CA3AF', marginBottom: '6px' }}>USERNAME</label>
                  <input name="username" type="text" placeholder="@username" style={inputCls} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', letterSpacing: '0.1em', color: '#9CA3AF', marginBottom: '6px' }}>EMAIL</label>
                <input name="email" type="email" placeholder="you@northeastern.edu" style={inputCls} />
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', letterSpacing: '0.1em', color: '#9CA3AF', marginBottom: '6px' }}>PASSWORD</label>
                <input name="password" type="password" placeholder="Create a password (min 6 chars)" style={inputCls} />
              </div>

              <button type="submit" disabled={loading} style={{
                padding: '13px', background: loading ? 'rgba(0,0,0,0.15)' : '#D42B2B', color: '#fff',
                border: '2.5px solid #1a1a1a', borderRadius: '8px',
                fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', letterSpacing: '0.08em',
                cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '4px 4px 0 #1a1a1a', transition: 'all 0.12s', marginTop: '4px',
              }}>{loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT →'}</button>
              <p style={{ textAlign: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', letterSpacing: '0.06em', color: '#9CA3AF', margin: '4px 0 0' }}>
                ALREADY HAVE AN ACCOUNT?{' '}
                <button type="button" onClick={() => { setTab('signin'); setSignUpError('') }} style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', letterSpacing: '0.06em', color: '#D42B2B', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>SIGN IN</button>
              </p>
            </form>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .login-left-panel { display: none !important; }
        }
      `}</style>
    </div>
  )
}