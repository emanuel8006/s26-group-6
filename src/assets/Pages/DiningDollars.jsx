import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const API_BASE = 'http://localhost:8000'

// ── Helpers ───────────────────────────────────────────────────────
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
  const cur = new Date(t)
  cur.setDate(cur.getDate() + 1)
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

const CATEGORIES = [
  { id: 'restaurants', label: 'Restaurants', color: '#D42B2B' },
  { id: 'cafe',        label: 'Cafes & Coffee', color: '#F57F17' },
  { id: 'grocery',     label: 'Grocery',    color: '#2d6a1f' },
  { id: 'other',       label: 'Other',      color: '#6B7280' },
]

const MAP_COLORS = {
  restaurant: '#D42B2B',
  cafe: '#F57F17',
  grocery: '#2d6a1f',
}

const VENDOR_META = {
  "Amelia's Cluck and Smash": { desc: "Crispy chicken sandwiches and smash burgers", tags: ["American", "BBQ & Wings"] },
  "BaKala'O Kitchenette":     { desc: "Caribbean-Latin fusion cuisine", tags: ["Mexican", "Mediterranean"] },
  "Bangkok Pinto":             { desc: "Authentic Thai food", tags: ["Thai"] },
  "Blaze Pizza":               { desc: "Fast-fire'd custom pizzas", tags: ["Italian", "Pizza"] },
  "Boston Shawarma":           { desc: "Middle Eastern shawarma and wraps", tags: ["Middle Eastern", "Mediterranean"] },
  "CVS":                       { desc: "Pharmacy and convenience grocery", tags: ["Grocery"] },
  "Da Vinci Gelato and Waffle": { desc: "Artisan gelato and waffles", tags: ["Italian", "Bakery"] },
  "El Jefe's Taqueria":        { desc: "Burritos, tacos, and Mexican street food", tags: ["Mexican"] },
  "Energize":                  { desc: "Smoothies, juices, and healthy drinks", tags: ["Healthy & Salads", "Cafe & Coffee"] },
  "Five Guys":                 { desc: "Burgers, fries, and hot dogs", tags: ["American", "BBQ & Wings"] },
  "Giovanni's Market":         { desc: "Local grocery and prepared foods", tags: ["Grocery"] },
  "Gyroscope":                 { desc: "Greek and Mediterranean gyros", tags: ["Mediterranean", "Middle Eastern"] },
  "H Mart":                    { desc: "Asian grocery supermarket", tags: ["Grocery", "Asian"] },
  "LUCIE drink + dine":        { desc: "Upscale American dining at the Colonnade", tags: ["American"] },
  "Mamacita Mexican Eats":     { desc: "Tacos, burritos, and Mexican favorites", tags: ["Mexican"] },
  "Panera Bread":              { desc: "Soups, salads, and sandwiches", tags: ["Sandwiches", "Healthy & Salads", "Cafe & Coffee"] },
  "Poke Station":              { desc: "Build-your-own poke bowls", tags: ["Poke", "Asian", "Healthy & Salads"] },
  "Qdoba":                     { desc: "Mexican grill — burritos, tacos, bowls", tags: ["Mexican"] },
  "Sprout":                    { desc: "Fresh healthy bowls and salads", tags: ["Healthy & Salads"] },
  "Star Market":               { desc: "Full-service grocery store", tags: ["Grocery"] },
  "Subway":                    { desc: "Custom subs and sandwiches", tags: ["Sandwiches", "American"] },
  "Symphony Market":           { desc: "Neighborhood grocery and deli", tags: ["Grocery"] },
  "TeaDo":                     { desc: "Bubble tea and Asian drinks", tags: ["Bubble Tea", "Asian"] },
  "University House of Pizza": { desc: "Classic Boston pizza and subs", tags: ["Pizza", "American"] },
  "Wings Over Boston":         { desc: "Chicken wings with tons of sauces", tags: ["BBQ & Wings", "American"] },
  "Anna's Taqueria":           { desc: "Beloved Boston burrito chain", tags: ["Mexican"] },
  "Dunkin'":                   { desc: "Coffee, donuts, and breakfast", tags: ["Cafe & Coffee", "Bakery"] },
  "Equator Coffees":           { desc: "Specialty coffee, ethically sourced", tags: ["Cafe & Coffee"] },
  "Faculty Club":              { desc: "Campus dining with full menu", tags: ["American"] },
  "Fuel America":              { desc: "Coffee and grab-and-go snacks", tags: ["Cafe & Coffee"] },
  "Juicygreens":               { desc: "Salads, wraps, and healthy bowls", tags: ["Healthy & Salads"] },
  "Modern Market":             { desc: "Fresh seasonal American cuisine", tags: ["American", "Healthy & Salads"] },
  "Saxbys":                    { desc: "Coffee and light bites", tags: ["Cafe & Coffee"] },
  "Starbucks":                 { desc: "Coffee, teas, and snacks", tags: ["Cafe & Coffee"] },
  "Tatte Bakery and Cafe":     { desc: "Artisan pastries and Israeli-inspired dishes", tags: ["Bakery", "Cafe & Coffee", "Mediterranean"] },
  "Wollaston's Market":        { desc: "Campus convenience store and grocery", tags: ["Grocery"] },
  "Mamacita Mexican Eats":     { desc: "Tacos, burritos, and Mexican favorites", tags: ["Mexican"] },
}

