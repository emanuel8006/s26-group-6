import React, { useState, useEffect, useMemo } from 'react'

const API_BASE = 'http://localhost:8000'
const PERIODS = ['Breakfast', 'Lunch', 'Dinner']
const MAX_CAL = 800

const DIET_FILTERS = [
  { id: 'Vegetarian',            label: 'Vegetarian',         color: '#f0f7eb', textColor: '#2d6a1f', border: '#c8deba' },
  { id: 'Vegan',                 label: 'Vegan',              color: '#e0f2e9', textColor: '#1a5c35', border: '#a8d5b8' },
  { id: 'Good Source of Protein',label: 'High Protein',       color: '#EFF6FF', textColor: '#1a4fa0', border: '#b8d0f0' },
  { id: 'Gluten Free',           label: 'Gluten-Free',        color: '#FBF2D8', textColor: '#6B4F00', border: '#e0c96a' },
]

const st = {
  page: { minHeight: '100vh', background: '#FAF9F6', backgroundImage: 'linear-gradient(rgba(0,0,0,0.035) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.035) 1px,transparent 1px)', backgroundSize: '28px 28px', fontFamily: "'Inter',sans-serif" },
  hero: { background: '#1a1a1a', position: 'relative', overflow: 'hidden' },
  heroInner: { maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 2rem 2rem', position: 'relative', zIndex: 2 },
  body: { maxWidth: '1100px', margin: '0 auto', padding: '1.5rem 2rem 3rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' },
  card: { background: '#fff', border: '2px solid rgba(0,0,0,0.09)', borderRadius: '12px', padding: '1.4rem', boxShadow: '3px 4px 0 rgba(0,0,0,0.06)' },
  skeleton: { background: 'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite', borderRadius: '6px' },
  periodBtn: (active) => ({
    padding: '8px 22px', fontFamily: "'Bebas Neue',sans-serif", fontSize: '0.88rem',
    letterSpacing: '0.1em', cursor: 'pointer', transition: 'all 0.15s', border: 'none',
    background: active ? '#D42B2B' : 'rgba(255,255,255,0.07)',
    color: active ? '#fff' : 'rgba(255,255,255,0.45)',
    borderBottom: active ? '3px solid #FFE45C' : '3px solid transparent',
  }),
  locationTab: (active) => ({
    padding: '8px 16px', fontFamily: "'Bebas Neue',sans-serif", fontSize: '0.8rem',
    letterSpacing: '0.07em', cursor: 'pointer', transition: 'all 0.12s', whiteSpace: 'nowrap',
    background: active ? '#FBF2D8' : '#fff', color: active ? '#1a1a1a' : '#9CA3AF',
    border: `2px solid ${active ? '#1a1a1a' : 'rgba(0,0,0,0.1)'}`, borderRadius: '8px',
    boxShadow: active ? '3px 3px 0 #1a1a1a' : '1px 2px 0 rgba(0,0,0,0.05)',
    transform: active ? 'translate(-1px,-1px)' : 'none', textTransform: 'capitalize',
  }),
  searchInput: {
    width: '100%', padding: '10px 14px 10px 38px',
    border: '2px solid rgba(0,0,0,0.12)', borderRadius: '8px',
    fontSize: '0.88rem', fontFamily: "'Inter',sans-serif",
    background: '#fff', color: '#1a1a1a', outline: 'none',
    boxSizing: 'border-box', boxShadow: '2px 3px 0 rgba(0,0,0,0.06)',
  },
}

function calColor(cal) {
  if (!cal || cal === 'N/A') return '#E5E7EB'
  if (cal <= 150) return '#4ade80'
  if (cal <= 350) return '#FFB300'
  return '#D42B2B'
}

function StatusBadge({ status }) {
  if (!status) return null
  const isOpen = status.label === 'open'
  return (
    <div style={{ display:'flex',alignItems:'center',gap:'6px',padding:'5px 12px',borderRadius:'99px', background: isOpen ? 'rgba(74,222,128,0.15)' : 'rgba(212,43,43,0.15)', border:`1.5px solid ${isOpen ? 'rgba(74,222,128,0.4)' : 'rgba(212,43,43,0.4)'}` }}>
      <div style={{ width:'7px',height:'7px',borderRadius:'50%',background: isOpen ? '#4ade80' : '#D42B2B', boxShadow: isOpen ? '0 0 6px #4ade80' : 'none' }} />
      <span style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:'0.75rem',letterSpacing:'0.08em',color: isOpen ? '#4ade80' : '#D42B2B' }}>
        {status.message || (isOpen ? 'OPEN' : 'CLOSED')}
      </span>
    </div>
  )
}

