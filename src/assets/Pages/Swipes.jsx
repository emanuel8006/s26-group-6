import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PhotoReel from '../Components/PhotoReel'
import { updateMealPlan } from '../Components/APICalls'

function parseDate(str) { return str ? new Date(str + 'T12:00:00') : null }
function daysUntil(str) {
  if (!str) return null
  const diff = parseDate(str) - new Date()
  return Math.max(0, Math.ceil(diff / 86400000))
}
function getBreakOffDays(breaks = []) {
  const days = new Set()
  breaks.forEach(b => {
    if (b.enabled) {
      b.dates?.forEach(d => days.add(d))
      if (b.weekendEnabled) b.weekendDates?.forEach(d => days.add(d))
    }
  })
  return [...days]
}
function calcActiveDaysLeft(endStr, breaks = [], customOff = []) {
  if (!endStr) return null
  const end = parseDate(endStr), t = new Date()
  if (t >= end) return 0
  const breakSet = new Set([...getBreakOffDays(breaks), ...customOff])
  let count = 0
  const cur = new Date(t); cur.setDate(cur.getDate() + 1)
  while (cur <= end) { if (!breakSet.has(cur.toISOString().split('T')[0])) count++; cur.setDate(cur.getDate() + 1) }
  return count
}
function calcTotalActiveDays(startStr, endStr, breaks = [], customOff = []) {
  if (!startStr || !endStr) return 105
  const start = parseDate(startStr), end = parseDate(endStr)
  const total = Math.max(1, Math.ceil((end - start) / 86400000))
  const breakSet = new Set([...getBreakOffDays(breaks), ...customOff])
  let bc = 0
  const cur = new Date(start)
  while (cur <= end) { if (breakSet.has(cur.toISOString().split('T')[0])) bc++; cur.setDate(cur.getDate() + 1) }
  return Math.max(1, total - bc)
}