const st = {
  page: { minHeight: '100vh', background: '#FAF9F6', backgroundImage: 'linear-gradient(rgba(0,0,0,0.035) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.035) 1px,transparent 1px)', backgroundSize: '28px 28px', fontFamily: "'Inter',sans-serif" },
  hero: { background: 'linear-gradient(135deg,#1a1a1a 0%,#2a2a2a 100%)', position: 'relative', overflow: 'hidden' },
  heroInner: { maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 2rem', position: 'relative', zIndex: 2 },
  body: { maxWidth: '1100px', margin: '0 auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  card: { background: '#fff', border: '2px solid rgba(0,0,0,0.09)', borderRadius: '12px', padding: '1.4rem', boxShadow: '3px 4px 0 rgba(0,0,0,0.06)' },
  label: { fontFamily: "'Bebas Neue',sans-serif", fontSize: '0.8rem', letterSpacing: '0.1em', color: '#6B7280', display: 'block', marginBottom: '4px' },
  heading: { fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: '1rem', color: '#1a1a1a', margin: '0 0 1rem' },
  bigNum: { fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: '2.6rem', color: '#1a1a1a', lineHeight: 1, margin: '0 0 2px' },
  input: { width: '100%', padding: '10px 14px', border: '2px solid rgba(0,0,0,0.12)', borderRadius: '8px', fontSize: '0.9rem', fontFamily: "'Inter',sans-serif", background: '#fff', color: '#1a1a1a', outline: 'none', boxSizing: 'border-box', boxShadow: '2px 3px 0 rgba(0,0,0,0.07)', transition: 'border-color 0.15s' },
  btnRed: { padding: '11px 20px', background: '#D42B2B', color: '#fff', border: '2.5px solid #1a1a1a', borderRadius: '8px', fontFamily: "'Bebas Neue',sans-serif", fontSize: '0.9rem', letterSpacing: '0.07em', cursor: 'pointer', boxShadow: '3px 3px 0 #1a1a1a', transition: 'all 0.12s' },
  eyebrow: { fontFamily: "'Bebas Neue',sans-serif", fontSize: '0.8rem', letterSpacing: '0.14em', color: '#D42B2B', display: 'block', marginBottom: '6px' },
  twoCol: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' },
  hint: { fontFamily: "'Bebas Neue',sans-serif", fontSize: '0.78rem', letterSpacing: '0.04em', color: '#9CA3AF', marginTop: '4px' },
  paceBadge: (pace) => {
    const map = { on_track:{ bg:'#f0f7eb',color:'#2d6a1f',border:'#c8deba',label:'On Pace' }, over:{ bg:'#FFF0EE',color:'#D42B2B',border:'#f0b8b8',label:'Spending Fast' }, under:{ bg:'#e6f0ff',color:'#1a4fa0',border:'#b8d0f0',label:'Ahead' } }
    const p = map[pace] || map.on_track
    return { fontFamily:"'Bebas Neue',sans-serif", fontSize:'0.84rem', letterSpacing:'0.08em', padding:'3px 10px', borderRadius:'99px', background:p.bg, color:p.color, border:`1.5px solid ${p.border}`, display:'inline-block' }
  },
  filterChip: (active, color) => ({
    padding: '5px 14px', fontFamily: "'Bebas Neue',sans-serif", fontSize: '0.78rem', letterSpacing: '0.07em',
    cursor: 'pointer', transition: 'all 0.12s', borderRadius: '99px',
    background: active ? (color || '#1a1a1a') : '#fff',
    color: active ? '#fff' : '#9CA3AF',
    border: `1.5px solid ${active ? (color || '#1a1a1a') : 'rgba(0,0,0,0.12)'}`,
    boxShadow: active ? `2px 2px 0 rgba(0,0,0,0.15)` : 'none',
  }),
}

// ── Vendor Map Component ──────────────────────────────────────────
function VendorMap({ vendors, profile }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])
  const [catFilter, setCatFilter] = useState('all')
  const [locFilter, setLocFilter] = useState('all')
  const [leafletLoaded, setLeafletLoaded] = useState(!!window.L)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Load Leaflet CSS + JS via CDN
  useEffect(() => {
    if (window.L) { setLeafletLoaded(true); return }

    // Add CSS if not already present
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    // Add JS if not already present
    if (!document.querySelector('script[src*="leaflet"]')) {
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.onload = () => setLeafletLoaded(true)
      document.head.appendChild(script)
    } else {
      // Script tag exists but may already be loaded
      const check = setInterval(() => {
        if (window.L) { setLeafletLoaded(true); clearInterval(check) }
      }, 100)
      return () => clearInterval(check)
    }
  }, [])

  // Init map — runs after leaflet loads AND mapRef is available
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current) return
    if (mapInstanceRef.current) {
      // Already initialized, just invalidate size
      mapInstanceRef.current.invalidateSize()
      return
    }
    const L = window.L
    const map = L.map(mapRef.current, { zoomControl: true, scrollWheelZoom: false })
    map.setView([42.3397, -71.0893], 15)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)
    mapInstanceRef.current = map
    // Force size recalc after a tick
    setTimeout(() => map.invalidateSize(), 200)
  }, [leafletLoaded, mapRef.current])

  // Update markers when filters or vendors change
  useEffect(() => {
    if (!leafletLoaded || !mapInstanceRef.current || !vendors.length) return
    const L = window.L
    const map = mapInstanceRef.current

    // Clear existing markers
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    const filtered = vendors.filter(v => {
      if (catFilter !== 'all' && v.category !== catFilter) return false
      if (locFilter !== 'all' && v.location_type !== locFilter) return false
      return true
    })

    filtered.forEach(v => {
      const color = MAP_COLORS[v.category] || '#6B7280'
      const icon = L.divIcon({
        html: `<div style="
          width: 16px; height: 16px; border-radius: 50%;
          background: ${color}; border: 2.5px solid #fff;
          box-shadow: 0 2px 5px rgba(0,0,0,0.35);
        "></div>`,
        className: '',
        iconSize: [16, 16],
        iconAnchor: [8, 8],
        popupAnchor: [0, -12],
      })

      const meta = VENDOR_META[v.name] || {}
      const desc = meta.desc || ''
      const tags = (meta.tags || []).map(t => `<span style="display:inline-block;padding:2px 8px;border-radius:99px;background:#F3F4F6;font-size:0.68rem;font-family:sans-serif;color:#6B7280;margin:0 3px 3px 0;">${t}</span>`).join('')
      const popup = `
        <div style="font-family: 'Inter', sans-serif; min-width: 200px; padding: 4px 0;">
          <p style="font-family: sans-serif; font-size: 0.68rem; letter-spacing: 0.08em; color: ${color}; margin: 0 0 3px; text-transform: uppercase; font-weight: 700;">${v.location_type === 'on_campus' ? 'ON CAMPUS' : 'OFF CAMPUS'} · ${v.category}</p>
          <p style="font-weight: 700; font-size: 1rem; color: #1a1a1a; margin: 0 0 2px;">${v.name}</p>
          ${desc ? `<p style="font-size: 0.8rem; color: #4B5563; margin: 0 0 5px; line-height: 1.4;">${desc}</p>` : ''}
          <p style="font-size: 0.75rem; color: #9CA3AF; margin: 0 0 6px;">${v.address}</p>
          ${tags ? `<div style="margin-bottom: 6px;">${tags}</div>` : ''}
          ${!v.is_available ? '<p style="font-size: 0.72rem; color: #D42B2B; margin: 0 0 6px; font-weight: 600;">⚠ Currently unavailable</p>' : ''}
          ${v.website_url ? `<a href="${v.website_url}" target="_blank" rel="noopener noreferrer" style="font-size: 0.78rem; color: #D42B2B; font-weight: 600; text-decoration: none;">Visit Website →</a>` : ''}
        </div>
      `
      const marker = L.marker([v.latitude, v.longitude], { icon }).addTo(map).bindPopup(popup, { maxWidth: 240 })
      markersRef.current.push(marker)
    })
  }, [leafletLoaded, vendors, catFilter, locFilter])

  if (!vendors.length) return null

  const visibleCount = vendors.filter(v => {
    if (catFilter !== 'all' && v.category !== catFilter) return false
    if (locFilter !== 'all' && v.location_type !== locFilter) return false
    return true
  }).length

  return (
    <div style={st.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <span style={st.label}>DINING DOLLAR VENDORS</span>
          <p style={{ ...st.heading, marginBottom: '0' }}>Where to Spend Near Campus</p>
        </div>
        <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '0.78rem', letterSpacing: '0.06em', color: '#9CA3AF' }}>{visibleCount} LOCATIONS</span>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {/* Location type */}
        {[{ id: 'all', label: 'All Locations' }, { id: 'on_campus', label: 'On Campus' }, { id: 'off_campus', label: 'Off Campus' }].map(f => (
          <button key={f.id} onClick={() => setLocFilter(f.id)} style={st.filterChip(locFilter === f.id, '#1a1a1a')}>{f.label}</button>
        ))}
        <div style={{ width: '1px', background: 'rgba(0,0,0,0.1)', margin: '0 4px' }} />
        {/* Category */}
        {[{ id: 'all', label: 'All', color: '#1a1a1a' }, { id: 'restaurant', label: '🍽 Restaurants', color: '#D42B2B' }, { id: 'cafe', label: '☕ Cafes', color: '#F57F17' }, { id: 'grocery', label: '🛒 Grocery', color: '#2d6a1f' }].map(f => (
          <button key={f.id} onClick={() => setCatFilter(f.id)} style={st.filterChip(catFilter === f.id, f.color)}>{f.label}</button>
        ))}
      </div>

      {/* Map */}
      <div style={{ borderRadius: '10px', overflow: 'hidden', border: '2px solid rgba(0,0,0,0.09)', height: isFullscreen ? '80vh' : '480px', position: 'relative', transition: 'height 0.3s ease' }}>
        {!leafletLoaded && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F3F4F6', zIndex: 10 }}>
            <p style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '0.84rem', letterSpacing: '0.1em', color: '#9CA3AF' }}>LOADING MAP...</p>
          </div>
        )}
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
        {/* Fullscreen toggle */}
        <button onClick={() => { setIsFullscreen(f => !f); setTimeout(() => mapInstanceRef.current?.invalidateSize(), 350) }}
          style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1000, background: '#fff', border: '2px solid rgba(0,0,0,0.15)', borderRadius: '6px', width: '34px', height: '34px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>
          {isFullscreen
            ? <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round"><path d="M5 1H1v4M9 1h4v4M5 13H1V9M9 13h4V9"/></svg>
            : <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round"><path d="M1 5V1h4M9 1h4v4M1 9v4h4M13 9v4H9"/></svg>
          }
        </button>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '16px', marginTop: '10px', flexWrap: 'wrap' }}>
        {[{ color: '#D42B2B', label: 'Restaurant' }, { color: '#F57F17', label: 'Cafe' }, { color: '#2d6a1f', label: 'Grocery' }].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: color, border: '2px solid white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
            <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '0.75rem', letterSpacing: '0.06em', color: '#6B7280' }}>{label}</span>
          </div>
        ))}
        <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '0.75rem', letterSpacing: '0.06em', color: '#9CA3AF', marginLeft: 'auto' }}>CLICK A PIN FOR DETAILS</span>
      </div>

      {/* Vendor recommendations based on preferences */}
      {(() => {
        const cuisines = profile?.cuisines || []
        const diet = profile?.diet || []
        if (!cuisines.length && !diet.length) return null
        const recs = vendors.filter(v => {
          const meta = VENDOR_META[v.name]
          if (!meta) return false
          const matchesCuisine = cuisines.some(c => meta.tags?.includes(c))
          const matchesDiet = diet.includes('Healthy') && meta.tags?.includes('Healthy & Salads')
            || diet.includes('Vegan') && ['Juicygreens', 'Sprout', 'Poke Station'].includes(v.name)
            || diet.includes('Vegetarian') && ['Juicygreens', 'Sprout', 'Poke Station', 'Blaze Pizza', 'Panera Bread'].includes(v.name)
          return matchesCuisine || matchesDiet
        }).slice(0, 4)
        if (!recs.length) return null
        return (
          <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.07)', paddingTop: '1rem' }}>
            <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '0.78rem', letterSpacing: '0.1em', color: '#D42B2B', display: 'block', marginBottom: '8px' }}>RECOMMENDED FOR YOU</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
              {recs.map(v => {
                const meta = VENDOR_META[v.name] || {}
                const color = MAP_COLORS[v.category] || '#6B7280'
                return (
                  <div key={v.id} style={{ background: '#FAFAFA', border: '1.5px solid rgba(0,0,0,0.08)', borderRadius: '8px', padding: '10px 12px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color, flexShrink: 0, marginTop: '4px' }} />
                    <div>
                      <p style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: '0.85rem', color: '#1a1a1a', margin: '0 0 2px' }}>{v.name}</p>
                      <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '0.75rem', color: '#6B7280', margin: '0 0 4px', lineHeight: 1.3 }}>{meta.desc || ''}</p>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {(meta.tags || []).slice(0, 2).map(t => (
                          <span key={t} style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '0.65rem', letterSpacing: '0.05em', padding: '1px 7px', borderRadius: '99px', background: '#F3F4F6', color: '#6B7280' }}>{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })()}
    </div>
  )
}

