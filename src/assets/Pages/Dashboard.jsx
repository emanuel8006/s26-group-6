import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

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
  comingSoon: { background: '#FAF9F6', border: '2px dashed rgba(0,0,0,0.1)', borderRadius: '10px', padding: '2rem', textAlign: 'center' },
  logModal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' },
  logCard: { background: '#fff', border: '2px solid #1a1a1a', borderRadius: '14px', padding: '1.8rem', maxWidth: '400px', width: '100%', boxShadow: '5px 6px 0px #1a1a1a' },
  input: { width: '100%', padding: '10px 14px', border: '2px solid rgba(0,0,0,0.12)', borderRadius: '8px', fontSize: '0.9rem', fontFamily: "'Inter', sans-serif", background: '#fff', color: '#1a1a1a', outline: 'none', boxSizing: 'border-box', boxShadow: '2px 3px 0px rgba(0,0,0,0.07)', marginBottom: '10px' },
}

// ── Projected pace chart (projected only, no fake actuals) ────────
function PaceChart({ projWeekly, activeDays }) {
  const weeks = Math.min(Math.ceil(activeDays / 7), 16)
  const maxVal = Math.max(projWeekly * 1.4, 20)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '100px', marginBottom: '6px' }}>
        {Array.from({ length: weeks }, (_, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
            <div style={{ width: '100%', background: '#FBF2D8', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '3px 3px 0 0', height: `${(projWeekly / maxVal) * 100}%`, minHeight: '4px' }} />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '3px' }}>
        {Array.from({ length: weeks }, (_, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.5rem', letterSpacing: '0.04em', color: (i + 1) % 4 === 0 ? '#9CA3AF' : 'transparent' }}>
            {(i + 1) % 4 === 0 ? `W${i + 1}` : '.'}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '14px', marginTop: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '10px', height: '10px', background: '#FBF2D8', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px' }} />
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.5rem', letterSpacing: '0.04em', color: '#9CA3AF' }}>Projected (${projWeekly}/wk)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '10px', height: '10px', background: '#E5E7EB', border: '1px dashed #9CA3AF', borderRadius: '2px' }} />
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.5rem', letterSpacing: '0.04em', color: '#9CA3AF' }}>Actual — coming soon</span>
        </div>
      </div>
    </div>
  )
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

// ── Coming Soon placeholder ───────────────────────────────────────
function ComingSoon({ label }) {
  return (
    <div style={S.comingSoon}>
      <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.5rem', letterSpacing: '0.1em', color: '#9CA3AF', margin: '0 0 4px' }}>COMING SOON</p>
      <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '0.95rem', color: '#1a1a1a', margin: 0, opacity: 0.4 }}>{label}</p>
    </div>
  )
}

// ── Main Dashboard ────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [logModal, setLogModal] = useState(null)
  const [swipesUsed, setSwipesUsed] = useState(0)
  const [ddSpent, setDdSpent] = useState(0)
  const [toast, setToast] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('nomnom_profile')
    if (!stored) { navigate('/onboarding'); return }
    try { setProfile(JSON.parse(stored)) } catch { navigate('/onboarding'); return }
    setLoading(false)
  }, [navigate])

  if (loading || !profile) return null

  // ── Derived values ────────────────────────────────────────────
  const plan = profile.planData
  const semStart = profile.semesterStart
  const semEnd = profile.semesterEnd
  const breaks = profile.semesterBreaks || []
  const customOff = profile.customOffDays || []

  const daysLeft = daysUntil(semEnd)
  const totalActiveDays = calcTotalActiveDays(semStart, semEnd, breaks, customOff)
  const activeDaysLeft = calcActiveDaysLeft(semEnd, breaks, customOff)
  const pctElapsed = totalActiveDays > 0 ? Math.min(1, (totalActiveDays - (activeDaysLeft || 0)) / totalActiveDays) : 0

  // Swipes
  const totalSwipes = plan?.swipes
  const startingSwipes = parseInt(profile.swipesLeft) || totalSwipes || 0
  const currentSwipes = Math.max(0, startingSwipes - swipesUsed)
  const swipePct = totalSwipes ? Math.round((currentSwipes / totalSwipes) * 100) : null
  const swipePace = totalSwipes ? calcPace(currentSwipes, totalSwipes, activeDaysLeft, totalActiveDays) : null

  // Dining dollars
  const totalDD = plan?.diningDollars || 0
  const startingDD = parseFloat(profile.diningDollarsLeft) || totalDD
  const currentDD = Math.max(0, startingDD - ddSpent)
  const ddPct = totalDD ? Math.round((currentDD / totalDD) * 100) : 0
  const ddPace = calcPace(currentDD, totalDD, activeDaysLeft, totalActiveDays)

  // Projected weekly dining dollars
  const projWeeklyDD = profile.dollarsPerWeek
    ? parseFloat(profile.dollarsPerWeek)
    : profile.projections?.projPlanDD
      ? Math.round(profile.projections.projPlanDD / (totalActiveDays / 7))
      : 0

  // Semester label
  const semLabel = profile.semesterPreset === 'spring2026' ? 'Spring 2026'
    : profile.semesterPreset === 'fall2026' ? 'Fall 2026'
    : semEnd ? new Date(semEnd + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
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
      setSwipesUsed(s => s + 1)
      showToast(`Swipe logged${loc ? ` at ${loc}` : ''}`)
    } else {
      setDdSpent(s => s + (parseFloat(val) || 0))
      showToast(`$${parseFloat(val || 0).toFixed(2)} logged`)
    }
  }

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <div style={{ background: '#FAF9F6', minHeight: '100vh' }}>

      {/* ── Hero ── */}
      <div style={S.hero}>
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
              { label: 'ACTIVE DAYS LEFT',   value: activeDaysLeft ?? '—' },
              { label: 'TOTAL ACTIVE DAYS',  value: totalActiveDays },
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

        {/* ── Pace chart ── */}
        <div style={S.card}>
          <span style={S.cardLabel}>WEEKLY SPENDING PACE — DINING DOLLARS</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '1rem', color: '#1a1a1a', margin: 0 }}>Projected Spend Over Semester</p>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.5rem', letterSpacing: '0.06em', color: '#9CA3AF' }}>${projWeeklyDD}/wk projected</span>
          </div>
          <PaceChart projWeekly={projWeeklyDD} activeDays={totalActiveDays} />
          {profile.outOfPocket && parseFloat(profile.outOfPocket) > 0 && (
            <div style={{ marginTop: '12px', padding: '8px 12px', background: '#FBF2D8', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '6px', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.5rem', letterSpacing: '0.04em', color: '#6B7280' }}>
              + ~${Math.round(parseFloat(profile.outOfPocket) * (totalActiveDays / 7))}/sem projected out-of-pocket
            </div>
          )}
        </div>

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

        {/* ── Recent activity — coming soon ── */}
        <div style={S.card}>
          <span style={S.cardLabel}>RECENT ACTIVITY</span>
          <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '1rem', color: '#1a1a1a', margin: '0 0 1rem' }}>Transaction History</p>
          <ComingSoon label="Transaction history will sync once backend is connected"  />
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
