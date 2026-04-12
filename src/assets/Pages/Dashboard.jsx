import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PhotoReel from '../Components/PhotoReel'
import { updateMealPlan } from '../Components/APICalls'

// ── Helpers ───────────────────────────────────────────────────────
function today() { return new Date() }

function parseDate(str) {
  if (!str) return null
  return new Date(str + 'T12:00:00')
}

function daysUntil(dateStr) {
  if (!dateStr) return null
  const diff = parseDate(dateStr) - today()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

function daysSince(dateStr) {
  if (!dateStr) return null
  const diff = today() - parseDate(dateStr)
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))
}

function getBreakOffDays(semesterBreaks = []) {
  const days = new Set()
  semesterBreaks.forEach(b => {
    if (b.enabled) {
      b.dates?.forEach(d => days.add(d))
      if (b.weekendEnabled) b.weekendDates?.forEach(d => days.add(d))
    }
  })
  return [...days]
}

function calcActiveDaysLeft(endStr, breaks = [], customOffDays = []) {
  if (!endStr) return null
  const end = parseDate(endStr)
  const t = today()
  if (t >= end) return 0
  let count = 0
  const cur = new Date(t)
  cur.setDate(cur.getDate() + 1)
  const breakSet = new Set([...getBreakOffDays(breaks), ...customOffDays])
  while (cur <= end) {
    const ds = cur.toISOString().split('T')[0]
    if (!breakSet.has(ds)) count++
    cur.setDate(cur.getDate() + 1)
  }
  return count
}

function calcTotalActiveDays(startStr, endStr, breaks = [], customOffDays = []) {
  if (!startStr || !endStr) return 105
  const start = parseDate(startStr)
  const end = parseDate(endStr)
  if (!start || !end) return 105
  const totalDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)))
  const breakSet = new Set([...getBreakOffDays(breaks), ...customOffDays])
  let breakCount = 0
  const cur = new Date(start)
  while (cur <= end) {
    if (breakSet.has(cur.toISOString().split('T')[0])) breakCount++
    cur.setDate(cur.getDate() + 1)
  }
  return Math.max(1, totalDays - breakCount)
}

function calcPace(remaining, total, activeDaysLeft, totalActiveDays) {
  if (!total || total <= 0 || !totalActiveDays) return null
  const pctLeft = activeDaysLeft / totalActiveDays
  const expectedRemaining = total * pctLeft
  const diff = remaining - expectedRemaining
  const pctDiff = Math.abs(diff) / total
  if (pctDiff < 0.05) return 'on_track'
  if (diff > 0) return 'under_budget'
  return 'over_budget'
}

const PACE_LABELS = {
  on_track:     { label: 'On Pace',       color: '#2d6a1f', bg: '#f0f7eb', border: '#c8deba' },
  under_budget: { label: 'Ahead',         color: '#1a4fa0', bg: '#e6f0ff', border: '#b8d0f0' },
  over_budget:  { label: 'Spending Fast', color: '#D42B2B', bg: '#FFF0EE', border: '#f0b8b8' },
}