const VENUES = [
  { id: 'iv',        label: 'International Village', short: 'IV',  maxPerDay: null },
  { id: 'stetson_e', label: 'Stetson East',          short: 'SE',  maxPerDay: null },
  { id: 'stetson_w', label: 'Stetson West',          short: 'SW',  maxPerDay: null },
  { id: 'outtakes',  label: 'Outtakes',              short: 'OUT', maxPerDay: 3 },
  { id: 'market',    label: 'Market @ 60',           short: 'M60', maxPerDay: 3 },
]

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const st = {
  page: { minHeight: '100vh', background: '#FAF9F6', backgroundImage: 'linear-gradient(rgba(0,0,0,0.035) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.035) 1px,transparent 1px)', backgroundSize: '28px 28px', fontFamily: "'Inter',sans-serif" },
  hero: { background: 'linear-gradient(135deg,#1a1a1a 0%,#2a2a2a 100%)', position: 'relative', overflow: 'hidden' },
  heroInner: { maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 2rem', position: 'relative', zIndex: 2 },
  body: { maxWidth: '1100px', margin: '0 auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  card: { background: '#fff', border: '2px solid rgba(0,0,0,0.09)', borderRadius: '12px', padding: '1.4rem', boxShadow: '3px 4px 0 rgba(0,0,0,0.06)' },
  label: { fontFamily: "'Bebas Neue',sans-serif", fontSize: '1.2rem', letterSpacing: '0.12em', color: '#9CA3AF', display: 'block', marginBottom: '4px' },
  heading: { fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: '1rem', color: '#1a1a1a', margin: '0 0 1rem' },
  bigNum: { fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: '2.6rem', color: '#1a1a1a', lineHeight: 1, margin: '0 0 2px' },
  eyebrow: { fontFamily: "'Bebas Neue',sans-serif", fontSize: '1.2rem', letterSpacing: '0.14em', color: '#D42B2B', display: 'block', marginBottom: '6px' },
  twoCol: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' },
  btnRed: { padding: '11px 20px', background: '#D42B2B', color: '#fff', border: '2.5px solid #1a1a1a', borderRadius: '8px', fontFamily: "'Bebas Neue',sans-serif", fontSize: '1.2rem', letterSpacing: '0.07em', cursor: 'pointer', boxShadow: '3px 3px 0 #1a1a1a', transition: 'all 0.12s' },
  input: { width: '100%', padding: '10px 14px', border: '2px solid rgba(0,0,0,0.12)', borderRadius: '8px', fontSize: '0.9rem', fontFamily: "'Inter',sans-serif", background: '#fff', color: '#1a1a1a', outline: 'none', boxSizing: 'border-box', boxShadow: '2px 3px 0 rgba(0,0,0,0.07)' },
  paceBadge: (pace) => {
    const map = { on_track:{ bg:'#f0f7eb',color:'#2d6a1f',border:'#c8deba',label:'On Pace' }, over:{ bg:'#FFF0EE',color:'#D42B2B',border:'#f0b8b8',label:'Using Fast' }, under:{ bg:'#e6f0ff',color:'#1a4fa0',border:'#b8d0f0',label:'Ahead' } }
    const p = map[pace] || map.on_track
    return { fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.2rem', letterSpacing:'0.08em', padding:'3px 10px', borderRadius:'99px', background:p.bg, color:p.color, border:`1.5px solid ${p.border}`, display:'inline-block' }
  },
}

function LogModal({ onClose, onSave }) {
  const [venue, setVenue] = useState('iv')
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',backdropFilter:'blur(4px)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem' }} onClick={onClose}>
      <div style={{ background:'#fff',border:'2.5px solid #1a1a1a',borderRadius:'14px',padding:'1.8rem',maxWidth:'400px',width:'100%',boxShadow:'5px 6px 0 #1a1a1a' }} onClick={e=>e.stopPropagation()}>
        <p style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:'1.2rem',letterSpacing:'0.12em',color:'#9CA3AF',margin:'0 0 4px' }}>LOG A SWIPE</p>
        <p style={{ fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:'1.4rem',color:'#1a1a1a',margin:'0 0 1.4rem' }}>Use a Swipe</p>
        <div style={{ display:'flex',flexDirection:'column',gap:'1rem' }}>
          <div>
            <label style={{ display:'block',fontFamily:"'Bebas Neue',sans-serif",fontSize:'1.2rem',letterSpacing:'0.1em',color:'#9CA3AF',marginBottom:'6px' }}>DINING LOCATION</label>
            <select value={venue} onChange={e=>setVenue(e.target.value)} style={st.input}>
              {VENUES.map(v=><option key={v.id} value={v.id}>{v.label}{v.maxPerDay ? ` (max ${v.maxPerDay}/day)` : ''}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display:'block',fontFamily:"'Bebas Neue',sans-serif",fontSize:'1.2rem',letterSpacing:'0.1em',color:'#9CA3AF',marginBottom:'6px' }}>DATE</label>
            <input type="date" value={date} max={new Date().toISOString().split('T')[0]} onChange={e=>setDate(e.target.value)} style={st.input} />
          </div>
        </div>
        <div style={{ display:'flex',gap:'8px',marginTop:'1.4rem' }}>
          <button onClick={onClose} style={{ flex:1,padding:'10px',border:'2px solid rgba(0,0,0,0.12)',borderRadius:'8px',fontFamily:"'Bebas Neue',sans-serif",fontSize:'1.2rem',letterSpacing:'0.06em',cursor:'pointer',background:'#fff',color:'#9CA3AF' }}>CANCEL</button>
          <button onClick={()=>{ onSave(venue, date); onClose() }} style={{ flex:2,padding:'10px',background:'#D42B2B',border:'2px solid #1a1a1a',borderRadius:'8px',fontFamily:"'Bebas Neue',sans-serif",fontSize:'1.2rem',letterSpacing:'0.06em',cursor:'pointer',color:'#fff',boxShadow:'2px 3px 0 #1a1a1a' }}>LOG SWIPE</button>
        </div>
      </div>
    </div>
  )
}