function LogModal({ onClose, onSave }) {
  const [form, setForm] = useState({ amount: '', category: 'restaurants', location: '', note: '' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',backdropFilter:'blur(4px)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem' }} onClick={onClose}>
      <div style={{ background:'#fff',border:'2.5px solid #1a1a1a',borderRadius:'14px',padding:'1.8rem',maxWidth:'400px',width:'100%',boxShadow:'5px 6px 0 #1a1a1a' }} onClick={e=>e.stopPropagation()}>
        <p style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:'0.8rem',letterSpacing:'0.12em',color:'#9CA3AF',margin:'0 0 4px' }}>NEW TRANSACTION</p>
        <p style={{ fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:'1.4rem',color:'#1a1a1a',margin:'0 0 1.4rem' }}>Log Dining Dollars</p>
        <div style={{ display:'flex',flexDirection:'column',gap:'1rem' }}>
          <div>
            <label style={st.label}>AMOUNT</label>
            <div style={{ position:'relative' }}>
              <span style={{ position:'absolute',left:'12px',top:'50%',transform:'translateY(-50%)',color:'#9CA3AF',fontSize:'0.9rem' }}>$</span>
              <input
                type="number" inputMode="decimal" placeholder="0.00" value={form.amount}
                onKeyDown={e => ['e','E','+','-'].includes(e.key) && e.preventDefault()}
                onWheel={e => e.target.blur()}
                onChange={e => {
                  const val = e.target.value
                  if (val === '' || val === '.') { set('amount', val); return }
                  const num = parseFloat(val)
                  if (isNaN(num) || num < 0) return
                  if (num > 50) { set('amount', '50'); return }
                  const parts = val.split('.')
                  if (parts[1] && parts[1].length > 2) return
                  set('amount', val)
                }}
                style={{ ...st.input, paddingLeft:'28px' }}
              />
            </div>
          </div>
          <div>
            <label style={st.label}>CATEGORY</label>
            <select value={form.category} onChange={e=>set('category',e.target.value)} style={st.input}>
              {CATEGORIES.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label style={st.label}>LOCATION</label>
            <input type="text" placeholder="e.g. Starbucks on Huntington" value={form.location} onChange={e=>set('location',e.target.value)} style={st.input} />
          </div>
          <div>
            <label style={st.label}>NOTE (OPTIONAL)</label>
            <input type="text" placeholder="Any notes..." value={form.note} onChange={e=>set('note',e.target.value)} style={st.input} />
          </div>
        </div>
        <div style={{ display:'flex',gap:'8px',marginTop:'1.4rem' }}>
          <button onClick={onClose} style={{ flex:1,padding:'10px',border:'2px solid rgba(0,0,0,0.12)',borderRadius:'8px',fontFamily:"'Bebas Neue',sans-serif",fontSize:'0.85rem',letterSpacing:'0.06em',cursor:'pointer',background:'#fff',color:'#9CA3AF' }}>CANCEL</button>
          <button onClick={()=>{ if(form.amount) { onSave(form); onClose() } }} style={{ flex:2,padding:'10px',background:'#D42B2B',border:'2px solid #1a1a1a',borderRadius:'8px',fontFamily:"'Bebas Neue',sans-serif",fontSize:'0.85rem',letterSpacing:'0.06em',cursor:'pointer',color:'#fff',boxShadow:'2px 3px 0 #1a1a1a' }}>SAVE TRANSACTION</button>
        </div>
      </div>
    </div>
  )
}

