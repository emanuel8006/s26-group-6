import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const PLANS = [
  { id: 'unlimited', name: 'NU – Unlimited', price: 4450, swipes: null, diningDollars: 400, guestPasses: 10, tag: 'Most Flexible' },
  { id: '225',       name: 'NU – 225',       price: 4450, swipes: 225,  diningDollars: 600, guestPasses: 10, tag: 'Most Popular' },
  { id: '180',       name: 'NU – 180',       price: 3935, swipes: 180,  diningDollars: 300, guestPasses: 10, tag: null },
  { id: '150',       name: 'NU – 150',       price: 3465, swipes: 150,  diningDollars: 200, guestPasses: 10, tag: null },
  { id: '100',       name: 'NU – 100',       price: 2800, swipes: 100,  diningDollars: 200, guestPasses: 10, tag: 'Budget Pick' },
]

const RESTRICTION_OPTIONS = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Halal', 'Kosher', 'Nut-Free']
const CUISINE_OPTIONS = ['Mexican', 'Asian', 'Italian', 'Mediterranean', 'American', 'Indian', 'Comfort Food', 'Healthy']

const VENUE_OPTIONS = [
  {
    id: 'dining_hall', label: 'Dining Halls', sub: 'IV, Stetson East/West',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="12" width="22" height="13" rx="1"/>
        <path d="M3 12L14 4L25 12"/>
        <line x1="11" y1="25" x2="11" y2="17"/>
        <line x1="17" y1="25" x2="17" y2="17"/>
        <rect x="11" y="17" width="6" height="8"/>
      </svg>
    ),
  },
  {
    id: 'outtakes', label: 'Outtakes', sub: 'Up to 3 swipes/day',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 6h12l2 16H6L8 6z"/>
        <path d="M10 6V5a4 4 0 018 0v1"/>
        <line x1="11" y1="14" x2="17" y2="14"/>
      </svg>
    ),
  },
  {
    id: 'market', label: 'Market @ 60', sub: 'Up to 3 swipes/day',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 8h20l-2 12H6L4 8z"/>
        <path d="M4 8L6 4h16l2 4"/>
        <line x1="10" y1="13" x2="18" y2="13"/>
        <line x1="10" y1="17" x2="15" y2="17"/>
        <line x1="14" y1="8" x2="14" y2="20"/>
      </svg>
    ),
  },
  {
    id: 'restaurants', label: 'Restaurants', sub: 'Uses dining dollars',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="14" cy="13" r="7"/>
        <line x1="14" y1="6" x2="14" y2="20"/>
        <line x1="7" y1="13" x2="21" y2="13"/>
        <line x1="14" y1="22" x2="14" y2="26"/>
        <line x1="11" y1="26" x2="17" y2="26"/>
      </svg>
    ),
  },
]

const TOTAL_STEPS = 6

const ic = {
  check: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="16" cy="16" r="12"/>
      <polyline points="10,16 14,20 22,12"/>
    </svg>
  ),
  search: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="14" cy="14" r="8"/>
      <line x1="20" y1="20" x2="27" y2="27"/>
      <line x1="10" y1="14" x2="14" y2="10"/>
    </svg>
  ),
}