export default function Swipes() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [swipeLog, setSwipeLog] = useState([])
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (!localStorage.getItem('sw_logged_in')) { navigate('/login'); return }
    setProfile({
      planData: {
        name:          localStorage.getItem('oasis_plan_name'),
        swipes:        localStorage.getItem('oasis_swipes_start') ? parseInt(localStorage.getItem('oasis_swipes_start')) : null,
        diningDollars: parseFloat(localStorage.getItem('oasis_dining_dollars_start')) || 0,
      },
      swipesLeft:    localStorage.getItem('oasis_swipes_current'),
      semesterStart: localStorage.getItem('oasis_start_date'),
      semesterEnd:   localStorage.getItem('oasis_end_date'),
      customOffDays: JSON.parse(localStorage.getItem('oasis_offdays') || '[]'),
      swipesPerWeek: localStorage.getItem('oasis_swipes_per_week'),
    })
  }, [])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  const plan = profile?.planData
  const totalSwipes = plan?.swipes
  const startingSwipes = parseInt(profile?.swipesLeft) || totalSwipes || 0
  const used = swipeLog.length
  const current = Math.max(0, startingSwipes - used)
  const pct = totalSwipes ? Math.round((current / totalSwipes) * 100) : null

  const breaks = []
  const customOff = profile?.customOffDays || []
  const semEnd = profile?.semesterEnd
  const semStart = profile?.semesterStart
  const totalActiveDays = calcTotalActiveDays(semStart, semEnd, breaks, customOff)
  const activeDaysLeft = calcActiveDaysLeft(semEnd, breaks, customOff)
  const daysLeft = daysUntil(semEnd)
  const dailyRate = activeDaysLeft > 0 && current > 0 ? current / activeDaysLeft : 0

  // Pace
  const projSwipesPerDay = profile?.swipesPerWeek
    ? parseInt(profile.swipesPerWeek) / 7
    : null
  const pctTimeLeft = totalActiveDays > 0 ? (activeDaysLeft || 0) / totalActiveDays : 0
  const expectedRemaining = totalSwipes ? totalSwipes * pctTimeLeft : null
  const pace = !totalSwipes ? null : expectedRemaining === null ? null
    : Math.abs(current - expectedRemaining) / totalSwipes < 0.05 ? 'on_track'
    : current > expectedRemaining ? 'under' : 'over'

  // This week's swipes by day
  const today = new Date()
  const startOfWeek = new Date(today); startOfWeek.setDate(today.getDate() - today.getDay()); startOfWeek.setHours(0,0,0,0)
  const thisWeekLog = swipeLog.filter(s => new Date(s.timestamp) >= startOfWeek)
  const weekByDay = WEEK_DAYS.map((day, i) => {
    const dayDate = new Date(startOfWeek); dayDate.setDate(startOfWeek.getDate() + i)
    const isToday = dayDate.toDateString() === today.toDateString()
    const isPast = dayDate < today && !isToday
    const count = thisWeekLog.filter(s => new Date(s.timestamp).getDay() === i).length
    return { day, isToday, isPast, count, isFuture: dayDate > today && !isToday }
  })

  // Venue breakdown
  const venueCounts = VENUES.map(v => ({
    ...v, count: swipeLog.filter(s => s.venue === v.id).length
  })).filter(v => v.count > 0)

  const handleLogSwipe = (venueId, dateStr) => {
    const newVal = Math.max(0, (parseInt(localStorage.getItem('oasis_swipes_current') || '0')) - 1)
    localStorage.setItem('oasis_swipes_current', newVal)
    setProfile(p => ({ ...p, swipesLeft: String(newVal) }))
    updateMealPlan({ swipesCurrent: newVal })
    const entryDate = new Date(dateStr + 'T12:00:00')
    const isToday = dateStr === new Date().toISOString().split('T')[0]
    setSwipeLog(p => [...p, {
      id: Date.now(), venue: venueId,
      timestamp: entryDate.toISOString(),
      time: isToday ? new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '',
      date: entryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }])
    const v = VENUES.find(v => v.id === venueId)
    const label = isToday ? `Swipe logged at ${v?.label || 'dining hall'}` : `Swipe logged at ${v?.label || 'dining hall'} (${entryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`
    showToast(label)
  }

  const semLabel = profile?.semesterEnd
    ? new Date(profile.semesterEnd + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'This Semester'

  return (
    <div style={st.page}>

      {/* ── Hero ── */}
      <div style={st.hero}>
        <PhotoReel />
        <div style={{ position:'absolute',inset:0,backgroundImage:'radial-gradient(circle at 20% 60%,rgba(212,43,43,0.1),transparent 55%)',zIndex:1 }} />
        <div style={{ position:'absolute',inset:0,opacity:0.03,backgroundImage:'radial-gradient(circle,#fff 1px,transparent 1px)',backgroundSize:'22px 22px',zIndex:1 }} />
        <div style={st.heroInner}>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:'1rem' }}>
            <div>
              <span style={st.eyebrow}>MEAL SWIPES · {semLabel}</span>
              <h1 style={{ fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:'clamp(1.8rem,4vw,2.8rem)',color:'#fff',margin:'0 0 6px',lineHeight:1.1 }}>Your Swipes</h1>
              <p style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:'1.2rem',letterSpacing:'0.04em',color:'rgba(255,255,255,0.45)',margin:0 }}>
                {totalSwipes === null ? 'Unlimited plan' : `${plan?.name || 'No plan'} · ${totalSwipes} total swipes`}
              </p>
            </div>
            <button onClick={() => setShowModal(true)} style={{ ...st.btnRed, alignSelf:'flex-start', marginTop:'4px' }}>+ USE A SWIPE</button>
          </div>

          {/* Big count + stats */}
          <div style={{ display:'grid',gridTemplateColumns:'auto 1fr',gap:'2.5rem',alignItems:'center',marginTop:'2rem' }}>
            <div>
              <p style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:'1.2rem',letterSpacing:'0.12em',color:'rgba(255,255,255,0.35)',margin:'0 0 4px' }}>SWIPES REMAINING</p>
              {totalSwipes === null ? (
                <p style={{ fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:'clamp(2.8rem,6vw,4.5rem)',color:'#fff',lineHeight:1,margin:'0 0 4px' }}>∞</p>
              ) : (
                <p style={{ fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:'clamp(2.8rem,6vw,4.5rem)',color:'#fff',lineHeight:1,margin:'0 0 4px' }}>{current}</p>
              )}
              <div style={{ display:'flex',alignItems:'center',gap:'10px',flexWrap:'wrap' }}>
                {totalSwipes && <p style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:'1.2rem',letterSpacing:'0.06em',color:'rgba(255,255,255,0.35)',margin:0 }}>OF {totalSwipes} · {pct}% REMAINING</p>}
                {pace && <span style={st.paceBadge(pace)}>{({ on_track:'On Pace',over:'Using Fast',under:'Ahead' })[pace]}</span>}
              </div>
            </div>
            <div>
              {totalSwipes && (
                <div style={{ height:'6px',background:'rgba(255,255,255,0.12)',borderRadius:'99px',overflow:'hidden',marginBottom:'10px' }}>
                  <div style={{ height:'100%',width:`${pct}%`,background: pace==='over' ? '#D42B2B' : '#4ade80',borderRadius:'99px',transition:'width 0.6s ease' }} />
                </div>
              )}
              <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'10px' }}>
                {[
                  { label:'USED', value: used },
                  { label:'THIS WEEK', value: thisWeekLog.length },
                  { label:'SWIPES/DAY', value: dailyRate > 0 ? dailyRate.toFixed(1) : '—' },
                  { label:'DAYS LEFT', value: daysLeft ?? '—' },
                ].map(({ label, value }) => (
                  <div key={label} style={{ background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'8px',padding:'10px 12px' }}>
                    <p style={{ fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:'1.2rem',color:'#fff',margin:'0 0 2px',lineHeight:1 }}>{value}</p>
                    <p style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:'1.2rem',letterSpacing:'0.1em',color:'rgba(255,255,255,0.35)',margin:0 }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={st.body}>

        {/* ── This week tracker ── */}
        <div style={st.card}>
          <span style={st.label}>THIS WEEK</span>
          <p style={st.heading}>Daily Swipe Tracker</p>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'8px' }}>
            {weekByDay.map(({ day, isToday, isPast, isFuture, count }) => (
              <div key={day} style={{
                borderRadius:'10px',padding:'12px 6px',textAlign:'center',
                background: isToday ? '#FBF2D8' : isPast && count > 0 ? '#f0f7eb' : isPast ? '#FAFAFA' : '#FAFAFA',
                border: isToday ? '2px solid #1a1a1a' : isPast && count > 0 ? '2px solid #2d6a1f' : '2px solid rgba(0,0,0,0.07)',
                boxShadow: isToday ? '3px 3px 0 #1a1a1a' : 'none',
                opacity: isFuture ? 0.45 : 1,
              }}>
                <p style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:'1.2rem',letterSpacing:'0.08em',color: isToday ? '#D42B2B' : '#9CA3AF',margin:'0 0 6px' }}>
                  {day}{isToday ? ' ·' : ''}
                </p>
                {isPast || isToday ? (
                  <>
                    {count > 0
                      ? <div style={{ display:'flex',flexDirection:'column',gap:'3px',alignItems:'center' }}>
                          {Array.from({ length: Math.min(count, 3) }, (_, i) => (
                            <div key={i} style={{ width:'8px',height:'8px',borderRadius:'50%',background: isToday ? '#D42B2B' : '#2d6a1f' }} />
                          ))}
                        </div>
                      : <div style={{ width:'8px',height:'8px',borderRadius:'50%',background:'rgba(0,0,0,0.1)',margin:'0 auto' }} />
                    }
                    <p style={{ fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:'1rem',color:'#1a1a1a',margin:'6px 0 0' }}>{count}</p>
                  </>
                ) : (
                  <div style={{ width:'8px',height:'8px',borderRadius:'50%',background:'rgba(0,0,0,0.08)',margin:'0 auto' }} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={st.twoCol}>
          {/* ── Left: history + venue breakdown ── */}
          <div style={{ display:'flex',flexDirection:'column',gap:'1.2rem' }}>

            {/* Venue breakdown */}
            {venueCounts.length > 0 && (
              <div style={st.card}>
                <span style={st.label}>VENUE BREAKDOWN</span>
                <p style={st.heading}>Where You've Been Eating</p>
                <div style={{ display:'flex',flexDirection:'column',gap:'12px' }}>
                  {venueCounts.sort((a,b) => b.count - a.count).map(v => (
                    <div key={v.id}>
                      <div style={{ display:'flex',justifyContent:'space-between',marginBottom:'5px' }}>
                        <span style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:'1.2rem',letterSpacing:'0.06em',color:'#1a1a1a' }}>{v.label}</span>
                        <span style={{ fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:'0.9rem',color:'#1a1a1a' }}>{v.count} swipe{v.count !== 1 ? 's' : ''}</span>
                      </div>
                      <div style={{ height:'6px',background:'rgba(0,0,0,0.06)',borderRadius:'99px',overflow:'hidden' }}>
                        <div style={{ height:'100%',width:`${(v.count / Math.max(used, 1)) * 100}%`,background:'#1a1a1a',borderRadius:'99px',transition:'width 0.5s ease' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Swipe history */}
            <div style={st.card}>
              <span style={st.label}>SWIPE HISTORY</span>
              <p style={st.heading}>Recent Swipes</p>
              {swipeLog.length === 0 ? (
                <div style={{ border:'2px dashed rgba(0,0,0,0.1)',borderRadius:'8px',padding:'2rem',textAlign:'center' }}>
                  <p style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:'1.2rem',letterSpacing:'0.1em',color:'#9CA3AF',margin:'0 0 4px' }}>NO SWIPES LOGGED YET</p>
                  <p style={{ fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:'0.95rem',color:'#1a1a1a',margin:0,opacity:0.4 }}>Hit the button above to log your first swipe</p>
                </div>
              ) : (
                <div>
                  {[...swipeLog].reverse().slice(0, 10).map((s, i) => {
                    const v = VENUES.find(v => v.id === s.venue)
                    return (
                      <div key={s.id} style={{ display:'flex',alignItems:'center',gap:'12px',padding:'11px 0',borderBottom: i < Math.min(swipeLog.length,10)-1 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}>
                        <div style={{ width:'32px',height:'32px',borderRadius:'8px',background:'#FBF2D8',border:'1.5px solid rgba(0,0,0,0.08)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                          <span style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:'1.2rem',letterSpacing:'0.04em',color:'#1a1a1a' }}>{v?.short}</span>
                        </div>
                        <div style={{ flex:1,minWidth:0 }}>
                          <p style={{ fontFamily:"'Inter',sans-serif",fontWeight:500,fontSize:'0.88rem',color:'#1a1a1a',margin:'0 0 1px' }}>{v?.label}</p>
                          <p style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:'1.2rem',letterSpacing:'0.05em',color:'#9CA3AF',margin:0 }}>{s.date} · {s.time}</p>
                        </div>
                        <span style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:'1.2rem',letterSpacing:'0.06em',color:'#D42B2B',flexShrink:0 }}>−1 SWIPE</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── Right: balance overview + tips ── */}
          <div style={{ display:'flex',flexDirection:'column',gap:'1.2rem' }}>

            <div style={st.card}>
              <span style={st.label}>SWIPE OVERVIEW</span>
              {totalSwipes === null ? (
                <div style={{ padding:'1rem 0' }}>
                  <p style={{ fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:'1.4rem',color:'#1a1a1a',margin:'0 0 4px' }}>Unlimited Plan</p>
                  <p style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:'1.2rem',letterSpacing:'0.06em',color:'#9CA3AF',margin:0 }}>NO SWIPE LIMIT — USE FREELY</p>
                </div>
              ) : (
                [
                  { label:'Starting Swipes', value: totalSwipes,              muted:true },
                  { label:'Used So Far',     value: `-${totalSwipes - current}`, muted:false, red:true },
                  { label:'Remaining',       value: current,        muted:false, bold:true },
                  { label:'Active Days Left',value: activeDaysLeft ?? '—', muted:true },
                  { label:'Swipes/Day Left', value: dailyRate > 0 ? dailyRate.toFixed(1) : '—', muted:true },
                  { label:'This Week',       value: thisWeekLog.length, muted:true },
                ].map(({ label, value, muted, red, bold }, i) => (
                  <div key={label} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom: i < 5 ? '1px solid rgba(0,0,0,0.04)' : 'none' }}>
                    <span style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:'1.2rem',letterSpacing:'0.06em',color: muted ? '#9CA3AF' : '#1a1a1a' }}>{label}</span>
                    <span style={{ fontFamily:"'Playfair Display',serif",fontWeight: bold ? 700 : 500,fontSize: bold ? '1.1rem' : '0.9rem',color: red ? '#D42B2B' : bold ? '#1a1a1a' : '#6B7280' }}>{value}</span>
                  </div>
                ))
              )}
            </div>

            {/* Swipe rules */}
            <div style={st.card}>
              <span style={st.label}>SWIPE RULES</span>
              <div style={{ display:'flex',flexDirection:'column',gap:'8px' }}>
                {[
                  { venue:'Dining Halls', rule:'1 swipe per entry, unlimited visits per day', color:'#1a1a1a' },
                  { venue:'Outtakes', rule:'Up to 3 swipes per day', color:'#D42B2B' },
                  { venue:'Market @ 60', rule:'Up to 3 swipes per day', color:'#D42B2B' },
                ].map(({ venue, rule, color }) => (
                  <div key={venue} style={{ background:'#FAFAFA',border:'1.5px solid rgba(0,0,0,0.07)',borderRadius:'8px',padding:'10px 12px',display:'flex',gap:'10px',alignItems:'flex-start' }}>
                    <div style={{ width:'3px',height:'100%',minHeight:'30px',background:color,borderRadius:'2px',flexShrink:0,marginTop:'1px' }} />
                    <div>
                      <p style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:'1.2rem',letterSpacing:'0.06em',color:'#1a1a1a',margin:'0 0 2px' }}>{venue.toUpperCase()}</p>
                      <p style={{ fontFamily:"'Inter',sans-serif",fontSize:'0.78rem',color:'#6B7280',margin:0,lineHeight:1.4 }}>{rule}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div style={st.card}>
              <span style={st.label}>TIPS</span>
              <div style={{ display:'flex',flexDirection:'column',gap:'8px' }}>
                {[
                  { bg:'#f0f7eb', border:'#c8deba', title:'Swipes over dining dollars', body:'Use swipes for dining hall meals whenever possible — they\'re better value than spending dining dollars.' },
                  { bg:'#FBF2D8', border:'rgba(0,0,0,0.08)', title:'Outtakes for quick meals', body:'Outtakes counts as a swipe but has grab-and-go options — great if you\'re short on time.' },
                ].map(({ bg, border, title, body }) => (
                  <div key={title} style={{ background:bg,border:`1.5px solid ${border}`,borderRadius:'8px',padding:'10px 12px' }}>
                    <p style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:'1.2rem',letterSpacing:'0.06em',color:'#1a1a1a',margin:'0 0 3px' }}>{title.toUpperCase()}</p>
                    <p style={{ fontFamily:"'Inter',sans-serif",fontSize:'0.78rem',color:'#6B7280',margin:0,lineHeight:1.5 }}>{body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModal && <LogModal onClose={() => setShowModal(false)} onSave={handleLogSwipe} />}

      {toast && (
        <div style={{ position:'fixed',bottom:'2rem',left:'50%',transform:'translateX(-50%)',background:'#1a1a1a',color:'#fff',padding:'10px 20px',borderRadius:'99px',fontFamily:"'Bebas Neue',sans-serif",fontSize:'1.2rem',letterSpacing:'0.06em',boxShadow:'0 4px 20px rgba(0,0,0,0.3)',whiteSpace:'nowrap',zIndex:9999,border:'2px solid rgba(255,255,255,0.1)' }}>
          {toast}
        </div>
      )}
    </div>
  )
}