// ── Styles ────────────────────────────────────────────────────────
const S = {
  hero: { background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)', color: '#fff', overflow: 'hidden', position: 'relative' },
  heroInner: { maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 2rem', position: 'relative', zIndex: 2 },
  heroEyebrow: { fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.5rem', letterSpacing: '0.14em', color: '#D42B2B', marginBottom: '6px', display: 'block' },
  heroTitle: { fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 700, color: '#fff', margin: '0 0 6px', lineHeight: 1.1 },
  heroSub: { fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.5rem', letterSpacing: '0.04em', color: 'rgba(255,255,255,0.5)', margin: 0 },
  heroDot: (color) => ({ width: '8px', height: '8px', borderRadius: '50%', background: color, display: 'inline-block', marginRight: '8px', boxShadow: `0 0 6px ${color}` }),
  statGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginTop: '1.5rem' },
  miniStat: { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '12px 16px' },
  miniStatVal: { fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '1.8rem', color: '#fff', margin: '0 0 2px', lineHeight: 1.3 },
  miniStatLabel: { fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.5rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.45)', margin: 1 },
  body: { maxWidth: '1100px', margin: '0 auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' },
  threeCol: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.2rem' },
  card: { background: '#fff', border: '2px solid rgba(0,0,0,0.08)', borderRadius: '12px', padding: '1.4rem', boxShadow: '3px 4px 0px rgba(0,0,0,0.06)' },
  cardLabel: { fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.5rem', letterSpacing: '0.1em', color: '#6B7280', display: 'block', marginBottom: '4px' },
  bigNum: { fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '2.4rem', color: '#1a1a1a', lineHeight: 1, margin: '0 0 2px' },
  bigNumSub: { fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.5rem', letterSpacing: '0.06em', color: '#9CA3AF', margin: 0 },
  progressTrack: { height: '8px', background: 'rgba(0,0,0,0.06)', borderRadius: '99px', overflow: 'hidden', margin: '10px 0 6px' },
  paceBadge: (pace) => {
    const p = PACE_LABELS[pace] || PACE_LABELS.on_track
    return { fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.5rem', letterSpacing: '0.08em', padding: '3px 10px', borderRadius: '99px', background: p.bg, color: p.color, border: `1.5px solid ${p.border}`, display: 'inline-block' }
  },
  actionBtn: (variant = 'default') => ({
    display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px 16px',
    background: variant === 'primary' ? '#D42B2B' : variant === 'yellow' ? '#FFE45C' : '#fff',
    color: variant === 'yellow' ? '#1a1a1a' : variant === 'primary' ? '#fff' : '#1a1a1a',
    border: `2px solid ${variant === 'primary' ? '#1a1a1a' : 'rgba(0,0,0,0.12)'}`,
    borderRadius: '10px', cursor: 'pointer', textAlign: 'left',
    boxShadow: variant === 'primary' ? '3px 3px 0px #1a1a1a' : '2px 2px 0px rgba(0,0,0,0.07)',
    fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.5rem', letterSpacing: '0.06em',
    transition: 'all 0.12s ease', marginBottom: '8px',
  }),
  logModal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' },
  logCard: { background: '#fff', border: '2px solid #1a1a1a', borderRadius: '14px', padding: '1.8rem', maxWidth: '400px', width: '100%', boxShadow: '5px 6px 0px #1a1a1a' },
  input: { width: '100%', padding: '10px 14px', border: '2px solid rgba(0,0,0,0.12)', borderRadius: '8px', fontSize: '0.9rem', fontFamily: "'Inter', sans-serif", background: '#fff', color: '#1a1a1a', outline: 'none', boxSizing: 'border-box', boxShadow: '2px 3px 0px rgba(0,0,0,0.07)', marginBottom: '10px' },
}


// ── Log modal ─────────────────────────────────────────────────────
function LogModal({ type, onClose, onSave }) {
  const [val, setVal] = useState('')
  const [loc, setLoc] = useState('')
  const isSwipe = type === 'swipe'

  return (
    <div style={S.logModal} onClick={onClose}>
      <div style={S.logCard} onClick={e => e.stopPropagation()}>
        <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.5rem', letterSpacing: '0.1em', color: '#6B7280', margin: '0 0 4px' }}>
          LOG A {isSwipe ? 'SWIPE' : 'TRANSACTION'}
        </p>
        <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '1.4rem', color: '#1a1a1a', margin: '0 0 1.2rem' }}>
          {isSwipe ? 'Use a Swipe' : 'Log Dining Dollars'}
        </p>

        {isSwipe ? (
          <div>
            <label style={{ ...S.cardLabel, marginBottom: '6px' }}>DINING LOCATION</label>
            <select value={loc} onChange={e => setLoc(e.target.value)} style={S.input}>
              <option value="">Select...</option>
              <option>International Village</option>
              <option>Stetson East</option>
              <option>Stetson West</option>
              <option>Outtakes</option>
              <option>Market @ 60</option>
            </select>
          </div>
        ) : (
          <div>
            <label style={{ ...S.cardLabel, marginBottom: '6px' }}>AMOUNT SPENT</label>
            <div style={{ position: 'relative', marginBottom: '10px' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', fontSize: '0.9rem' }}>$</span>
              <input type="number" inputMode="decimal" placeholder="0.00" value={val}
                onKeyDown={e => ['e','E','+','-'].includes(e.key) && e.preventDefault()}
                onWheel={e => e.target.blur()}
                onChange={e => {
                  const v = e.target.value
                  if (v === '' || v === '.') { setVal(v); return }
                  const n = parseFloat(v)
                  if (isNaN(n) || n < 0) return
                  if (n > 400) { setVal('400'); return }
                  const parts = v.split('.')
                  if (parts[1] && parts[1].length > 2) return
                  setVal(v)
                }}
                style={{ ...S.input, paddingLeft: '28px', marginBottom: 0 }} />
            </div>
            <label style={{ ...S.cardLabel, marginBottom: '6px' }}>LOCATION</label>
            <input type="text" placeholder="e.g. Dunkin' on Huntington" value={loc} onChange={e => setLoc(e.target.value)} style={S.input} />
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
          <button onClick={onClose}
            style={{ flex: 1, padding: '10px', border: '2px solid rgba(0,0,0,0.12)', borderRadius: '8px', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.5rem', letterSpacing: '0.06em', cursor: 'pointer', background: '#fff', color: '#9CA3AF' }}>
            CANCEL
          </button>
          <button onClick={() => { onSave({ type, val, loc }); onClose() }}
            style={{ flex: 2, padding: '10px', background: '#D42B2B', border: '2px solid #1a1a1a', borderRadius: '8px', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.5rem', letterSpacing: '0.06em', cursor: 'pointer', color: '#fff', boxShadow: '2px 3px 0 #1a1a1a' }}>
            SAVE
          </button>
        </div>
      </div>
    </div>
  )
}


// ── Main Dashboard ────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [logModal, setLogModal] = useState(null)
  const [toast, setToast] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!localStorage.getItem('sw_logged_in')) { navigate('/login'); return }
    setProfile({
      planData: {
        name:          localStorage.getItem('oasis_plan_name'),
        swipes:        localStorage.getItem('oasis_swipes_start') ? parseInt(localStorage.getItem('oasis_swipes_start')) : null,
        diningDollars: parseFloat(localStorage.getItem('oasis_dining_dollars_start')) || 0,
      },
      swipesLeft:        localStorage.getItem('oasis_swipes_current'),
      diningDollarsLeft: localStorage.getItem('oasis_dining_dollars_current'),
      semesterStart:     localStorage.getItem('oasis_start_date'),
      semesterEnd:       localStorage.getItem('oasis_end_date'),
      customOffDays:     JSON.parse(localStorage.getItem('oasis_offdays') || '[]'),
      dollarsPerWeek:    localStorage.getItem('oasis_dollars_per_week'),
      swipesPerWeek:     localStorage.getItem('oasis_swipes_per_week'),
    })
    setLoading(false)
  }, [navigate])

  if (loading || !profile) return null

  // ── Derived values ────────────────────────────────────────────
  const plan = profile.planData
  const semStart = profile.semesterStart
  const semEnd = profile.semesterEnd
  const breaks = []
  const customOff = profile.customOffDays || []

  const daysLeft = daysUntil(semEnd)
  const totalActiveDays = calcTotalActiveDays(semStart, semEnd, breaks, customOff)
  const activeDaysLeft = calcActiveDaysLeft(semEnd, breaks, customOff)
  const pctElapsed = totalActiveDays > 0 ? Math.min(1, (totalActiveDays - (activeDaysLeft || 0)) / totalActiveDays) : 0

  // Swipes
  const totalSwipes = profile.planData.swipes
  const currentSwipes = profile.swipesLeft ? parseInt(profile.swipesLeft) : null
  const swipePct = totalSwipes ? Math.round((currentSwipes / totalSwipes) * 100) : null
  const swipePace = totalSwipes ? calcPace(currentSwipes, totalSwipes, activeDaysLeft, totalActiveDays) : null

  // Dining dollars
  const totalDD = plan?.diningDollars || 0
  const currentDD = parseFloat(profile.diningDollarsLeft) || 0
  const ddPct = totalDD ? Math.round((currentDD / totalDD) * 100) : 0
  const ddPace = calcPace(currentDD, totalDD, activeDaysLeft, totalActiveDays)

  // Max sustainable daily rate (exhaust exactly at end date)
  const maxDailyDD = activeDaysLeft > 0 ? currentDD / activeDaysLeft : 0

  // ── Analysis ────────────────────────────────────────────────────
  const swipesUsed = totalSwipes ? totalSwipes - currentSwipes : null
  const ddSpent = totalDD - currentDD
  const daysSoFar = Math.max(1, daysSince(semStart))

  const actualDailySwipes = (swipesUsed > 0 && daysSoFar > 0) ? swipesUsed / daysSoFar : null
  const actualDailyDD = (ddSpent > 0 && daysSoFar > 0) ? ddSpent / daysSoFar : null

  const projDailySwipes = profile.swipesPerWeek
    ? parseInt(profile.swipesPerWeek) / 7
    : actualDailySwipes
  const projDailyDD = profile.dollarsPerWeek
    ? parseFloat(profile.dollarsPerWeek) / 7
    : actualDailyDD

  const projEndSwipes = (currentSwipes !== null && projDailySwipes && activeDaysLeft)
    ? Math.round(currentSwipes - projDailySwipes * activeDaysLeft)
    : null
  const projEndDD = (projDailyDD && activeDaysLeft)
    ? currentDD - projDailyDD * activeDaysLeft
    : null

  const swipeDepletionDays = (projEndSwipes !== null && projEndSwipes < 0 && projDailySwipes > 0)
    ? Math.floor(currentSwipes / projDailySwipes) : null
  const ddDepletionDays = (projEndDD !== null && projEndDD < 0 && projDailyDD > 0)
    ? Math.floor(currentDD / projDailyDD) : null

  // Semester label
  const semLabel = semEnd ? new Date(semEnd + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'This Semester'

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  })()

  const overallPace = (swipePace === 'over_budget' || ddPace === 'over_budget') ? 'over_budget'
    : (swipePace === 'under_budget' && ddPace === 'under_budget') ? 'under_budget'
    : 'on_track'

  const handleLog = ({ type, val, loc }) => {
    if (type === 'swipe') {
      const newVal = Math.max(0, (parseInt(localStorage.getItem('oasis_swipes_current') || '0')) - 1)
      localStorage.setItem('oasis_swipes_current', newVal)
      setProfile(p => ({ ...p, swipesLeft: String(newVal) }))
      updateMealPlan({ swipesCurrent: newVal })
      showToast(`Swipe logged${loc ? ` at ${loc}` : ''}`)
    } else {
      const spent = parseFloat(val) || 0
      const newVal = Math.max(0, (parseFloat(localStorage.getItem('oasis_dining_dollars_current') || '0')) - spent)
      localStorage.setItem('oasis_dining_dollars_current', newVal.toFixed(2))
      setProfile(p => ({ ...p, diningDollarsLeft: String(newVal) }))
      updateMealPlan({ diningDollarsCurrent: newVal })
      showToast(`$${spent.toFixed(2)} logged`)
    }
  }

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <div style={{ backgroundColor: '#FAF9F6', backgroundImage: 'linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)', backgroundSize: '24px 24px', minHeight: '100vh' }}>

      {/* ── Hero ── */}
      <div style={S.hero}>
        <PhotoReel />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 80% 50%, rgba(212,43,43,0.12), transparent 60%), radial-gradient(circle at 20% 80%, rgba(255,228,92,0.06), transparent 50%)', zIndex: 1 }} />
        <div style={{ position: 'absolute', inset: 0, opacity: 0.03, backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '22px 22px', zIndex: 1 }} />
        <div style={S.heroInner}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={S.heroEyebrow}>DASHBOARD</span>
              <h1 style={S.heroTitle}>{greeting}</h1>
              <p style={S.heroSub}>{semLabel} · {plan?.name || 'No plan set'}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '10px 16px' }}>
              <span style={S.heroDot(overallPace === 'over_budget' ? '#f87171' : overallPace === 'under_budget' ? '#60a5fa' : '#4ade80')} />
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.5rem', letterSpacing: '0.06em', color: '#fff' }}>
                {PACE_LABELS[overallPace].label}
              </span>
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.5rem', letterSpacing: '0.04em', color: 'rgba(255,255,255,0.4)' }}>
                · {daysLeft ?? '—'} days left
              </span>
            </div>
          </div>

          <div style={S.statGrid}>
            {[
              { label: 'CALENDAR DAYS LEFT', value: daysLeft ?? '—' },
              { label: 'SWIPES',        value: currentSwipes ?? '—' },
              { label: 'DINING DOLLARS',     value: currentDD > 0 ? `$${currentDD.toFixed(0)}` : '—' },
            ].map(({ label, value }) => (
              <div key={label} style={S.miniStat}>
                <p style={S.miniStatVal}>{value}</p>
                <p style={S.miniStatLabel}>{label}</p>
              </div>
            ))}
            <div style={S.miniStat}>
              <div style={{ marginBottom: '6px' }}>
                <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '1.8rem', color: '#fff' }}>{Math.round(pctElapsed * 100)}%</span>
              </div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.12)', borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: '#fff', width: `${pctElapsed * 100}%`, borderRadius: '99px', transition: 'width 0.6s ease' }} />
              </div>
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.5rem', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.45)', display: 'block', marginTop: '5px' }}>SEMESTER PROGRESS</span>
            </div>
          </div>
        </div>
      </div>

      <div style={S.body}>

        {/* ── Balance cards ── */}
        <div style={S.twoCol}>
          {/* Swipes */}
          <div style={S.card}>
            <span style={S.cardLabel}>MEAL SWIPES</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4px' }}>
              <div>
                <p style={S.bigNum}>{totalSwipes === null ? '∞' : currentSwipes} {totalSwipes ? `/ ${totalSwipes} total` : 'Unlimited'}</p>
              </div>
              {swipePace && <span style={S.paceBadge(swipePace)}>{PACE_LABELS[swipePace].label}</span>}
            </div>
            {totalSwipes && (
              <>
                <div style={S.progressTrack}>
                  <div style={{ height: '100%', background: swipePace === 'over_budget' ? '#D42B2B' : '#2d6a1f', width: `${swipePct}%`, borderRadius: '99px', transition: 'width 0.6s ease' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1rem', letterSpacing: '0.06em', color: '#9CA3AF' }}>{swipePct}% remaining</span>
                  <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1rem', letterSpacing: '0.06em', color: '#9CA3AF' }}>
                    ~{activeDaysLeft > 0 ? (currentSwipes / activeDaysLeft).toFixed(1) : '—'}/day left to use
                  </span>
                </div>
                {projEndSwipes !== null && (
                  <div style={{ marginTop: '6px', fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.9rem', letterSpacing: '0.05em', color: projEndSwipes >= 0 ? '#2d6a1f' : '#D42B2B' }}>
                    {projEndSwipes >= 0
                      ? `↗ Projected end: +${projEndSwipes} swipes remaining`
                      : `↘ Runs out in ~${swipeDepletionDays} day${swipeDepletionDays !== 1 ? 's' : ''}`}
                  </div>
                )}
              </>
            )}
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button style={{ ...S.actionBtn('primary'), flex: 1, width: 'auto', marginBottom: 0, marginTop: 0 }} onClick={() => setLogModal('swipe')}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="4" width="12" height="8" rx="1.5"/><line x1="5" y1="4" x2="5" y2="12"/></svg>
                USE A SWIPE
              </button>
              <button style={{ ...S.actionBtn(), width: 'auto', marginBottom: 0, marginTop: 0, padding: '12px 14px', justifyContent: 'center' }} onClick={() => navigate('/swipes')}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><circle cx="3" cy="8" r="1.5"/><circle cx="8" cy="8" r="1.5"/><circle cx="13" cy="8" r="1.5"/></svg>
              </button>
            </div>
          </div>

          {/* Dining Dollars */}
          <div style={S.card}>
            <span style={S.cardLabel}>DINING DOLLARS</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4px' }}>
              <div>
                <p style={S.bigNum}>${currentDD.toFixed(0)} / ${totalDD}</p>
              </div>
              {ddPace && <span style={S.paceBadge(ddPace)}>{PACE_LABELS[ddPace].label}</span>}
            </div>
            <div style={S.progressTrack}>
              <div style={{ height: '100%', background: ddPace === 'over_budget' ? '#D42B2B' : '#2d6a1f', width: `${ddPct}%`, borderRadius: '99px', transition: 'width 0.6s ease' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1rem', letterSpacing: '0.06em', color: '#9CA3AF' }}>{ddPct}% remaining</span>
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1rem', letterSpacing: '0.06em', color: '#9CA3AF' }}>
                ${activeDaysLeft > 0 ? (currentDD / activeDaysLeft).toFixed(2) : '—'}/day left to spend
              </span>
            </div>
            {projEndDD !== null && (
              <div style={{ marginTop: '6px', fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.9rem', letterSpacing: '0.05em', color: projEndDD >= 0 ? '#2d6a1f' : '#D42B2B' }}>
                {projEndDD >= 0
                  ? `↗ Projected end: $${projEndDD.toFixed(0)} remaining`
                  : `↘ Runs out in ~${ddDepletionDays} day${ddDepletionDays !== 1 ? 's' : ''}`}
              </div>
            )}
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button style={{ ...S.actionBtn('yellow'), flex: 1, width: 'auto', marginBottom: 0, marginTop: 0 }} onClick={() => setLogModal('dollars')}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="8" cy="8" r="6"/><path d="M8 5v6M6 6.5h3a1 1 0 010 2H7a1 1 0 000 2h3"/></svg>
                LOG DINING $
              </button>
              <button style={{ ...S.actionBtn(), width: 'auto', marginBottom: 0, marginTop: 0, padding: '12px 14px', justifyContent: 'center' }} onClick={() => navigate('/dining-dollars')}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><circle cx="3" cy="8" r="1.5"/><circle cx="8" cy="8" r="1.5"/><circle cx="13" cy="8" r="1.5"/></svg>
              </button>
            </div>
          </div>
        </div>

        {/* ── Daily spend pace ── */}
        {totalDD > 0 && (
        <div style={S.card}>
          <span style={S.cardLabel}>DINING DOLLAR DAILY PACE</span>
          <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '1rem', color: '#1a1a1a', margin: '0 0 1rem' }}>Daily Spend vs Max Sustainable Rate</p>
          {(() => {
            const fillPct = maxDailyDD > 0 && actualDailyDD ? Math.min((actualDailyDD / maxDailyDD) * 100, 100) : 0
            const barColor = fillPct >= 100 ? '#D42B2B' : fillPct >= 80 ? '#F57F17' : '#2d6a1f'
            return (
              <>
                <div style={{ height: '10px', background: 'rgba(0,0,0,0.06)', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${fillPct}%`, background: barColor, borderRadius: '99px', transition: 'width 0.6s ease' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                  <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.5rem', letterSpacing: '0.06em', color: '#9CA3AF' }}>
                    {actualDailyDD ? `$${actualDailyDD.toFixed(2)}/DAY ACTUAL` : 'NO SPEND YET'}
                  </span>
                  <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.5rem', letterSpacing: '0.06em', color: '#9CA3AF' }}>
                    ${maxDailyDD.toFixed(2)}/DAY MAX
                  </span>
                </div>
              </>
            )
          })()}
        </div>
        )}

        {/* ── Today's Menu ── */}
        <div style={{ ...S.card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={S.cardLabel}>DINING HALLS</span>
            <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '1rem', color: '#1a1a1a', margin: '0 0 4px' }}>Today's Menu</p>
            <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.5rem', letterSpacing: '0.04em', color: '#9CA3AF', margin: 0 }}>LIVE MENUS FROM STETSON EAST AND INTERNATIONAL VILLAGE</p>
          </div>
          <button onClick={() => navigate('/menu')} style={{ padding: '10px 20px', background: '#FFE45C', border: '2.5px solid #1a1a1a', borderRadius: '8px', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.5rem', letterSpacing: '0.07em', cursor: 'pointer', boxShadow: '3px 3px 0 #1a1a1a', color: '#1a1a1a', transition: 'all 0.12s', flexShrink: 0 }}>
            VIEW TODAY'S MENU →
          </button>
        </div>

        {/* ── Semester Insights ── */}
        <div style={S.card}>
          <span style={S.cardLabel}>SEMESTER INSIGHTS</span>
          <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '1rem', color: '#1a1a1a', margin: '0 0 1rem' }}>What the numbers say</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

            {/* Swipe pace insight */}
            {totalSwipes && actualDailySwipes !== null && projDailySwipes && activeDaysLeft > 0 && (() => {
              const needed = currentSwipes / activeDaysLeft
              const color = swipePace === 'over_budget' ? '#D42B2B' : swipePace === 'under_budget' ? '#1a4fa0' : '#2d6a1f'
              const bg    = swipePace === 'over_budget' ? '#FFF0EE' : swipePace === 'under_budget' ? '#e6f0ff' : '#f0f7eb'
              const trail = projEndSwipes >= 0
                ? `On track to finish with ${projEndSwipes} to spare.`
                : `May run out in ~${swipeDepletionDays} days.`
              return (
                <div style={{ borderLeft: `3px solid ${color}`, background: bg, borderRadius: '0 8px 8px 0', padding: '10px 14px' }}>
                  <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.85rem', letterSpacing: '0.08em', color, display: 'block', marginBottom: '2px' }}>MEAL SWIPES</span>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.88rem', color: '#1a1a1a', lineHeight: 1.5 }}>
                    Using <strong>{actualDailySwipes.toFixed(1)}</strong> swipes/day — need <strong>{needed.toFixed(1)}</strong>/day to last the semester. {trail}
                  </span>
                </div>
              )
            })()}

            {/* Dining dollars pace insight */}
            {actualDailyDD !== null && projDailyDD && activeDaysLeft > 0 && (() => {
              const needed = currentDD / activeDaysLeft
              const color = ddPace === 'over_budget' ? '#D42B2B' : ddPace === 'under_budget' ? '#1a4fa0' : '#2d6a1f'
              const bg    = ddPace === 'over_budget' ? '#FFF0EE' : ddPace === 'under_budget' ? '#e6f0ff' : '#f0f7eb'
              const trail = projEndDD >= 0
                ? `Projected $${projEndDD.toFixed(0)} surplus at semester end.`
                : `May run out in ~${ddDepletionDays} days.`
              return (
                <div style={{ borderLeft: `3px solid ${color}`, background: bg, borderRadius: '0 8px 8px 0', padding: '10px 14px' }}>
                  <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.85rem', letterSpacing: '0.08em', color, display: 'block', marginBottom: '2px' }}>DINING DOLLARS</span>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.88rem', color: '#1a1a1a', lineHeight: 1.5 }}>
                    Spending <strong>${actualDailyDD.toFixed(2)}</strong>/day — need <strong>${needed.toFixed(2)}</strong>/day to last. {trail}
                  </span>
                </div>
              )
            })()}

            {/* Balance health cross-check */}
            {(() => {
              const semPct = Math.round(pctElapsed * 100)
              const swipePctUsed = totalSwipes ? Math.round(((totalSwipes - currentSwipes) / totalSwipes) * 100) : null
              const ddPctUsed = totalDD ? Math.round(((totalDD - currentDD) / totalDD) * 100) : null
              const delta = swipePctUsed !== null ? swipePctUsed - semPct : ddPctUsed - semPct
              const color = Math.abs(delta) <= 5 ? '#2d6a1f' : delta > 5 ? '#D42B2B' : '#1a4fa0'
              const bg    = Math.abs(delta) <= 5 ? '#f0f7eb'  : delta > 5 ? '#FFF0EE'  : '#e6f0ff'
              const parts = []
              if (swipePctUsed !== null) parts.push(`${swipePctUsed}% of swipes`)
              if (ddPctUsed !== null)    parts.push(`${ddPctUsed}% of dining dollars`)
              return (
                <div style={{ borderLeft: `3px solid ${color}`, background: bg, borderRadius: '0 8px 8px 0', padding: '10px 14px' }}>
                  <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.85rem', letterSpacing: '0.08em', color, display: 'block', marginBottom: '2px' }}>BALANCE HEALTH</span>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.88rem', color: '#1a1a1a', lineHeight: 1.5 }}>
                    Semester is <strong>{semPct}%</strong> elapsed. You've used {parts.join(' and ')}.
                  </span>
                </div>
              )
            })()}

          </div>
        </div>

      </div>

      {/* ── Log modal ── */}
      {logModal && (
        <LogModal type={logModal} onClose={() => setLogModal(null)} onSave={handleLog} />
      )}

      {/* ── Toast ── */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', background: '#1a1a1a', color: '#fff', padding: '10px 20px', borderRadius: '99px', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.5rem', letterSpacing: '0.06em', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', whiteSpace: 'nowrap', zIndex: 9999, border: '2px solid rgba(255,255,255,0.1)' }}>
          {toast}
        </div>
      )}
    </div>
  )
}