function NutrientRow({ label, value, unit, highlight }) {
  if (value === null || value === undefined) return null
  return (
    <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'4px 0',borderBottom:'1px solid rgba(0,0,0,0.04)' }}>
      <span style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:'0.75rem',letterSpacing:'0.06em',color:'#6B7280' }}>{label}</span>
      <span style={{ fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:'0.8rem',color: highlight ? '#D42B2B' : '#1a1a1a' }}>{value}{unit ? <span style={{ fontFamily:"'Bebas Neue',sans-serif",fontWeight:400,fontSize:'0.75rem',color:'#9CA3AF',marginLeft:'2px' }}>{unit}</span> : null}</span>
    </div>
  )
}

function DishCard({ item }) {
  const [expanded, setExpanded] = useState(false)
  const cal = (item.calories === 'N/A' || item.calories === null || item.calories === undefined) ? null : item.calories
  const portion = (item.portion && item.portion !== 'N/A') ? item.portion : null
  const barWidth = cal ? Math.min((cal / MAX_CAL) * 100, 100) : 0
  const color = calColor(cal)
  const n = item.nutrients || {}
  const hasNutrients = Object.keys(n).length > 0
  const tags = item.tags || []
  const allergens = [...(item.allergens || []), ...(item.allergens_major || [])]

  return (
    <div style={{ background:'#fff',border:`1.5px solid ${expanded ? '#1a1a1a' : 'rgba(0,0,0,0.07)'}`,borderRadius:'8px',boxShadow: expanded ? '3px 3px 0 #1a1a1a' : '1px 2px 0 rgba(0,0,0,0.04)',transition:'all 0.15s',overflow:'hidden' }}>
      {/* Main row */}
      <div
        style={{ padding:'10px 12px',cursor: hasNutrients ? 'pointer' : 'default' }}
        onClick={() => hasNutrients && setExpanded(e => !e)}
      >
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'8px',marginBottom: cal ? '7px' : 0 }}>
          <div style={{ flex:1 }}>
            <p style={{ fontFamily:"'Inter',sans-serif",fontWeight:500,fontSize:'0.85rem',color:'#1a1a1a',margin:'0 0 4px',lineHeight:1.35 }}>
              {item.name}
              {hasNutrients && <span style={{ marginLeft:'6px',fontFamily:"'Bebas Neue',sans-serif",fontSize:'0.8rem',letterSpacing:'0.06em',color:'#C0C0C0' }}>{expanded ? '▲' : '▼'}</span>}
            </p>
            {/* Tags */}
            {tags.length > 0 && (
              <div style={{ display:'flex',flexWrap:'wrap',gap:'4px' }}>
                {tags.map(t => (
                  <span key={t} style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:'0.58rem',letterSpacing:'0.06em',padding:'1px 6px',borderRadius:'99px',background: t === 'Vegetarian' ? '#f0f7eb' : t === 'Vegan' ? '#e0f2e9' : '#FBF2D8',color: t === 'Vegetarian' || t === 'Vegan' ? '#2d6a1f' : '#6B7280',border: `1px solid ${t === 'Vegetarian' || t === 'Vegan' ? '#c8deba' : 'rgba(0,0,0,0.08)'}` }}>
                    {t.toUpperCase()}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div style={{ textAlign:'right',flexShrink:0 }}>
            {cal !== null && <p style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:'0.8rem',letterSpacing:'0.06em',color,margin:0,whiteSpace:'nowrap' }}>{cal} cal</p>}
            {portion && <p style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:'0.8rem',letterSpacing:'0.04em',color:'#C0C0C0',margin:'2px 0 0',whiteSpace:'nowrap' }}>{portion}</p>}
          </div>
        </div>
        {cal !== null && (
          <div style={{ height:'3px',background:'rgba(0,0,0,0.05)',borderRadius:'99px',overflow:'hidden' }}>
            <div style={{ height:'100%',width:`${barWidth}%`,background:color,borderRadius:'99px',transition:'width 0.4s ease' }} />
          </div>
        )}
      </div>

      {/* Expanded nutrition panel */}
      {expanded && (
        <div style={{ borderTop:'1px solid rgba(0,0,0,0.06)',padding:'10px 12px',background:'#FAFAFA',animation:'fadeIn 0.2s ease' }}>
          {item.description && (
            <p style={{ fontFamily:"'Inter',sans-serif",fontSize:'0.78rem',color:'#6B7280',margin:'0 0 10px',lineHeight:1.5,fontStyle:'italic' }}>{item.description}</p>
          )}

          {/* Macro highlights */}
          <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'6px',marginBottom:'10px' }}>
            {[
              { label:'PROTEIN', val: n.protein, unit:'g', color:'#2d6a1f' },
              { label:'CARBS',   val: n.carbs,   unit:'g', color:'#1a4fa0' },
              { label:'FAT',     val: n.fat,      unit:'g', color:'#F57F17' },
              { label:'SODIUM',  val: n.sodium,   unit:'mg', color: n.sodium > 600 ? '#D42B2B' : '#6B7280' },
            ].map(({ label, val, unit, color }) => val !== null && val !== undefined ? (
              <div key={label} style={{ background:'#fff',border:'1.5px solid rgba(0,0,0,0.07)',borderRadius:'6px',padding:'6px 8px',textAlign:'center' }}>
                <p style={{ fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:'0.9rem',color,margin:'0 0 1px' }}>{val}<span style={{ fontSize:'0.6rem',color:'#9CA3AF',marginLeft:'1px' }}>{unit}</span></p>
                <p style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:'0.58rem',letterSpacing:'0.08em',color:'#9CA3AF',margin:0 }}>{label}</p>
              </div>
            ) : null)}
          </div>

          {/* Full nutrient list */}
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 12px' }}>
            <NutrientRow label="Sat. Fat" value={n.sat_fat} unit="g" highlight={n.sat_fat > 5} />
            <NutrientRow label="Trans Fat" value={n.trans_fat} unit="g" highlight={n.trans_fat > 0} />
            <NutrientRow label="Fiber" value={n.fiber} unit="g" />
            <NutrientRow label="Sugar" value={n.sugar} unit="g" highlight={n.sugar > 10} />
            <NutrientRow label="Cholesterol" value={n.cholesterol} unit="mg" highlight={n.cholesterol > 100} />
            <NutrientRow label="Potassium" value={n.potassium} unit="mg" />
            <NutrientRow label="Calcium" value={n.calcium} unit="mg" />
            <NutrientRow label="Iron" value={n.iron} unit="mg" />
          </div>

          {/* Allergens */}
          {allergens.length > 0 && (
            <div style={{ marginTop:'8px',paddingTop:'8px',borderTop:'1px solid rgba(0,0,0,0.05)' }}>
              <span style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:'0.8rem',letterSpacing:'0.08em',color:'#9CA3AF',display:'block',marginBottom:'4px' }}>CONTAINS</span>
              <div style={{ display:'flex',flexWrap:'wrap',gap:'4px' }}>
                {allergens.map(a => (
                  <span key={a} style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:'0.8rem',letterSpacing:'0.05em',padding:'2px 7px',borderRadius:'4px',background:'#FFF0EE',color:'#D42B2B',border:'1px solid rgba(212,43,43,0.2)' }}>{a.replace('*','')}</span>
                ))}
              </div>
            </div>
          )}

          {/* Ingredients */}
          {item.ingredients && (
            <div style={{ marginTop:'8px',paddingTop:'8px',borderTop:'1px solid rgba(0,0,0,0.05)' }}>
              <span style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:'0.8rem',letterSpacing:'0.08em',color:'#9CA3AF',display:'block',marginBottom:'3px' }}>INGREDIENTS</span>
              <p style={{ fontFamily:"'Inter',sans-serif",fontSize:'0.72rem',color:'#9CA3AF',margin:0,lineHeight:1.5 }}>{item.ingredients}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function StationSection({ station }) {
  const [collapsed, setCollapsed] = useState(false)
  const items = station.items || []
  if (!items.length) return null
  const avgCal = items.filter(i => i.calories && i.calories !== 'N/A').reduce((s, i, _, a) => s + i.calories / a.length, 0)
  return (
    <div style={{ marginBottom:'1.6rem' }}>
      <div
        onClick={() => setCollapsed(c => !c)}
        style={{ display:'flex',alignItems:'center',gap:'10px',marginBottom: collapsed ? 0 : '10px',cursor:'pointer',userSelect:'none' }}
      >
        <div style={{ height:'2px',width:'18px',background:'#D42B2B',borderRadius:'1px',flexShrink:0 }} />
        <p style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:'0.78rem',letterSpacing:'0.1em',color:'#6B7280',margin:0 }}>{station.station || station.name}</p>
        <div style={{ flex:1,height:'1px',background:'rgba(0,0,0,0.06)' }} />
        <span style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:'0.8rem',letterSpacing:'0.06em',color:'#C0C0C0' }}>
          {items.length} ITEMS{avgCal > 0 ? ` · ~${Math.round(avgCal)} CAL AVG` : ''}
        </span>
        <span style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:'0.75rem',color:'#C0C0C0',marginLeft:'4px',transition:'transform 0.2s',display:'inline-block',transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}>▼</span>
      </div>
      {!collapsed && (
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(210px,1fr))',gap:'7px',animation:'fadeIn 0.2s ease' }}>
          {items.map((item, i) => <DishCard key={i} item={item} />)}
        </div>
      )}
    </div>
  )
}

