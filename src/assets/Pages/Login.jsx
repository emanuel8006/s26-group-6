import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, register, updateMealPlan } from '../Components/APICalls'

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

const PLAN_OPTIONS = [
  { id: '999',       dd:'400',       label: 'NU - Unlimited' },
  { id: '225',       dd:'600',       label: 'NU - 225' },
  { id: '180',       dd:'300',       label: 'NU - 180' },
  { id: '150',       dd:'200',       label: 'NU - 150' },
  { id: '100',       dd:'200',       label: 'NU - 100' },
]

//where login() was

//where register() was

//where updateMealPlan() was

export default function Login() {
  const [tab, setTab] = useState('signin')
  const navigate = useNavigate()

  const toggleArr = (arr, setArr, val) =>
    setArr(p => p.includes(val) ? p.filter(x => x !== val) : [...p, val])

  const handleSignUp = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target)
    if (formData === null) {
      console.log('not receiving formdata')
    }
    const fullName = formData.get('fullName');
    const username = formData.get('username');
    const email = formData.get("email");
    const password = formData.get("password");

    const diningPlanObject = PLAN_OPTIONS.find(u => u.id === (formData.get("diningPlan")));
    const swipesStart = Number(diningPlanObject.id);
    const planName = diningPlanObject.label
    const placeholderDD = Number(diningPlanObject.dd);

    const registerResponse = await register({
      email,
      password,
      fullName,
      username
    });
    const registerResponseJson = await registerResponse.json()
    console.log(registerResponseJson);

    if (registerResponseJson) {
      const loginResponse = await login({
        email,
        password
      });
      const loginResponseJson = await loginResponse.json()
      console.log(loginResponseJson)

      const mealPlanResponse = await updateMealPlan({
        planName, 
        swipesStart, 
        diningDollarsStart: placeholderDD
      });
      console.log(mealPlanResponse);

      if (mealPlanResponse.ok) {
        navigate('/dashboard'); 
      } else {
        navigate('/login'); 
      };
    };
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target)
    const email = formData.get('email')
    const password = formData.get('password')
    const loginResponse = await login({ email: email, password: password })
    if (loginResponse.ok) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    };
  };



  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'Inter', sans-serif" }}>

      {/* ── Left panel ── */}
      <div style={{
        width: '46%', background: '#1a1a1a', position: 'relative',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '3rem', overflow: 'hidden', flexShrink: 0,
      }} className="login-left-panel">

        {/* Grid texture */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '28px 28px', zIndex: 0 }} />

        {/* Diagonal red stripe */}
        <div style={{ position: 'absolute', top: '-60px', right: '-40px', width: '180px', height: '400px', background: '#D42B2B', opacity: 0.12, transform: 'rotate(20deg)', zIndex: 0, borderRadius: '4px' }} />
        <div style={{ position: 'absolute', bottom: '-40px', left: '-30px', width: '120px', height: '300px', background: '#FFE45C', opacity: 0.07, transform: 'rotate(-15deg)', zIndex: 0, borderRadius: '4px' }} />

        {/* Decorative utensils */}
        <svg style={{ position: 'absolute', top: '12%', right: '8%', opacity: 0.07, transform: 'rotate(18deg)', zIndex: 0 }} width="50" height="140" viewBox="0 0 50 140" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <line x1="10" y1="8" x2="10" y2="48"/>
          <line x1="20" y1="8" x2="20" y2="48"/>
          <line x1="30" y1="8" x2="30" y2="48"/>
          <path d="M10 48 Q15 60 20 60 Q25 60 30 48"/>
          <line x1="20" y1="60" x2="20" y2="132"/>
        </svg>
        <svg style={{ position: 'absolute', bottom: '14%', right: '10%', opacity: 0.07, transform: 'rotate(-10deg)', zIndex: 0 }} width="44" height="140" viewBox="0 0 44 140" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="22" cy="22" rx="14" ry="18"/>
          <line x1="22" y1="40" x2="22" y2="135"/>
        </svg>
        <svg style={{ position: 'absolute', top: '42%', left: '6%', opacity: 0.06, transform: 'rotate(8deg)', zIndex: 0 }} width="90" height="70" viewBox="0 0 90 70" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 20 L10 62 Q10 68 20 68 L70 68 Q80 68 80 62 L84 20 Z"/>
          <line x1="6" y1="20" x2="84" y2="20"/>
          <line x1="26" y1="10" x2="26" y2="20"/>
          <line x1="45" y1="8" x2="45" y2="20"/>
          <line x1="64" y1="10" x2="64" y2="20"/>
          <path d="M84 30 Q96 30 96 44 Q96 58 84 58"/>
        </svg>
        <svg style={{ position: 'absolute', bottom: '30%', left: '8%', opacity: 0.06, transform: 'rotate(-18deg)', zIndex: 0 }} width="80" height="80" viewBox="0 0 80 80" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="40" cy="40" rx="36" ry="36"/>
          <ellipse cx="40" cy="40" rx="26" ry="26"/>
          <ellipse cx="40" cy="40" rx="12" ry="12"/>
        </svg>

        {/* Top: logo */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '3.5rem' }}>
            <div style={{ width: '4px', height: '32px', borderRadius: '2px' }} />
            <span onClick={() => navigate('/')} style={{ fontFamily: "'Chicle', serif", fontSize: '1.6rem', fontWeight: 700, color: '#fff', cursor: 'pointer' }}>SwipeWise</span>
          </div>

          {/* Big editorial headline */}
          <div style={{ marginBottom: '2rem' }}>
            <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', letterSpacing: '0.16em', color: '#D42B2B', margin: '0 0 10px' }}></p>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 'clamp(2rem, 3.5vw, 3rem)', color: '#fff', lineHeight: 1.1, margin: '0 0 1.2rem' }}>
              Your dining plan,<br/>
              <span style={{ color: '#FFE45C', fontStyle: 'italic' }}>finally</span>{' '}under control.
            </h1>
            <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', letterSpacing: '0.04em', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, maxWidth: '320px' }}>
              Track swipes, manage dining dollars, and make every meal count — all in one place.
            </p>
          </div>

          {/* Stat pills */}
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

        {/* Bottom: footer note */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.2)', margin: 0 }}>
            © 2026 SwipeWise · OASIS
          </p>
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

          {/* Heading */}
          <div style={{ marginBottom: '2rem' }}>
            <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', letterSpacing: '0.14em', color: '#D42B2B', margin: '0 0 6px' }}>
              {tab === 'signin' ? 'WELCOME BACK' : 'GET STARTED'}
            </p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '2rem', color: '#1a1a1a', margin: 0, lineHeight: 1.1 }}>
              {tab === 'signin' ? 'Sign in to SwipeWise.' : 'Create your account.'}
            </h2>
          </div>

          {/* Tab switcher */}
          <div style={{ display: 'flex', marginBottom: '1.8rem', border: '2px solid #1a1a1a', borderRadius: '8px', overflow: 'hidden', boxShadow: '3px 3px 0 #1a1a1a' }}>
            {[['signin', 'Sign In'], ['signup', 'Sign Up']].map(([key, label]) => (
              <button key={key} type="button" onClick={() => setTab(key)} style={{
                flex: 1, padding: '10px', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem',
                letterSpacing: '0.08em', cursor: 'pointer', transition: 'all 0.12s',
                background: tab === key ? '#1a1a1a' : '#fff',
                color: tab === key ? '#fff' : '#9CA3AF',
                border: 'none', borderRight: key === 'signin' ? '2px solid #1a1a1a' : 'none',
              }}>{label}</button>
            ))}
          </div>

          {/* Sign In form */}
          {tab === 'signin' && (
            <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
              <button type="submit" style={{
                padding: '13px', background: '#D42B2B', color: '#fff',
                border: '2.5px solid #1a1a1a', borderRadius: '8px',
                fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', letterSpacing: '0.08em',
                cursor: 'pointer', boxShadow: '4px 4px 0 #1a1a1a', transition: 'all 0.12s', marginTop: '4px',
              }}>SIGN IN →</button>
              <p style={{ textAlign: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', letterSpacing: '0.06em', color: '#9CA3AF', margin: '4px 0 0' }}>
                DON'T HAVE AN ACCOUNT?{' '}
                <button type="button" onClick={() => setTab('signup')} style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', letterSpacing: '0.06em', color: '#D42B2B', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>SIGN UP FREE</button>
              </p>
            </form>
          )}

          {/* Sign Up form */}
          {tab === 'signup' && (
            <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                <input name="password" type="password" placeholder="Create a password" style={inputCls} />
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', letterSpacing: '0.1em', color: '#9CA3AF', marginBottom: '6px' }}>DINING PLAN</label>
                <select name='diningPlan' style={{ ...inputCls }}>
                  <option value="">Select your plan...</option>
                  {PLAN_OPTIONS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                </select>
              </div>

              <button type="submit" style={{
                padding: '13px', background: '#D42B2B', color: '#fff',
                border: '2.5px solid #1a1a1a', borderRadius: '8px',
                fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', letterSpacing: '0.08em',
                cursor: 'pointer', boxShadow: '4px 4px 0 #1a1a1a', transition: 'all 0.12s', marginTop: '4px',
              }}>CREATE ACCOUNT →</button>
              <p style={{ textAlign: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', letterSpacing: '0.06em', color: '#9CA3AF', margin: '4px 0 0' }}>
                ALREADY HAVE AN ACCOUNT?{' '}
                <button type="button" onClick={() => setTab('signin')} style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', letterSpacing: '0.06em', color: '#D42B2B', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>SIGN IN</button>
              </p>
            </form>
          )}
        </div>
      </div>

      {/* ── Responsive collapse ── */}
      <style>{`
        @media (max-width: 768px) {
          .login-left-panel { display: none !important; }
        }
      `}</style>
    </div>
  )
}