const s = {
  page: {
    minHeight: '100vh',
    background: '#FAF9F6',
    backgroundImage: 'linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)',
    backgroundSize: '24px 24px',
    fontFamily: "'Inter', sans-serif",
  },
  topbar: {
    background: '#FBF2D8',
    borderBottom: '2px solid #1a1a1a',
    padding: '0.9rem 2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  logo: { fontFamily: "'Chicle', serif", fontSize: '1.4rem', fontWeight: 700, color: '#1a1a1a' },
  exitBtn: { fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.85rem', letterSpacing: '0.08em', color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer' },
  container: { maxWidth: '560px', margin: '0 auto', padding: '2.5rem 1.5rem 4rem' },
  progressWrap: { marginBottom: '2.5rem' },
  progressTop: { display: 'flex', justifyContent: 'space-between', marginBottom: '6px' },
  progressLabel: { fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.78rem', letterSpacing: '0.1em', color: '#9CA3AF' },
  progressPct: { fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.78rem', letterSpacing: '0.05em', color: '#D42B2B' },
  progressTrack: { height: '5px', background: 'rgba(0,0,0,0.08)', borderRadius: '99px', overflow: 'hidden' },
  eyebrow: { fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.75rem', letterSpacing: '0.14em', color: '#D42B2B', display: 'block', marginBottom: '8px' },
  heading: { fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.7rem, 4vw, 2.3rem)', fontWeight: 700, color: '#1a1a1a', marginBottom: '8px', lineHeight: 1.15 },
  sub: { fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.9rem', letterSpacing: '0.03em', color: '#6B7280', marginBottom: '1.8rem', lineHeight: 1.65 },
  card: (selected) => ({
    background: selected ? '#FBF2D8' : '#fff',
    border: `2px solid ${selected ? '#1a1a1a' : 'rgba(0,0,0,0.12)'}`,
    borderRadius: '10px',
    padding: '1.2rem',
    cursor: 'pointer',
    textAlign: 'left',
    width: '100%',
    boxShadow: selected ? '4px 5px 0px #1a1a1a' : '2px 3px 0px rgba(0,0,0,0.08)',
    transform: selected ? 'translate(-1px,-1px)' : 'none',
    transition: 'all 0.12s ease',
  }),
  planCard: (selected) => ({
    background: selected ? '#FBF2D8' : '#fff',
    border: `2px solid ${selected ? '#1a1a1a' : 'rgba(0,0,0,0.1)'}`,
    borderRadius: '10px',
    padding: '1rem 1.2rem',
    cursor: 'pointer',
    textAlign: 'left',
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: selected ? '4px 5px 0px #1a1a1a' : '2px 3px 0px rgba(0,0,0,0.07)',
    transform: selected ? 'translate(-1px,-1px)' : 'none',
    marginBottom: '10px',
    transition: 'all 0.12s ease',
  }),
  chip: (selected) => ({
    padding: '5px 14px',
    borderRadius: '99px',
    border: `1.5px solid ${selected ? '#1a1a1a' : 'rgba(0,0,0,0.15)'}`,
    fontSize: '0.75rem',
    fontFamily: "'Bebas Neue', sans-serif",
    letterSpacing: '0.06em',
    cursor: 'pointer',
    background: selected ? '#FFE45C' : '#fff',
    color: '#1a1a1a',
    boxShadow: selected ? '2px 2px 0px #1a1a1a' : 'none',
    marginBottom: '6px',
    transition: 'all 0.12s ease',
  }),
  badgeRed: { fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.65rem', letterSpacing: '0.08em', padding: '2px 8px', borderRadius: '4px', border: '1.5px solid #1a1a1a', background: '#D42B2B', color: '#fff', display: 'inline-block' },
  badgeYellow: { fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.65rem', letterSpacing: '0.08em', padding: '2px 8px', borderRadius: '4px', border: '1.5px solid #1a1a1a', background: '#FFE45C', color: '#1a1a1a', display: 'inline-block' },
  input: { width: '100%', padding: '10px 14px', border: '2px solid rgba(0,0,0,0.12)', borderRadius: '8px', fontSize: '0.9rem', fontFamily: "'Inter', sans-serif", background: '#fff', color: '#1a1a1a', outline: 'none', boxSizing: 'border-box', boxShadow: '2px 3px 0px rgba(0,0,0,0.07)' },
  label: { display: 'block', fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.72rem', letterSpacing: '0.1em', color: '#9CA3AF', marginBottom: '6px' },
  hint: { fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.72rem', letterSpacing: '0.03em', color: '#9CA3AF', marginTop: '4px' },
  btnPrimary: { flex: 1, padding: '0.85rem 1.5rem', background: '#D42B2B', color: '#fff', border: '2.5px solid #1a1a1a', borderRadius: '8px', fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.95rem', letterSpacing: '0.07em', cursor: 'pointer', boxShadow: '3px 4px 0px #1a1a1a', transition: 'all 0.12s ease' },
  btnSecondary: { padding: '0.85rem 1.25rem', background: '#FBF2D8', color: '#1a1a1a', border: '2px solid rgba(0,0,0,0.18)', borderRadius: '8px', fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.95rem', letterSpacing: '0.07em', cursor: 'pointer', boxShadow: '2px 3px 0px rgba(0,0,0,0.08)', transition: 'all 0.12s ease' },
  btnDisabled: { flex: 1, padding: '0.85rem 1.5rem', background: 'rgba(0,0,0,0.06)', color: 'rgba(0,0,0,0.25)', border: '2px solid rgba(0,0,0,0.08)', borderRadius: '8px', fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.95rem', letterSpacing: '0.07em', cursor: 'not-allowed' },
  pathPill: { display: 'inline-block', fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.68rem', letterSpacing: '0.1em', padding: '3px 12px', borderRadius: '99px', background: '#FFE45C', border: '1.5px solid #1a1a1a', color: '#1a1a1a', marginBottom: '1rem', boxShadow: '2px 2px 0px #1a1a1a' },
  sectionLabel: { fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.72rem', letterSpacing: '0.1em', color: '#9CA3AF', display: 'block', margin: '1.2rem 0 0.7rem' },
  noticeBox: { background: '#FBF2D8', border: '2px solid #1a1a1a', borderRadius: '8px', padding: '12px 16px', fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.82rem', letterSpacing: '0.04em', color: '#1a1a1a', marginBottom: '1rem', boxShadow: '3px 3px 0px #1a1a1a' },
  summaryCard: { background: '#fff', border: '2px solid rgba(0,0,0,0.09)', borderRadius: '10px', padding: '1.1rem 1.2rem', marginBottom: '10px', boxShadow: '3px 4px 0px rgba(0,0,0,0.06)' },
  summaryLabel: { fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.68rem', letterSpacing: '0.12em', color: '#9CA3AF', display: 'block', marginBottom: '6px' },
}

function suggestPlan(swipesPerDay, dollarsPerDay) {
  const spd = parseFloat(swipesPerDay) || 0
  const dpd = parseFloat(dollarsPerDay) || 0
  const proj = Math.round(spd * 105)
  let best
  if (proj > 200)      best = PLANS.find(p => p.id === 'unlimited')
  else if (proj > 150) best = PLANS.find(p => p.id === '225')
  else if (proj > 120) best = PLANS.find(p => p.id === '180')
  else if (proj > 80)  best = PLANS.find(p => p.id === '150')
  else                 best = PLANS.find(p => p.id === '100')
  if (dpd > 6 && best && best.diningDollars < 400) best = PLANS.find(p => p.id === '225')
  return best
}

function ProgressBar({ step, total }) {
  const pct = Math.round((step / total) * 100)
  return (
    <div style={s.progressWrap}>
      <div style={s.progressTop}>
        <span style={s.progressLabel}>STEP {step} OF {total}</span>
        <span style={s.progressPct}>{pct}%</span>
      </div>
      <div style={s.progressTrack}>
        <div style={{ height: '100%', background: '#D42B2B', width: `${pct}%`, transition: 'width 0.4s ease', borderRadius: '99px' }} />
      </div>
    </div>
  )
}

function NavButtons({ onBack, onNext, nextLabel = 'CONTINUE', nextDisabled = false, step }) {
  return (
    <div style={{ display: 'flex', gap: '10px', marginTop: '2rem' }}>
      {step > 1 && <button onClick={onBack} style={s.btnSecondary}>BACK</button>}
      <button onClick={onNext} disabled={nextDisabled} style={nextDisabled ? s.btnDisabled : s.btnPrimary}>
        {nextLabel}
      </button>
    </div>
  )
}

function Chip({ label, selected, onToggle }) {
  return <button type="button" onClick={onToggle} style={s.chip(selected)}>{label}</button>
}

function PlanCard({ plan, selected, onClick, recBadge }) {
  return (
    <button onClick={onClick} style={s.planCard(selected)}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '0.95rem', color: '#1a1a1a' }}>{plan.name}</span>
          {recBadge && <span style={s.badgeYellow}>RECOMMENDED</span>}
          {!recBadge && plan.tag && <span style={s.badgeRed}>{plan.tag}</span>}
        </div>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.75rem', letterSpacing: '0.04em', color: '#9CA3AF', display: 'flex', gap: '14px' }}>
          <span>{plan.swipes === null ? 'Unlimited swipes' : `${plan.swipes} swipes`}</span>
          <span>${plan.diningDollars} dining dollars</span>
          <span>{plan.guestPasses} guest passes</span>
        </div>
      </div>
      <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1rem', letterSpacing: '0.04em', color: '#1a1a1a', flexShrink: 0 }}>${plan.price.toLocaleString()}</span>
    </button>
  )
}

function VenueGrid({ venues, onToggle }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '1.5rem' }}>
      {VENUE_OPTIONS.map(({ id, label, sub, icon }) => {
        const selected = venues.includes(id)
        return (
          <button key={id} type="button" onClick={() => onToggle(id)}
            style={{ ...s.card(selected), padding: '1rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ color: selected ? '#D42B2B' : '#9CA3AF', transition: 'color 0.12s' }}>
              {icon}
            </div>
            <div>
              <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '0.88rem', color: '#1a1a1a', margin: '0 0 2px' }}>{label}</p>
              <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.7rem', letterSpacing: '0.04em', color: '#9CA3AF', margin: 0 }}>{sub}</p>
            </div>
          </button>
        )
      })}
    </div>
  )
}

function PreferencesStep({ answers, toggleArr, onBack, onNext, step, isNewPlan }) {
  return (
    <div>
      {isNewPlan && <span style={s.pathPill}>FINDING YOU THE RIGHT PLAN</span>}
      <span style={{ display: 'block', ...s.eyebrow }}>FOOD PREFERENCES</span>
      <h2 style={s.heading}>Any dietary restrictions?</h2>
      <p style={s.sub}>We'll filter food recommendations to match. Skip ahead if none apply.</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '1.5rem' }}>
        {RESTRICTION_OPTIONS.map(opt => (
          <Chip key={opt} label={opt} selected={answers.restrictions.includes(opt)} onToggle={() => toggleArr('restrictions', opt)} />
        ))}
      </div>
      <span style={s.sectionLabel}>CUISINE PREFERENCES</span>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {CUISINE_OPTIONS.map(opt => (
          <Chip key={opt} label={opt} selected={answers.cuisines.includes(opt)} onToggle={() => toggleArr('cuisines', opt)} />
        ))}
      </div>
      <NavButtons step={step} onBack={onBack} onNext={onNext} />
    </div>
  )
}

function HabitsStep({ answers, set, toggleArr, onBack, onNext, step, isNewPlan, selectedPlan }) {
  return (
    <div>
      {isNewPlan && <span style={s.pathPill}>FINDING YOU THE RIGHT PLAN</span>}
      <span style={{ display: 'block', ...s.eyebrow }}>EATING HABITS</span>
      <h2 style={s.heading}>{isNewPlan ? 'How do you expect to eat?' : 'How do you usually eat?'}</h2>
      <p style={s.sub}>{isNewPlan ? "Give us your best estimate — we'll use this to recommend the right plan." : 'Helps us build smarter budget projections.'}</p>
      <span style={s.sectionLabel}>{isNewPlan ? "WHERE DO YOU THINK YOU'LL EAT MOST?" : 'WHERE DO YOU EAT MOST?'}</span>
      <VenueGrid venues={answers.venues} onToggle={(id) => toggleArr('venues', id)} />
      {(isNewPlan || selectedPlan?.swipes !== null) && (
        <div style={{ marginBottom: '1.2rem' }}>
          <label style={s.label}>EXPECTED SWIPES PER DAY</label>
          <select value={answers.swipesPerDay} onChange={e => set('swipesPerDay', e.target.value)} style={s.input}>
            <option value="">Select...</option>
            {['0.5 (every other day)', '1', '1.5', '2', '2.5', '3+'].map(v => <option key={v}>{v}</option>)}
          </select>
          <p style={s.hint}>Includes dining halls, Outtakes, and Market @ 60.</p>
        </div>
      )}
      <div>
        <label style={s.label}>EXPECTED DINING DOLLARS PER DAY</label>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', fontSize: '0.9rem' }}>$</span>
          <input type="number" step="0.50" placeholder="e.g. 5.00"
            value={answers.dollarsPerDay} onChange={e => set('dollarsPerDay', e.target.value)}
            style={{ ...s.input, paddingLeft: '28px' }} />
        </div>
      </div>
      <NavButtons step={step} onBack={onBack} onNext={onNext} nextLabel={isNewPlan ? 'CONTINUE' : 'ALMOST DONE'} />
    </div>
  )
}

export default function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [answers, setAnswers] = useState({
    onPlan: null, planId: null, swipesLeft: '', diningDollarsLeft: '',
    semesterEnd: '', semesterStart: '', restrictions: [], cuisines: [],
    venues: [], swipesPerDay: '', dollarsPerDay: '',
  })

  const set = (key, val) => setAnswers(a => ({ ...a, [key]: val }))
  const toggleArr = (key, val) => setAnswers(a => ({
    ...a,
    [key]: a[key].includes(val) ? a[key].filter(x => x !== val) : [...a[key], val]
  }))

  const selectedPlan = PLANS.find(p => p.id === answers.planId)
  const next = () => setStep(s => Math.min(s + 1, TOTAL_STEPS))
  const back = () => setStep(s => Math.max(s - 1, 1))

  const finish = () => {
    localStorage.setItem('nomnom_profile', JSON.stringify({
      ...answers, planData: selectedPlan || null, createdAt: new Date().toISOString(),
    }))
    navigate('/dashboard')
  }

  return (
    <div style={s.page}>
      <div style={s.topbar}>
        <span style={s.logo}>NomNom</span>
        <button onClick={() => navigate('/')} style={s.exitBtn}>EXIT</button>
      </div>

      <div style={s.container}>
        <ProgressBar step={step} total={TOTAL_STEPS} />

        {/* STEP 1 */}
        {step === 1 && (
          <div>
            <span style={s.eyebrow}>LET'S GET STARTED</span>
            <h2 style={s.heading}>Are you currently on a dining plan?</h2>
            <p style={s.sub}>This helps us know if we're tracking your existing plan or helping you find the right one.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              {[
                {
                  val: true, title: 'Yes, I am', sub: "I'm mid-semester and already on a plan.",
                  icon: ic.check,
                },
                {
                  val: false, title: 'Not yet', sub: "I'm looking for a plan for an upcoming semester.",
                  icon: ic.search,
                },
              ].map(({ val, title, sub, icon }) => {
                const selected = answers.onPlan === val
                return (
                  <button key={String(val)}
                    onClick={() => { set('onPlan', val); setTimeout(next, 180) }}
                    style={s.card(selected)}>
                    <div style={{ color: selected ? '#D42B2B' : '#CBCBCB', marginBottom: '12px', transition: 'color 0.15s' }}>
                      {icon}
                    </div>
                    <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '1rem', color: '#1a1a1a', margin: '0 0 6px' }}>{title}</p>
                    <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.78rem', letterSpacing: '0.03em', color: '#6B7280', margin: 0, lineHeight: 1.55 }}>{sub}</p>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ON A PLAN — Step 2 */}
        {answers.onPlan === true && step === 2 && (
          <div>
            <span style={s.eyebrow}>YOUR PLAN</span>
            <h2 style={s.heading}>Which plan are you on?</h2>
            <p style={s.sub}>Select your current Northeastern dining plan.</p>
            {PLANS.map(plan => (
              <PlanCard key={plan.id} plan={plan} selected={answers.planId === plan.id} onClick={() => set('planId', plan.id)} />
            ))}
            <NavButtons step={step} onBack={back} onNext={next} nextDisabled={!answers.planId} />
          </div>
        )}

        {/* ON A PLAN — Step 3 */}
        {answers.onPlan === true && step === 3 && (
          <div>
            <span style={s.eyebrow}>CURRENT BALANCES</span>
            <h2 style={s.heading}>Where are you at right now?</h2>
            <p style={s.sub}>We'll use these to calculate your pace and projections.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {selectedPlan?.swipes !== null ? (
                <div>
                  <label style={s.label}>SWIPES REMAINING</label>
                  <input type="number" placeholder={`e.g. ${Math.floor((selectedPlan?.swipes ?? 225) * 0.6)}`}
                    value={answers.swipesLeft} onChange={e => set('swipesLeft', e.target.value)} style={s.input} />
                  <p style={s.hint}>Your plan started with {selectedPlan?.swipes} swipes.</p>
                </div>
              ) : (
                <div style={s.noticeBox}>UNLIMITED SWIPES — NO TRACKING NEEDED. WE'LL FOCUS ON YOUR DINING DOLLARS.</div>
              )}
              <div>
                <label style={s.label}>DINING DOLLARS REMAINING</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', fontSize: '0.9rem' }}>$</span>
                  <input type="number" placeholder={`e.g. ${Math.floor((selectedPlan?.diningDollars ?? 600) * 0.6)}`}
                    value={answers.diningDollarsLeft} onChange={e => set('diningDollarsLeft', e.target.value)}
                    style={{ ...s.input, paddingLeft: '28px' }} />
                </div>
                <p style={s.hint}>Your plan started with ${selectedPlan?.diningDollars}.</p>
              </div>
              <div>
                <label style={s.label}>SEMESTER END DATE</label>
                <input type="date" value={answers.semesterEnd} onChange={e => set('semesterEnd', e.target.value)} style={s.input} />
              </div>
            </div>
            <NavButtons step={step} onBack={back} onNext={next} nextDisabled={!answers.diningDollarsLeft || !answers.semesterEnd} />
          </div>
        )}

        {/* ON A PLAN — Step 4 */}
        {answers.onPlan === true && step === 4 && (
          <PreferencesStep answers={answers} toggleArr={toggleArr} onBack={back} onNext={next} step={step} isNewPlan={false} />
        )}

        {/* ON A PLAN — Step 5 */}
        {answers.onPlan === true && step === 5 && (
          <HabitsStep answers={answers} set={set} toggleArr={toggleArr} onBack={back} onNext={next} step={step} isNewPlan={false} selectedPlan={selectedPlan} />
        )}

        {/* NOT ON A PLAN — Step 2 */}
        {answers.onPlan === false && step === 2 && (
          <PreferencesStep answers={answers} toggleArr={toggleArr} onBack={back} onNext={next} step={step} isNewPlan={true} />
        )}

        {/* NOT ON A PLAN — Step 3 */}
        {answers.onPlan === false && step === 3 && (
          <HabitsStep answers={answers} set={set} toggleArr={toggleArr} onBack={back} onNext={next} step={step} isNewPlan={true} selectedPlan={null} />
        )}

        {/* NOT ON A PLAN — Step 4 */}
        {answers.onPlan === false && step === 4 && (
          <div>
            <span style={s.pathPill}>FINDING YOU THE RIGHT PLAN</span>
            <span style={{ display: 'block', ...s.eyebrow }}>SEMESTER DATES</span>
            <h2 style={s.heading}>When does your semester start?</h2>
            <p style={s.sub}>We'll project how your plan will last across the full semester.</p>
            <div>
              <label style={s.label}>SEMESTER START DATE</label>
              <input type="date" value={answers.semesterStart} onChange={e => set('semesterStart', e.target.value)} style={s.input} />
              <p style={s.hint}>We'll assume a ~15 week semester from this date.</p>
            </div>
            <NavButtons step={step} onBack={back} onNext={next} nextLabel="SEE MY RECOMMENDATION" nextDisabled={!answers.semesterStart} />
          </div>
        )}

        {/* NOT ON A PLAN — Step 5 */}
        {answers.onPlan === false && step === 5 && (() => {
          const rec = suggestPlan(answers.swipesPerDay, answers.dollarsPerDay)
          const projSwipes = Math.round((parseFloat(answers.swipesPerDay) || 0) * 105)
          const projDD = Math.round((parseFloat(answers.dollarsPerDay) || 0) * 105)
          return (
            <div>
              <span style={s.pathPill}>FINDING YOU THE RIGHT PLAN</span>
              <span style={{ display: 'block', ...s.eyebrow }}>PLAN SUGGESTION</span>
              <h2 style={s.heading}>Here's what we'd recommend</h2>
              <p style={s.sub}>Based on ~{projSwipes} projected swipes and ~${projDD} in dining dollars over the semester. You can always pick a different one.</p>
              {PLANS.map(plan => {
                const isRec = plan.id === rec?.id
                const isSelected = answers.planId ? answers.planId === plan.id : isRec
                return (
                  <PlanCard key={plan.id} plan={plan} selected={isSelected} onClick={() => set('planId', plan.id)} recBadge={isRec} />
                )
              })}
              <NavButtons step={step} onBack={back} onNext={next} nextLabel="LOOKS GOOD" />
            </div>
          )
        })()}

        {/* STEP 6 — Summary */}
        {step === 6 && (
          <div>
            <span style={s.eyebrow}>ALL DONE</span>
            <h2 style={s.heading}>Here's your summary</h2>
            <p style={s.sub}>Confirm everything looks right before we set up your dashboard.</p>

            <div style={s.summaryCard}>
              <span style={s.summaryLabel}>DINING PLAN</span>
              <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '1rem', color: '#1a1a1a', margin: '0 0 3px' }}>{selectedPlan?.name ?? '—'}</p>
              <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.78rem', letterSpacing: '0.04em', color: '#9CA3AF', margin: 0 }}>
                {selectedPlan?.swipes === null ? 'Unlimited swipes' : `${selectedPlan?.swipes} swipes`}
                {' · '}${selectedPlan?.diningDollars} dining dollars
                {' · '}${selectedPlan?.price?.toLocaleString()}/semester
              </p>
            </div>

            {answers.onPlan ? (
              <div style={s.summaryCard}>
                <span style={s.summaryLabel}>CURRENT BALANCES</span>
                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                  {selectedPlan?.swipes !== null && (
                    <div>
                      <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '1.4rem', color: '#1a1a1a', margin: '0 0 2px' }}>{answers.swipesLeft || '—'}</p>
                      <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.68rem', letterSpacing: '0.08em', color: '#9CA3AF', margin: 0 }}>SWIPES LEFT</p>
                    </div>
                  )}
                  <div>
                    <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '1.4rem', color: '#1a1a1a', margin: '0 0 2px' }}>${answers.diningDollarsLeft || '—'}</p>
                    <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.68rem', letterSpacing: '0.08em', color: '#9CA3AF', margin: 0 }}>DINING DOLLARS</p>
                  </div>
                  <div>
                    <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '1.1rem', color: '#1a1a1a', margin: '0 0 2px' }}>{answers.semesterEnd || '—'}</p>
                    <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.68rem', letterSpacing: '0.08em', color: '#9CA3AF', margin: 0 }}>SEMESTER END</p>
                  </div>
                </div>
              </div>
            ) : (
              <div style={s.summaryCard}>
                <span style={s.summaryLabel}>SEMESTER START</span>
                <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '1rem', color: '#1a1a1a', margin: 0 }}>{answers.semesterStart || '—'}</p>
              </div>
            )}

            {(answers.restrictions.length > 0 || answers.cuisines.length > 0) && (
              <div style={s.summaryCard}>
                <span style={s.summaryLabel}>PREFERENCES</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {[...answers.restrictions, ...answers.cuisines].map(tag => (
                    <span key={tag} style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.7rem', letterSpacing: '0.06em', padding: '3px 10px', borderRadius: '99px', background: '#FFE45C', border: '1.5px solid #1a1a1a', color: '#1a1a1a' }}>{tag}</span>
                  ))}
                </div>
              </div>
            )}

            <div style={s.summaryCard}>
              <span style={s.summaryLabel}>DAILY HABITS</span>
              <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.82rem', letterSpacing: '0.04em', color: '#1a1a1a', margin: 0 }}>
                {[
                  answers.swipesPerDay ? `${answers.swipesPerDay} swipes/day` : '',
                  answers.dollarsPerDay ? `$${answers.dollarsPerDay}/day` : '',
                ].filter(Boolean).join('  ·  ') || 'Not set'}
              </p>
            </div>

            <NavButtons step={step} onBack={back} onNext={finish} nextLabel="GO TO MY DASHBOARD" />
          </div>
        )}
      </div>
    </div>
  )
}