function SkeletonLoader() {
  return (
    <div style={{ display:'flex',flexDirection:'column',gap:'1.5rem' }}>
      {[1,2,3].map(n => (
        <div key={n}>
          <div style={{ ...st.skeleton,width:'130px',height:'13px',marginBottom:'10px' }} />
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(210px,1fr))',gap:'7px' }}>
            {[1,2,3,4,5].map(m => (
              <div key={m} style={{ border:'1.5px solid rgba(0,0,0,0.06)',borderRadius:'8px',padding:'10px 12px' }}>
                <div style={{ ...st.skeleton,width:'75%',height:'14px',marginBottom:'8px' }} />
                <div style={{ ...st.skeleton,width:'35%',height:'10px',marginBottom:'6px' }} />
                <div style={{ ...st.skeleton,width:'100%',height:'3px' }} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function FoodGood() {
  const [locations, setLocations] = useState([])
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [selectedPeriod, setSelectedPeriod] = useState('Lunch')
  const [menu, setMenu] = useState(null)
  const [loading, setLoading] = useState(true)
  const [menuLoading, setMenuLoading] = useState(false)
  const [backendDown, setBackendDown] = useState(false)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState([])

  const stations = menu?.stations || []
  const filteredStations = useMemo(() => {
    return stations.map(s => ({
      ...s, items: (s.items || []).filter(item => {
        const matchesQuery = !query || item.name.toLowerCase().includes(query.toLowerCase())
        const matchesFilters = activeFilters.length === 0 || activeFilters.every(f => (item.tags || []).includes(f))
        return matchesQuery && matchesFilters
      })
    })).filter(s => s.items.length > 0)
  }, [stations, query, activeFilters])
  const locationLabel = selectedLocation
    ? selectedLocation.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : ''
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  const totalItems = stations.reduce((n, s) => n + (s.items || []).length, 0)

  useEffect(() => {
    const h = new Date().getHours()
    if (h < 11) setSelectedPeriod('Breakfast')
    else if (h < 15) setSelectedPeriod('Lunch')
    else setSelectedPeriod('Dinner')
  }, [])

  useEffect(() => {
    async function fetchLocations() {
      try {
        const res = await fetch(`${API_BASE}/menu/locations`)
        if (!res.ok) throw new Error()
        const data = await res.json()
        const locs = data.known_locations || []
        setLocations(locs)
        if (locs.length > 0) setSelectedLocation(locs[0])
      } catch { setBackendDown(true) }
      setLoading(false)
    }
    fetchLocations()
  }, [])

  useEffect(() => {
    if (!selectedLocation || !selectedPeriod) return
    async function fetchMenu() {
      setMenuLoading(true); setError(null); setMenu(null); setQuery(''); setActiveFilters([])
      try {
        const res = await fetch(`${API_BASE}/menu/?location=${encodeURIComponent(selectedLocation)}&period_name=${encodeURIComponent(selectedPeriod)}`)
        if (!res.ok) { const e = await res.json(); setError(e.detail || 'Menu unavailable'); setMenuLoading(false); return }
        setMenu(await res.json())
      } catch { setError('Could not load menu.') }
      setMenuLoading(false)
    }
    fetchMenu()
  }, [selectedLocation, selectedPeriod])

  if (loading) return (
    <div style={{ display:'flex',alignItems:'center',justifyContent:'center',minHeight:'60vh' }}>
      <p style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:'0.82rem',letterSpacing:'0.1em',color:'#9CA3AF' }}>LOADING...</p>
    </div>
  )
  if (backendDown) return null

  return (
    <div style={st.page}>
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:none} }
      `}</style>

      {/* ── Hero ── */}
      <div style={st.hero}>
        <div style={{ position:'absolute',top:'-60px',right:'-40px',width:'300px',height:'300px',background:'#D42B2B',opacity:0.06,borderRadius:'50%',zIndex:0 }} />
        <div style={{ position:'absolute',bottom:'-40px',left:'10%',width:'200px',height:'200px',background:'#FFE45C',opacity:0.05,borderRadius:'50%',zIndex:0 }} />
        <div style={{ position:'absolute',inset:0,opacity:0.025,backgroundImage:'radial-gradient(circle,#fff 1px,transparent 1px)',backgroundSize:'20px 20px',zIndex:0 }} />
        <div style={st.heroInner}>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:'1rem',marginBottom:'1.5rem' }}>
            <div>
              <div style={{ display:'flex',alignItems:'center',gap:'8px',marginBottom:'10px' }}>
                <div style={{ background:'#D42B2B',border:'2px solid rgba(255,255,255,0.2)',borderRadius:'4px',padding:'2px 8px' }}>
                  <span style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:'0.8rem',letterSpacing:'0.12em',color:'#fff' }}>DINING HALLS</span>
                </div>
                <div style={{ background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'4px',padding:'2px 8px' }}>
                  <span style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:'0.8rem',letterSpacing:'0.1em',color:'rgba(255,255,255,0.5)' }}>{today.toUpperCase()}</span>
                </div>
              </div>
              <h1 style={{ fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:'clamp(2rem,5vw,3.2rem)',color:'#fff',margin:0,lineHeight:1.05 }}>
                Today's <span style={{ color:'#FFE45C',fontStyle:'italic' }}>Menu</span>
              </h1>
            </div>
            {menu?.status && <StatusBadge status={menu.status} />}
          </div>
          <div style={{ display:'flex',gap:'0',borderBottom:'2px solid rgba(255,255,255,0.08)' }}>
            {PERIODS.map(p => (
              <button key={p} onClick={() => setSelectedPeriod(p)} style={st.periodBtn(selectedPeriod === p)}>{p}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={st.body}>
        {/* Controls */}
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'12px' }}>
          <div style={{ display:'flex',gap:'8px',flexWrap:'wrap' }}>
            {locations.map(loc => (
              <button key={loc} onClick={() => setSelectedLocation(loc)} style={st.locationTab(selectedLocation === loc)}>{loc}</button>
            ))}
          </div>
          <div style={{ position:'relative',minWidth:'200px',maxWidth:'280px',flex:1 }}>
            <svg style={{ position:'absolute',left:'11px',top:'50%',transform:'translateY(-50%)',opacity:0.3 }} width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round"><circle cx="6.5" cy="6.5" r="4.5"/><line x1="10.5" y1="10.5" x2="14" y2="14"/></svg>
            <input type="text" placeholder="Search dishes..." value={query} onChange={e => setQuery(e.target.value)} style={st.searchInput} />
            {query && <button onClick={() => setQuery('')} style={{ position:'absolute',right:'10px',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'#9CA3AF',fontSize:'1.1rem',lineHeight:1,padding:0 }}>×</button>}
          </div>
        </div>

        {/* Diet filter chips */}
        <div style={{ display:'flex',gap:'8px',flexWrap:'wrap',alignItems:'center' }}>
          <span style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:'0.75rem',letterSpacing:'0.1em',color:'#C0C0C0' }}>FILTER:</span>
          {DIET_FILTERS.map(f => {
            const active = activeFilters.includes(f.id)
            return (
              <button key={f.id} onClick={() => setActiveFilters(p => active ? p.filter(x => x !== f.id) : [...p, f.id])}
                style={{ padding:'5px 12px', fontFamily:"'Bebas Neue',sans-serif", fontSize:'0.8rem', letterSpacing:'0.07em', cursor:'pointer', transition:'all 0.12s',
                  background: active ? f.color : '#fff',
                  color: active ? f.textColor : '#9CA3AF',
                  border: active ? `1.5px solid ${f.border}` : '1.5px solid rgba(0,0,0,0.1)',
                  borderRadius:'99px',
                  boxShadow: active ? `2px 2px 0 ${f.border}` : 'none',
                  transform: active ? 'translate(-1px,-1px)' : 'none',
                }}>
                {f.label}
              </button>
            )
          })}
          {activeFilters.length > 0 && (
            <button onClick={() => setActiveFilters([])}
              style={{ padding:'5px 10px', fontFamily:"'Bebas Neue',sans-serif", fontSize:'0.75rem', letterSpacing:'0.06em', cursor:'pointer', background:'none', border:'1.5px solid rgba(0,0,0,0.1)', borderRadius:'99px', color:'#9CA3AF' }}>
              CLEAR ×
            </button>
          )}
        </div>

        {/* Cal legend + tap hint */}
        <div style={{ display:'flex',alignItems:'center',gap:'16px',flexWrap:'wrap',justifyContent:'space-between' }}>
          <div style={{ display:'flex',alignItems:'center',gap:'16px',flexWrap:'wrap' }}>
            <span style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:'0.75rem',letterSpacing:'0.1em',color:'#C0C0C0' }}>CALORIE GUIDE:</span>
            {[{ color:'#4ade80', label:'LIGHT (≤150)' }, { color:'#FFB300', label:'MODERATE (≤350)' }, { color:'#D42B2B', label:'HIGH (350+)' }].map(({ color, label }) => (
              <div key={label} style={{ display:'flex',alignItems:'center',gap:'5px' }}>
                <div style={{ width:'24px',height:'3px',background:color,borderRadius:'99px' }} />
                <span style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:'0.75rem',letterSpacing:'0.06em',color:'#9CA3AF' }}>{label}</span>
              </div>
            ))}
          </div>
          <span style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:'0.75rem',letterSpacing:'0.06em',color:'#C0C0C0' }}>TAP A DISH FOR NUTRITION INFO</span>
        </div>

        {/* Menu card */}
        <div style={st.card}>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.4rem',paddingBottom:'1rem',borderBottom:'1px solid rgba(0,0,0,0.06)',flexWrap:'wrap',gap:'8px' }}>
            <div>
              <div style={{ display:'flex',alignItems:'center',gap:'8px' }}>
                <span style={{ fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:'1.1rem',color:'#1a1a1a' }}>{locationLabel}</span>
                <span style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:'0.8rem',letterSpacing:'0.08em',color:'#D42B2B' }}>{selectedPeriod.toUpperCase()}</span>
              </div>
              {!menuLoading && !error && query && (
                <p style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:'0.8rem',letterSpacing:'0.06em',color:'#9CA3AF',margin:'3px 0 0' }}>
                  {filteredStations.reduce((n,s)=>n+s.items.length,0)} RESULTS FOR "{query.toUpperCase()}"
                </p>
              )}
            </div>
            <div style={{ display:'flex',alignItems:'center',gap:'6px' }}>
              <div style={{ width:'7px',height:'7px',borderRadius:'50%',background: menuLoading ? '#F59E0B' : error ? '#9CA3AF' : '#4ade80', boxShadow: !menuLoading && !error ? '0 0 5px #4ade80' : 'none' }} />
              <span style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:'0.75rem',letterSpacing:'0.08em',color:'#9CA3AF' }}>
                {menuLoading ? 'LOADING' : error ? 'UNAVAILABLE' : `LIVE · ${totalItems} ITEMS`}
              </span>
            </div>
          </div>

          {menuLoading && <SkeletonLoader />}

          {!menuLoading && error && (
            <div style={{ border:'2px dashed rgba(0,0,0,0.1)',borderRadius:'10px',padding:'3rem',textAlign:'center' }}>
              <p style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:'0.8rem',letterSpacing:'0.1em',color:'#9CA3AF',margin:'0 0 6px' }}>MENU UNAVAILABLE</p>
              <p style={{ fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:'1rem',color:'#1a1a1a',margin:0,opacity:0.4 }}>{error}</p>
            </div>
          )}

          {!menuLoading && !error && filteredStations.length > 0 && (
            <div style={{ animation:'fadeIn 0.3s ease' }}>
              {filteredStations.map((station, i) => <StationSection key={i} station={station} />)}
            </div>
          )}

          {!menuLoading && !error && stations.length > 0 && filteredStations.length === 0 && (
            <div style={{ border:'2px dashed rgba(0,0,0,0.1)',borderRadius:'10px',padding:'2.5rem',textAlign:'center' }}>
              <p style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:'0.8rem',letterSpacing:'0.1em',color:'#9CA3AF',margin:'0 0 4px' }}>NO RESULTS</p>
              <p style={{ fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:'0.95rem',color:'#1a1a1a',margin:0,opacity:0.4 }}>Nothing matched "{query}"</p>
            </div>
          )}

          {!menuLoading && !error && stations.length === 0 && menu && (
            <div style={{ border:'2px dashed rgba(0,0,0,0.1)',borderRadius:'10px',padding:'2.5rem',textAlign:'center' }}>
              <p style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:'0.8rem',letterSpacing:'0.1em',color:'#9CA3AF',margin:'0 0 4px' }}>NO MENU POSTED YET</p>
              <p style={{ fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:'0.95rem',color:'#1a1a1a',margin:0,opacity:0.4 }}>No {selectedPeriod.toLowerCase()} menu for {locationLabel}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