export default function DiningDollars() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [transactions, setTransactions] = useState([])
  const [toast, setToast] = useState(null)
  const [vendors, setVendors] = useState([])

  useEffect(() => {
    const stored = localStorage.getItem('nomnom_profile')
    if (stored) try { setProfile(JSON.parse(stored)) } catch {}
  }, [])

  // Fetch vendors
  useEffect(() => {
    async function fetchVendors() {
      try {
        const res = await fetch(`${API_BASE}/vendors/`)
        if (!res.ok) return
        const data = await res.json()
        // Deduplicate by name + location_type
        const seen = new Set()
        const deduped = data.filter(v => {
          const key = `${v.name}|${v.location_type}`
          if (seen.has(key)) return false
          seen.add(key)
          return true
        })
        setVendors(deduped)
      } catch {}
    }
    fetchVendors()
  }, [])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  const plan = profile?.planData
  const totalDD = plan?.diningDollars || 0
  const startingDD = parseFloat(profile?.diningDollarsLeft) || totalDD
  const spent = transactions.reduce((s, t) => s + parseFloat(t.amount || 0), 0)
  const current = Math.max(0, startingDD - spent)
  const pct = totalDD ? Math.round((current / totalDD) * 100) : 0

  const breaks = profile?.semesterBreaks || []
  const customOff = profile?.customOffDays || []
  const semEnd = profile?.semesterEnd
  const semStart = profile?.semesterStart
  const totalActiveDays = calcTotalActiveDays(semStart, semEnd, breaks, customOff)
  const activeDaysLeft = calcActiveDaysLeft(semEnd, breaks, customOff)
  const daysLeft = daysUntil(semEnd)
  const projWeekly = profile?.dollarsPerWeek ? parseFloat(profile.dollarsPerWeek) : 0
  const dailyBudget = activeDaysLeft > 0 ? current / activeDaysLeft : 0

  const pctTimeLeft = totalActiveDays > 0 ? (activeDaysLeft || 0) / totalActiveDays : 0
  const expectedRemaining = totalDD * pctTimeLeft
  const pace = !totalDD ? null : Math.abs(current - expectedRemaining) / totalDD < 0.05 ? 'on_track' : current > expectedRemaining ? 'under' : 'over'

  const catTotals = CATEGORIES.map(c => ({
    ...c,
    total: transactions.filter(t => t.category === c.id).reduce((s, t) => s + parseFloat(t.amount || 0), 0),
  })).filter(c => c.total > 0)

  const handleSave = (form) => {
    setTransactions(p => [{
      ...form, id: Date.now(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    }, ...p])
    showToast(`$${parseFloat(form.amount).toFixed(2)} logged`)
  }

  const semLabel = profile?.semesterPreset === 'spring2026' ? 'Spring 2026'
    : profile?.semesterPreset === 'fall2026' ? 'Fall 2026' : 'This Semester'

  return (
    <div style={st.page}>

      {/* ── Hero ── */}
      <div style={st.hero}>
        <div style={{ position:'absolute',inset:0,backgroundImage:'radial-gradient(circle at 80% 50%,rgba(212,43,43,0.1),transparent 55%)',zIndex:1 }} />
        <div style={{ position:'absolute',inset:0,opacity:0.03,backgroundImage:'radial-gradient(circle,#fff 1px,transparent 1px)',backgroundSize:'22px 22px',zIndex:1 }} />
        <div style={st.heroInner}>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:'1rem' }}>
            <div>
              <span style={st.eyebrow}>DINING DOLLARS · {semLabel}</span>
              <h1 style={{ fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:'clamp(1.8rem,4vw,2.8rem)',color:'#fff',margin:'0 0 6px',lineHeight:1.1 }}>Your Balance</h1>
              <p style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:'0.88rem',letterSpacing:'0.04em',color:'rgba(255,255,255,0.45)',margin:0 }}>
                {plan?.name || 'No plan'} · ${totalDD} starting balance
              </p>
            </div>
            <button onClick={() => setShowModal(true)} style={{ ...st.btnRed, alignSelf:'flex-start', marginTop:'4px' }}>+ LOG TRANSACTION</button>
          </div>

          <div style={{ display:'grid',gridTemplateColumns:'auto 1fr',gap:'2.5rem',alignItems:'center',marginTop:'2rem',flexWrap:'wrap' }}>
            <div>
              <p style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:'0.84rem',letterSpacing:'0.12em',color:'rgba(255,255,255,0.35)',margin:'0 0 4px' }}>CURRENT BALANCE</p>
              <p style={{ fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:'clamp(2.8rem,6vw,4.5rem)',color:'#fff',lineHeight:1,margin:'0 0 4px' }}>${current.toFixed(0)}</p>
              <div style={{ display:'flex',alignItems:'center',gap:'10px',flexWrap:'wrap' }}>
                <p style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:'0.8rem',letterSpacing:'0.06em',color:'rgba(255,255,255,0.35)',margin:0 }}>OF ${totalDD} · {pct}% REMAINING</p>
                {pace && <span style={st.paceBadge(pace)}>{({ on_track:'On Pace',over:'Spending Fast',under:'Ahead' })[pace]}</span>}
              </div>
            </div>
            <div>
              <div style={{ height:'6px',background:'rgba(255,255,255,0.12)',borderRadius:'99px',overflow:'hidden',marginBottom:'10px' }}>
                <div style={{ height:'100%',width:`${pct}%`,background: pace==='over' ? '#D42B2B' : '#4ade80',borderRadius:'99px',transition:'width 0.6s ease' }} />
              </div>
              <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'10px' }}>
                {[
                  { label:'SPENT', value:`$${spent.toFixed(0)}` },
                  { label:'$/DAY LEFT', value:`$${dailyBudget.toFixed(2)}` },
                  { label:'DAYS LEFT', value: daysLeft ?? '—' },
                ].map(({ label, value }) => (
                  <div key={label} style={{ background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'8px',padding:'10px 12px' }}>
                    <p style={{ fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:'1.2rem',color:'#fff',margin:'0 0 2px',lineHeight:1 }}>{value}</p>
                    <p style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:'0.8rem',letterSpacing:'0.1em',color:'rgba(255,255,255,0.35)',margin:0 }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={st.body}>

        {/* ── Weekly budget alert ── */}
        {projWeekly > 0 && dailyBudget > 0 && (() => {
          const dailyProj = projWeekly / 7
          const isOver = dailyBudget < dailyProj * 0.9
          const isUnder = dailyBudget > dailyProj * 1.1
          if (!isOver && !isUnder) return null
          return (
            <div style={{ background: isOver ? '#FFF0EE' : '#f0f7eb', border: `2px solid ${isOver ? '#D42B2B' : '#2d6a1f'}`, borderRadius:'10px', padding:'14px 18px', boxShadow:`3px 3px 0 ${isOver ? '#D42B2B' : '#2d6a1f'}`, display:'flex',alignItems:'center',gap:'12px' }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke={isOver ? '#D42B2B' : '#2d6a1f'} strokeWidth="2" strokeLinecap="round"><circle cx="9" cy="9" r="7"/><line x1="9" y1="6" x2="9" y2="10"/><circle cx="9" cy="13" r="0.5" fill={isOver ? '#D42B2B' : '#2d6a1f'}/></svg>
              <p style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:'0.82rem',letterSpacing:'0.04em',color: isOver ? '#D42B2B' : '#2d6a1f',margin:0 }}>
                {isOver
                  ? `YOU'RE SPENDING FASTER THAN PLANNED — YOUR DAILY BUDGET IS $${dailyBudget.toFixed(2)} VS YOUR PROJECTED $${dailyProj.toFixed(2)}/DAY.`
                  : `YOU'RE AHEAD OF BUDGET — $${dailyBudget.toFixed(2)}/DAY REMAINING VS $${dailyProj.toFixed(2)}/DAY PROJECTED.`}
              </p>
            </div>
          )
        })()}

        <div style={st.twoCol}>
          {/* ── Left: history + breakdown ── */}
          <div style={{ display:'flex',flexDirection:'column',gap:'1.2rem' }}>

            {/* Weekly pace bars */}
            {projWeekly > 0 && (
              <div style={st.card}>
                <span style={st.label}>WEEKLY DINING DOLLAR PACE</span>
                <p style={st.heading}>Projected Spend Per Week</p>
                <div style={{ display:'flex',alignItems:'flex-end',gap:'4px',height:'80px',marginBottom:'6px' }}>
                  {Array.from({ length: Math.min(Math.ceil(totalActiveDays / 7), 16) }, (_, i) => (
                    <div key={i} style={{ flex:1,display:'flex',flexDirection:'column',alignItems:'center',height:'100%',justifyContent:'flex-end' }}>
                      <div style={{ width:'100%',background:'#FBF2D8',border:'1px solid rgba(0,0,0,0.07)',borderRadius:'3px 3px 0 0',height:`${(projWeekly / (projWeekly * 1.4)) * 100}%`,minHeight:'4px' }} />
                    </div>
                  ))}
                </div>
                <div style={{ display:'flex',justifyContent:'space-between' }}>
                  <span style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:'0.84rem',letterSpacing:'0.06em',color:'#9CA3AF' }}>${projWeekly}/WK PROJECTED</span>
                  <span style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:'0.84rem',letterSpacing:'0.06em',color:'#9CA3AF' }}>ACTUAL TRACKING — COMING SOON</span>
                </div>
              </div>
            )}

            {/* Category breakdown */}
            {catTotals.length > 0 && (
              <div style={st.card}>
                <span style={st.label}>SPENDING BY CATEGORY</span>
                <p style={st.heading}>Where It's Going</p>
                <div style={{ display:'flex',flexDirection:'column',gap:'14px' }}>
                  {catTotals.map(c => (
                    <div key={c.id}>
                      <div style={{ display:'flex',justifyContent:'space-between',marginBottom:'5px' }}>
                        <div style={{ display:'flex',alignItems:'center',gap:'8px' }}>
                          <div style={{ width:'10px',height:'10px',borderRadius:'2px',background:c.color,flexShrink:0 }} />
                          <span style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:'0.78rem',letterSpacing:'0.06em',color:'#1a1a1a' }}>{c.label}</span>
                        </div>
                        <span style={{ fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:'0.9rem',color:'#1a1a1a' }}>${c.total.toFixed(2)}</span>
                      </div>
                      <div style={{ height:'6px',background:'rgba(0,0,0,0.06)',borderRadius:'99px',overflow:'hidden' }}>
                        <div style={{ height:'100%',width:`${Math.min((c.total/Math.max(spent,1))*100,100)}%`,background:c.color,borderRadius:'99px',transition:'width 0.5s ease' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Transaction history */}
            <div style={st.card}>
              <span style={st.label}>TRANSACTION HISTORY</span>
              <p style={st.heading}>Recent Transactions</p>
              {transactions.length === 0 ? (
                <div style={{ border:'2px dashed rgba(0,0,0,0.1)',borderRadius:'8px',padding:'2rem',textAlign:'center' }}>
                  <p style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:'0.8rem',letterSpacing:'0.1em',color:'#9CA3AF',margin:'0 0 4px' }}>NO TRANSACTIONS YET</p>
                  <p style={{ fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:'0.95rem',color:'#1a1a1a',margin:0,opacity:0.4 }}>Log your first dining dollar spend above</p>
                </div>
              ) : (
                <div style={{ display:'flex',flexDirection:'column',gap:'0' }}>
                  {transactions.map((t, i) => {
                    const cat = CATEGORIES.find(c => c.id === t.category)
                    return (
                      <div key={t.id} style={{ display:'flex',alignItems:'center',gap:'12px',padding:'12px 0',borderBottom: i < transactions.length-1 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}>
                        <div style={{ width:'8px',height:'8px',borderRadius:'2px',background:cat?.color||'#9CA3AF',flexShrink:0 }} />
                        <div style={{ flex:1,minWidth:0 }}>
                          <p style={{ fontFamily:"'Inter',sans-serif",fontWeight:500,fontSize:'0.88rem',color:'#1a1a1a',margin:'0 0 1px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>
                            {t.location || cat?.label || 'Transaction'}
                          </p>
                          <p style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:'0.84rem',letterSpacing:'0.05em',color:'#9CA3AF',margin:0 }}>{cat?.label} · {t.date}</p>
                        </div>
                        <span style={{ fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:'0.9rem',color:'#D42B2B',flexShrink:0 }}>-${parseFloat(t.amount).toFixed(2)}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── Right: tips + budget info ── */}
          <div style={{ display:'flex',flexDirection:'column',gap:'1.2rem' }}>
            <div style={st.card}>
              <span style={st.label}>BALANCE OVERVIEW</span>
              {[
                { label:'Starting Balance', value:`$${startingDD.toFixed(0)}`, muted:true },
                { label:'Spent So Far',     value:`-$${spent.toFixed(2)}`,     muted:false, red:true },
                { label:'Remaining',        value:`$${current.toFixed(2)}`,    muted:false, bold:true },
                { label:'Active Days Left', value: activeDaysLeft ?? '—',      muted:true },
                { label:'Daily Budget',     value:`$${dailyBudget.toFixed(2)}/day`, muted:true },
                { label:'Weekly Budget',    value:`$${(dailyBudget*7).toFixed(2)}/wk`, muted:true },
              ].map(({ label, value, muted, red, bold }, i) => (
                <div key={label} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom: i < 5 ? '1px solid rgba(0,0,0,0.04)' : 'none' }}>
                  <span style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:'0.8rem',letterSpacing:'0.06em',color: muted ? '#9CA3AF' : '#1a1a1a' }}>{label}</span>
                  <span style={{ fontFamily:"'Playfair Display',serif",fontWeight: bold ? 700 : 500,fontSize: bold ? '1.1rem' : '0.9rem',color: red ? '#D42B2B' : bold ? '#1a1a1a' : '#6B7280' }}>{value}</span>
                </div>
              ))}
            </div>

            <div style={st.card}>
              <span style={st.label}>MONEY TIPS</span>
              <div style={{ display:'flex',flexDirection:'column',gap:'10px' }}>
                {[
                  { bg:'#FBF2D8', border:'rgba(0,0,0,0.08)', title:'Use swipes when you can', body:"Dining hall swipes are often better value than spending dining dollars on the same meal." },
                  { bg:'#f0f7eb', border:'#c8deba', title:'Grocery runs stretch further', body:"Batch shopping 1–2x per week at Star Market or Wollaston's makes your balance last longer." },
                  { bg:'#FFF0EE', border:'#f0b8b8', title:'Watch the weekend spend', body:'Weekends tend to be the biggest spending days. Plan ahead to avoid burning through your balance.' },
                ].map(({ bg, border, title, body }) => (
                  <div key={title} style={{ background:bg,border:`1.5px solid ${border}`,borderRadius:'8px',padding:'12px 14px' }}>
                    <p style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:'0.8rem',letterSpacing:'0.06em',color:'#1a1a1a',margin:'0 0 3px' }}>{title.toUpperCase()}</p>
                    <p style={{ fontFamily:"'Inter',sans-serif",fontSize:'0.78rem',color:'#6B7280',margin:0,lineHeight:1.5 }}>{body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Vendor Map ── */}
        <VendorMap vendors={vendors} profile={profile} />

      </div>

      {showModal && <LogModal onClose={() => setShowModal(false)} onSave={handleSave} />}

      {toast && (
        <div style={{ position:'fixed',bottom:'2rem',left:'50%',transform:'translateX(-50%)',background:'#1a1a1a',color:'#fff',padding:'10px 20px',borderRadius:'99px',fontFamily:"'Bebas Neue',sans-serif",fontSize:'0.82rem',letterSpacing:'0.06em',boxShadow:'0 4px 20px rgba(0,0,0,0.3)',whiteSpace:'nowrap',zIndex:9999,border:'2px solid rgba(255,255,255,0.1)' }}>
          {toast}
        </div>
      )}
    </div>
  )
}
