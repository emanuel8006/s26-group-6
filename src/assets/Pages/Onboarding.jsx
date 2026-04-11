import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { updateMealPlan } from '../Components/APICalls'
import { loadAndStoreUserData } from './Login'

const PLANS = [
  { id: 'unlimited', name: 'NU – Unlimited', price: 4450, swipes: 999, diningDollars: 400, guestPasses: 10, tag: 'Most Flexible' },
  { id: '225',       name: 'NU – 225',       price: 4450, swipes: 225,  diningDollars: 600, guestPasses: 10, tag: 'Most Popular' },
  { id: '180',       name: 'NU – 180',       price: 3935, swipes: 180,  diningDollars: 300, guestPasses: 10, tag: null },
  { id: '150',       name: 'NU – 150',       price: 3465, swipes: 150,  diningDollars: 200, guestPasses: 10, tag: null },
  { id: '100',       name: 'NU – 100',       price: 2800, swipes: 100,  diningDollars: 200, guestPasses: 10, tag: 'Budget Pick' },
]

const SEMESTERS = {
  spring2026: {
    label: 'Spring 2026', short: 'SP26',
    start: '2026-01-07', end: '2026-04-26',
    breaks: [{
      id: 'spring_break', label: 'Spring Break',
      dates: ['2026-03-02','2026-03-03','2026-03-04','2026-03-05','2026-03-06'],
      weekendDates: ['2026-02-28','2026-03-01','2026-03-07','2026-03-08'],
      weekendLabel: 'Include surrounding weekend (Feb 28, Mar 1 & Mar 7–8)',
      enabled: false, weekendEnabled: false,
    }],
  },
  fall2026: {
    label: 'Fall 2026', short: 'FA26',
    start: '2026-09-09', end: '2026-12-20',
    breaks: [{
      id: 'thanksgiving', label: 'Thanksgiving Break',
      dates: ['2026-11-25','2026-11-26','2026-11-27'],
      weekendDates: ['2026-11-28','2026-11-29'],
      weekendLabel: 'Include the following weekend (Nov 28–29)',
      enabled: false, weekendEnabled: false,
    }],
  },
}

const DIET_OPTIONS = ['Vegetarian', 'Vegan', 'Halal', 'Gluten-Free', 'Dairy-Free', 'High Protein', 'Low Carb', 'Low Calorie']
const CUISINE_OPTIONS = ['American', 'Mexican', 'Thai', 'Mediterranean', 'Middle Eastern', 'Italian', 'Asian']
const ALLERGEN_OPTIONS = ['Peanuts', 'Tree Nuts', 'Shellfish', 'Fish', 'Eggs', 'Milk / Dairy', 'Soy', 'Wheat / Gluten', 'Sesame', 'Coconut']
const DINING_STYLE_OPTIONS = ['Quick grab & go', 'Sit-down meal', 'Coffee & cafe runs', 'Grocery & meal prep', 'Late night eats', 'Breakfast spots']
const FOOD_TYPE_OPTIONS = ['Bowls & salads', 'Sandwiches & wraps', 'Burgers & wings', 'Burritos & tacos', 'Noodles & rice', 'Sushi & poke', 'Bakery & pastries', 'Bubble tea & drinks', 'Smoothies & juices']
const PORTION_OPTIONS = ['Small', 'Regular', 'Large']
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']

const BREAK_ART = {
  spring_break: (
    <svg width="80" height="60" viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="60" rx="6" fill="#FFF8E1"/>
      <circle cx="62" cy="14" r="9" fill="#FFD54F" opacity="0.9"/>
      {[0,45,90,135,180,225,270,315].map((deg, i) => { const r = deg * Math.PI / 180; return <line key={i} x1={62 + Math.cos(r)*12} y1={14 + Math.sin(r)*12} x2={62 + Math.cos(r)*15} y2={14 + Math.sin(r)*15} stroke="#FFD54F" strokeWidth="2" strokeLinecap="round"/> })}
      <path d="M0 42 Q10 38 20 42 Q30 46 40 42 Q50 38 60 42 Q70 46 80 42 L80 60 L0 60 Z" fill="#4FC3F7" opacity="0.85"/>
      <path d="M0 46 Q10 43 20 46 Q30 50 40 46 Q50 43 60 46 Q70 50 80 46 L80 60 L0 60 Z" fill="#29B6F6" opacity="0.7"/>
      <path d="M0 50 Q20 47 40 50 Q60 53 80 50 L80 60 L0 60 Z" fill="#FFD180"/>
      <path d="M22 50 Q20 42 18 32" stroke="#8D6E63" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M18 32 Q10 26 6 28" stroke="#66BB6A" strokeWidth="2" strokeLinecap="round"/>
      <path d="M18 32 Q14 22 18 20" stroke="#66BB6A" strokeWidth="2" strokeLinecap="round"/>
      <path d="M18 32 Q24 22 28 24" stroke="#66BB6A" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="17" cy="34" r="2" fill="#8D6E63"/>
      <line x1="50" y1="50" x2="52" y2="36" stroke="#BDBDBD" strokeWidth="1.5"/>
      <path d="M45 38 Q52 30 59 38" fill="#D42B2B" stroke="#C62828" strokeWidth="0.5"/>
      <rect x="42" y="48" width="18" height="4" rx="1" fill="#FFE45C" opacity="0.9"/>
    </svg>
  ),
  thanksgiving: (
    <svg width="80" height="60" viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="60" rx="6" fill="#FFF3E0"/>
      <ellipse cx="40" cy="36" rx="5" ry="14" fill="#E65100" opacity="0.9" transform="rotate(-30 40 36)"/>
      <ellipse cx="40" cy="36" rx="5" ry="14" fill="#EF6C00" opacity="0.85" transform="rotate(-15 40 36)"/>
      <ellipse cx="40" cy="36" rx="5" ry="14" fill="#F57F17" opacity="0.8" transform="rotate(0 40 36)"/>
      <ellipse cx="40" cy="36" rx="5" ry="14" fill="#FFA000" opacity="0.75" transform="rotate(15 40 36)"/>
      <ellipse cx="40" cy="36" rx="5" ry="14" fill="#FFB300" opacity="0.7" transform="rotate(30 40 36)"/>
      <ellipse cx="40" cy="42" rx="14" ry="11" fill="#8D6E63"/>
      <ellipse cx="40" cy="42" rx="11" ry="8.5" fill="#A1887F"/>
      <circle cx="40" cy="28" r="7" fill="#8D6E63"/>
      <circle cx="40" cy="28" r="5.5" fill="#A1887F"/>
      <circle cx="42" cy="26" r="1.5" fill="#1a1a1a"/>
      <line x1="36" y1="52" x2="34" y2="58" stroke="#8D6E63" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="44" y1="52" x2="46" y2="58" stroke="#8D6E63" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  ),
}

function isBreakPast(brk) {
  const today = new Date(); today.setHours(0,0,0,0)
  const allDates = [...(brk.dates||[]),...(brk.weekendDates||[])]
  if (!allDates.length) return false
  return new Date(allDates[allDates.length-1]+'T12:00:00') < today
}

function getBreakOffDays(breaks=[]) {
  const days = new Set()
  breaks.forEach(b => { if(b.enabled){ b.dates?.forEach(d=>days.add(d)); if(b.weekendEnabled) b.weekendDates?.forEach(d=>days.add(d)) } })
  return [...days]
}

function getMonthsBetween(startStr, endStr) {
  const months=[], end=new Date(endStr+'T12:00:00')
  const cur=new Date(new Date(startStr+'T12:00:00').getFullYear(), new Date(startStr+'T12:00:00').getMonth(), 1)
  while(cur<=end){ months.push({year:cur.getFullYear(),month:cur.getMonth()}); cur.setMonth(cur.getMonth()+1) }
  return months
}

function calcEffectiveDays(startStr, endStr, breaks, customOffDays) {
  if(!startStr||!endStr) return 105
  const start=new Date(startStr+'T12:00:00'), end=new Date(endStr+'T12:00:00')
  const total=Math.max(0,Math.round((end-start)/(1000*60*60*24)))
  const allOff=new Set([...getBreakOffDays(breaks),...customOffDays])
  let count=0; allOff.forEach(d=>{ const date=new Date(d+'T12:00:00'); if(date>=start&&date<=end) count++ })
  return Math.max(1,total-count)
}

function calcDaysRemaining(endStr) {
  if (!endStr) return null
  const today = new Date(); today.setHours(0,0,0,0)
  const end = new Date(endStr + 'T12:00:00')
  return Math.max(0, Math.ceil((end - today) / (1000 * 60 * 60 * 24)))
}

function calcOutOfPocket(dollarsPerWeek, effDays, planDiningDollars) {
  return Math.max(0, ((parseFloat(dollarsPerWeek)||0)*(effDays/7)) - planDiningDollars)
}

function suggestPlan(projSwipes, dollarsPerWeek, effDays) {
  const projDD=(parseFloat(dollarsPerWeek)||0)*(effDays/7)
  for(const plan of [...PLANS].reverse()){ if((plan.swipes===null||projSwipes<=plan.swipes)&&projDD<=plan.diningDollars) return plan }
  if(projSwipes>225) return PLANS.find(p=>p.id==='unlimited')
  if(projSwipes>180) return PLANS.find(p=>p.id==='225')
  if(projSwipes>150) return PLANS.find(p=>p.id==='180')
  if(projSwipes>100) return PLANS.find(p=>p.id==='150')
  return PLANS.find(p=>p.id==='100')
}

const st = {
  page: { minHeight:'100vh', background:'#FAF9F6', fontFamily:"'Inter',sans-serif", position:'relative', overflow:'hidden' },
  topbar: { background:'#FBF2D8', padding:'0.9rem 2rem', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:100, overflow:'visible' },
  logo: { fontFamily:"'Chicle',serif", fontSize:'1.4rem', fontWeight:700, color:'#1a1a1a' },
  container: { maxWidth:'600px', margin:'0 auto', padding:'2.5rem 1.5rem 4rem' },
  progressWrap: { marginBottom:'2.5rem' },
  eyebrow: { fontFamily:"'Bebas Neue',sans-serif", fontSize:'2.2rem', letterSpacing:'0.14em', color:'#D42B2B', display:'block', marginBottom:'8px' },
  heading: { fontFamily:"'Playfair Display',serif", fontSize:'clamp(1.7rem,4vw,2.2rem)', fontWeight:700, color:'#1a1a1a', marginBottom:'8px', lineHeight:1.15 },
  sub: { fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.1rem', letterSpacing:'0.03em', color:'#6B7280', marginBottom:'1.8rem', lineHeight:1.65 },
  card: (sel) => ({ background:sel?'#FBF2D8':'#fff', border:`2px solid ${sel?'#1a1a1a':'rgba(0,0,0,0.12)'}`, borderRadius:'10px', padding:'1.2rem', cursor:'pointer', textAlign:'left', width:'100%', boxShadow:sel?'4px 5px 0px #1a1a1a':'2px 3px 0px rgba(0,0,0,0.08)', transform:sel?'translate(-1px,-1px)':'none', transition:'all 0.12s ease' }),
  planCard: (sel) => ({ background:sel?'#FBF2D8':'#fff', border:`2px solid ${sel?'#1a1a1a':'rgba(0,0,0,0.1)'}`, borderRadius:'10px', padding:'1rem 1.2rem', cursor:'pointer', textAlign:'left', width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center', boxShadow:sel?'4px 5px 0px #1a1a1a':'2px 3px 0px rgba(0,0,0,0.07)', transform:sel?'translate(-1px,-1px)':'none', marginBottom:'10px', transition:'all 0.12s ease' }),
  chip: (sel) => ({ padding:'5px 14px', borderRadius:'99px', border:`1.5px solid ${sel?'#1a1a1a':'rgba(0,0,0,0.15)'}`, fontSize:'0.84rem', fontFamily:"'Bebas Neue',sans-serif", letterSpacing:'0.06em', cursor:'pointer', background:sel?'#FFE45C':'#fff', color:'#1a1a1a', boxShadow:sel?'2px 2px 0px #1a1a1a':'none', marginBottom:'6px', transition:'all 0.12s ease' }),
  input: { width:'100%', padding:'10px 14px', border:'2px solid rgba(0,0,0,0.12)', borderRadius:'8px', fontSize:'0.9rem', fontFamily:"'Inter',sans-serif", background:'#fff', color:'#1a1a1a', outline:'none', boxSizing:'border-box', boxShadow:'2px 3px 0px rgba(0,0,0,0.07)' },
  label: { display:'block', fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.1rem', letterSpacing:'0.1em', color:'#6B7280', marginBottom:'6px' },
  hint: { fontFamily:"'Bebas Neue',sans-serif", fontSize:'0.72rem', letterSpacing:'0.03em', color:'#9CA3AF', marginTop:'4px' },
  btnPrimary: { flex:1, padding:'0.85rem 1.5rem', background:'#D42B2B', color:'#fff', border:'2.5px solid #1a1a1a', borderRadius:'8px', fontFamily:"'Bebas Neue',sans-serif", fontSize:'0.95rem', letterSpacing:'0.07em', cursor:'pointer', boxShadow:'3px 4px 0px #1a1a1a', transition:'all 0.12s ease' },
  btnSecondary: { padding:'0.85rem 1.25rem', background:'#FBF2D8', color:'#1a1a1a', border:'2px solid rgba(0,0,0,0.18)', borderRadius:'8px', fontFamily:"'Bebas Neue',sans-serif", fontSize:'0.95rem', letterSpacing:'0.07em', cursor:'pointer', boxShadow:'2px 3px 0px rgba(0,0,0,0.08)', transition:'all 0.12s ease' },
  btnDisabled: { flex:1, padding:'0.85rem 1.5rem', background:'rgba(0,0,0,0.06)', color:'rgba(0,0,0,0.25)', border:'2px solid rgba(0,0,0,0.08)', borderRadius:'8px', fontFamily:"'Bebas Neue',sans-serif", fontSize:'0.95rem', letterSpacing:'0.07em', cursor:'not-allowed' },
  pathPill: { display:'inline-block', fontFamily:"'Bebas Neue',sans-serif", fontSize:'0.68rem', letterSpacing:'0.1em', padding:'3px 12px', borderRadius:'99px', background:'#FFE45C', border:'1.5px solid #1a1a1a', color:'#1a1a1a', marginBottom:'1rem', boxShadow:'2px 2px 0px #1a1a1a' },
  sectionLabel: { fontFamily:"'Bebas Neue',sans-serif", fontSize:'0.82rem', letterSpacing:'0.1em', color:'#6B7280', display:'block', margin:'1.4rem 0 0.7rem' },
  noticeBox: (v='cream') => ({ background:v==='red'?'#FFF0EE':v==='blue'?'#EFF6FF':'#FBF2D8', border:`2px solid ${v==='red'?'#D42B2B':v==='blue'?'#3B82F6':'#1a1a1a'}`, borderRadius:'8px', padding:'12px 16px', fontFamily:"'Bebas Neue',sans-serif", fontSize:'0.82rem', letterSpacing:'0.04em', color:v==='red'?'#D42B2B':v==='blue'?'#1D4ED8':'#1a1a1a', marginBottom:'1rem', boxShadow:`3px 3px 0px ${v==='red'?'#D42B2B':v==='blue'?'#3B82F6':'#1a1a1a'}` }),
  summaryCard: { background:'#fff', border:'2px solid rgba(0,0,0,0.09)', borderRadius:'10px', padding:'1.1rem 1.2rem', marginBottom:'10px', boxShadow:'3px 4px 0px rgba(0,0,0,0.06)' },
  summaryLabel: { fontFamily:"'Bebas Neue',sans-serif", fontSize:'0.68rem', letterSpacing:'0.12em', color:'#9CA3AF', display:'block', marginBottom:'6px' },
  badgeRed: { fontFamily:"'Bebas Neue',sans-serif", fontSize:'0.65rem', letterSpacing:'0.08em', padding:'2px 8px', borderRadius:'4px', border:'1.5px solid #1a1a1a', background:'#D42B2B', color:'#fff', display:'inline-block' },
  badgeYellow: { fontFamily:"'Bebas Neue',sans-serif", fontSize:'0.65rem', letterSpacing:'0.08em', padding:'2px 8px', borderRadius:'4px', border:'1.5px solid #1a1a1a', background:'#FFE45C', color:'#1a1a1a', display:'inline-block' },
  toggleBtn: (active) => ({ padding:'7px 16px', fontFamily:"'Bebas Neue',sans-serif", fontSize:'0.78rem', letterSpacing:'0.06em', cursor:'pointer', border:'1.5px solid rgba(0,0,0,0.15)', background:active?'#1a1a1a':'#fff', color:active?'#fff':'#9CA3AF', transition:'all 0.12s ease' }),
}

function ProgressBar({ step, total }) {
  const pathRef=useRef(null), clipPathRef=useRef(null), rafRef=useRef(null), phaseRef=useRef(0)
  const targetRef=useRef(step/total), currentRef=useRef(step/total)
  useEffect(()=>{ targetRef.current=step/total },[step,total])
  useEffect(()=>{
    const FREQ=0.035,AMP=6,H=28,MID=14,HALF_W=5
    function draw(){
      currentRef.current+=(targetRef.current-currentRef.current)*0.06
      phaseRef.current+=0.04
      const endX=currentRef.current*1000
      let d='',clipD=''
      if(endX>=2){
        const pts=[]; for(let x=0;x<=endX;x+=3) pts.push([x,MID+Math.sin(x*FREQ+phaseRef.current)*AMP])
        d=`M ${pts[0][0]} ${pts[0][1].toFixed(2)}`; for(let i=1;i<pts.length;i++) d+=` L ${pts[i][0]} ${pts[i][1].toFixed(2)}`
        clipD=`M ${(pts[0][0]/1000).toFixed(4)} ${((pts[0][1]-HALF_W)/H).toFixed(4)}`
        for(let i=1;i<pts.length;i++) clipD+=` L ${(pts[i][0]/1000).toFixed(4)} ${((pts[i][1]-HALF_W)/H).toFixed(4)}`
        for(let i=pts.length-1;i>=0;i--) clipD+=` L ${(pts[i][0]/1000).toFixed(4)} ${((pts[i][1]+HALF_W)/H).toFixed(4)}`
        clipD+=' Z'
      }
      if(pathRef.current) pathRef.current.setAttribute('d',d)
      if(clipPathRef.current) clipPathRef.current.setAttribute('d',clipD)
      rafRef.current=requestAnimationFrame(draw)
    }
    rafRef.current=requestAnimationFrame(draw)
    return ()=>cancelAnimationFrame(rafRef.current)
  },[])
  return (
    <div style={st.progressWrap}>
      <svg style={{position:'absolute',width:0,height:0,overflow:'hidden'}} aria-hidden="true">
        <defs><clipPath id="onboardingWaveClip" clipPathUnits="objectBoundingBox"><path ref={clipPathRef} d=""/></clipPath></defs>
      </svg>
      <div style={{position:'relative',height:'28px'}}>
        <div style={{position:'absolute',top:'50%',left:0,right:0,height:'2px',background:'rgba(0,0,0,0.1)',transform:'translateY(-50%)'}}/>
        <svg viewBox="0 0 1000 28" preserveAspectRatio="none" style={{position:'absolute',inset:0,width:'100%',height:'100%',display:'block'}}>
          <path ref={pathRef} d="" fill="none" stroke="#D42B2B" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"/>
        </svg>
        <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',fontFamily:"'Bebas Neue',sans-serif",fontSize:'1.5rem',letterSpacing:'0.12em',color:'#1a1a1a',pointerEvents:'none',userSelect:'none'}}> Step {step} / {total}</div>
        <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',fontFamily:"'Bebas Neue',sans-serif",fontSize:'1.5rem',letterSpacing:'0.12em',color:'#fff',clipPath:'url(#onboardingWaveClip)',pointerEvents:'none',userSelect:'none'}}> Step {step} / {total}</div>
      </div>
    </div>
  )
}

function NavButtons({ onBack, onNext, nextLabel='CONTINUE', nextDisabled=false, step }) {
  return (
    <div style={{display:'flex',gap:'10px',marginTop:'2rem'}}>
      {step>1 && <button onClick={onBack} style={st.btnSecondary}>BACK</button>}
      <button onClick={onNext} disabled={nextDisabled} style={nextDisabled?st.btnDisabled:st.btnPrimary}>{nextLabel}</button>
    </div>
  )
}

function Chip({ label, selected, onToggle }) {
  return <button type="button" onClick={onToggle} style={st.chip(selected)}>{label}</button>
}

function PlanCard({ plan, selected, onClick, recBadge }) {
  return (
    <button onClick={onClick} style={st.planCard(selected)}>
      <div style={{flex:1}}>
        <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'4px'}}>
          <span style={{fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:'0.95rem',color:'#1a1a1a'}}>{plan.name}</span>
          {recBadge && <span style={st.badgeYellow}>RECOMMENDED</span>}
          {!recBadge && plan.tag && <span style={st.badgeRed}>{plan.tag}</span>}
        </div>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'0.84rem',letterSpacing:'0.04em',color:'#9CA3AF',display:'flex',gap:'14px',flexWrap:'wrap'}}>
          <span>{plan.swipes===null?'Unlimited swipes':`${plan.swipes} swipes`}</span>
          <span>${plan.diningDollars} dining dollars</span>
        </div>
      </div>
      <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'1rem',color:'#1a1a1a',flexShrink:0,marginLeft:'12px'}}>${plan.price.toLocaleString()}</span>
    </button>
  )
}

function BreakCard({ brk, onToggleEnabled, onToggleWeekend }) {
  const first=brk.dates[0], last=brk.dates[brk.dates.length-1]
  const dateRange=`${new Date(first+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'})} – ${new Date(last+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'})}`
  const isPast=isBreakPast(brk)
  return (
    <div style={{border:`2px solid ${brk.enabled?'#1a1a1a':'rgba(0,0,0,0.1)'}`,borderRadius:'12px',overflow:'hidden',background:isPast?'#FAFAFA':'#fff',boxShadow:brk.enabled?'4px 5px 0px #1a1a1a':'2px 3px 0px rgba(0,0,0,0.07)',transform:brk.enabled?'translate(-1px,-1px)':'none',transition:'all 0.15s ease',marginBottom:'12px',opacity:isPast?0.5:1}}>
      <div style={{display:'flex',alignItems:'center',gap:'14px',padding:'14px 16px',cursor:isPast?'not-allowed':'pointer',background:brk.enabled?'#FBF2D8':isPast?'#FAFAFA':'#fff'}} onClick={isPast?undefined:onToggleEnabled}>
        <div style={{flexShrink:0,opacity:brk.enabled?1:0.4}}>{BREAK_ART[brk.id]}</div>
        <div style={{flex:1}}>
          <p style={{fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:'1rem',color:'#1a1a1a',margin:'0 0 3px'}}>{brk.label}</p>
          <p style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'0.72rem',letterSpacing:'0.05em',color:'#9CA3AF',margin:0}}>{dateRange}{isPast?' · ALREADY PASSED':''}</p>
        </div>
        {!isPast && (
          <div style={{flexShrink:0,display:'flex',alignItems:'center',gap:'8px'}}>
            <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'0.72rem',letterSpacing:'0.07em',color:brk.enabled?'#D42B2B':'#9CA3AF'}}>{brk.enabled?'ENABLED':'ENABLE'}</span>
            <div style={{width:'36px',height:'20px',borderRadius:'99px',background:brk.enabled?'#D42B2B':'#E5E7EB',border:'1.5px solid rgba(0,0,0,0.15)',position:'relative',transition:'background 0.2s'}}>
              <div style={{width:'14px',height:'14px',borderRadius:'50%',background:'#fff',position:'absolute',top:'2px',left:brk.enabled?'18px':'2px',transition:'left 0.2s',boxShadow:'0 1px 3px rgba(0,0,0,0.2)'}}/>
            </div>
          </div>
        )}
      </div>
      {brk.enabled && !isPast && (
        <div style={{borderTop:'1px solid rgba(0,0,0,0.08)',padding:'10px 16px',background:'#FAFAFA',display:'flex',alignItems:'center',gap:'10px',cursor:'pointer'}} onClick={onToggleWeekend}>
          <input type="checkbox" checked={brk.weekendEnabled} onChange={onToggleWeekend} onClick={e=>e.stopPropagation()} style={{width:'15px',height:'15px',accentColor:'#D42B2B',cursor:'pointer',flexShrink:0}}/>
          <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'0.72rem',letterSpacing:'0.06em',color:'#1a1a1a'}}>{brk.weekendLabel}</span>
        </div>
      )}
    </div>
  )
}

function MonthCard({ year, month, semesterStart, semesterEnd, breakOffDays, customOffDays, onToggleDay }) {
  const today=new Date(); today.setHours(0,0,0,0)
  const firstDay=new Date(year,month,1).getDay(), daysInMonth=new Date(year,month+1,0).getDate()
  const semStart=new Date(semesterStart+'T12:00:00'), semEnd=new Date(semesterEnd+'T12:00:00')
  const breakSet=new Set(breakOffDays), customSet=new Set(customOffDays)
  const cells=[]
  for(let i=0;i<firstDay;i++) cells.push(null)
  for(let d=1;d<=daysInMonth;d++) cells.push(d)
  while(cells.length%7!==0) cells.push(null)
  return (
    <div style={{background:'#fff',border:'2px solid rgba(0,0,0,0.09)',borderRadius:'10px',padding:'12px',boxShadow:'2px 3px 0px rgba(0,0,0,0.06)'}}>
      <p style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'0.82rem',letterSpacing:'0.1em',color:'#1a1a1a',margin:'0 0 8px',textAlign:'center'}}>{MONTH_NAMES[month].toUpperCase()} {year}</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'2px'}}>
        {['S','M','T','W','T','F','S'].map((d,i)=><div key={i} style={{textAlign:'center',fontFamily:"'Bebas Neue',sans-serif",fontSize:'0.6rem',letterSpacing:'0.06em',color:'#C0C0C0',padding:'2px 0 4px'}}>{d}</div>)}
        {cells.map((day,i)=>{
          if(!day) return <div key={i}/>
          const dateStr=`${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
          const date=new Date(year,month,day,12)
          const inSem=date>=semStart&&date<=semEnd
          const isBreak=breakSet.has(dateStr), isCustom=customSet.has(dateStr)
          const isWeekend=date.getDay()===0||date.getDay()===6, isPast=date<today
          let bg='#F3F4F6',color='#D1D5DB',border='none',cursor='default',fontWeight=400,boxShadow='none'
          if(inSem&&!isBreak&&!isCustom&&!isPast){ bg=isWeekend?'#F9F9F9':'#fff'; color=isWeekend?'#9CA3AF':'#1a1a1a'; cursor='pointer'; border='1px solid rgba(0,0,0,0.08)' }
          else if(inSem&&!isBreak&&!isCustom&&isPast){ bg='#F3F4F6'; color='#D1D5DB'; cursor='not-allowed' }
          if(isBreak){ bg='#D42B2B'; color='#fff'; border='1.5px solid #a82020'; fontWeight=600; boxShadow='1px 1px 0 rgba(0,0,0,0.2)' }
          if(isCustom){ bg='#FFE45C'; color='#1a1a1a'; border='1.5px solid #c8a800'; fontWeight=600; cursor=isPast?'not-allowed':'pointer'; boxShadow='1px 1px 0 rgba(0,0,0,0.12)' }
          return <button key={i} type="button" onClick={()=>inSem&&!isBreak&&!isPast&&onToggleDay(dateStr)} disabled={!inSem||isBreak||isPast} style={{background:bg,color,border,cursor,fontWeight,boxShadow,borderRadius:'4px',fontFamily:"'Inter',sans-serif",fontSize:'0.7rem',padding:'4px 2px',textAlign:'center',width:'100%',transition:'all 0.1s ease'}}>{day}</button>
        })}
      </div>
    </div>
  )
}

function CalendarView({ semesterStart, semesterEnd, breaks, customOffDays, onToggleDay, onClearCustom }) {
  const daysLeft = calcDaysRemaining(semesterEnd)
  if(!semesterStart||!semesterEnd) return null
  const breakOffDays=getBreakOffDays(breaks), months=getMonthsBetween(semesterStart,semesterEnd)
  const effDays=calcEffectiveDays(semesterStart,semesterEnd,breaks,customOffDays)
  const totalBreakDays=breakOffDays.filter(d=>{ const date=new Date(d+'T12:00:00'); return date>=new Date(semesterStart+'T12:00:00')&&date<=new Date(semesterEnd+'T12:00:00') }).length
  return (
    <div>
      <div style={{display:'flex',gap:'14px',marginBottom:'10px',flexWrap:'wrap',alignItems:'center'}}>
        {[{bg:'#D42B2B',border:'1.5px solid #a82020',label:'Break'},{bg:'#FFE45C',border:'1.5px solid #c8a800',label:'Days away from campus'},{bg:'#fff',border:'1px solid rgba(0,0,0,0.08)',label:'On campus'},{bg:'#F3F4F6',border:'none',label:'Past / outside semester'}].map(({bg,border,label})=>(
          <div key={label} style={{display:'flex',alignItems:'center',gap:'6px'}}>
            <div style={{width:'14px',height:'14px',background:bg,border,borderRadius:'3px',flexShrink:0}}/>
            <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'0.66rem',letterSpacing:'0.05em',color:'#6B7280'}}>{label}</span>
          </div>
        ))}
      </div>
      <p style={{...st.hint,marginBottom:'12px'}}>
        Click any upcoming on-campus day to mark it as a day away from campus.
        {customOffDays.length>0 && <button type="button" onClick={onClearCustom} style={{marginLeft:'8px',fontFamily:"'Bebas Neue',sans-serif",fontSize:'0.68rem',letterSpacing:'0.05em',color:'#D42B2B',background:'none',border:'none',cursor:'pointer',textDecoration:'underline'}}>CLEAR AWAY DAYS</button>}
      </p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:'12px',marginBottom:'14px'}}>
        {months.map(({year,month})=><MonthCard key={`${year}-${month}`} year={year} month={month} semesterStart={semesterStart} semesterEnd={semesterEnd} breakOffDays={breakOffDays} customOffDays={customOffDays} onToggleDay={onToggleDay}/>)}
      </div>
      <div style={{display:'flex',borderRadius:'8px',overflow:'hidden',border:'2px solid #1a1a1a',boxShadow:'3px 3px 0 #1a1a1a'}}>
        {[{label:'BREAK DAYS',value:totalBreakDays,bg:'#D42B2B',color:'#fff'},{label:'AWAY DAYS',value:customOffDays.length,bg:'#FFE45C',color:'#1a1a1a'},{label:'DAYS REMAINING',value:daysLeft,bg:'#FBF2D8',color:'#1a1a1a'}].map(({label,value,bg,color},i)=>(
          <div key={label} style={{flex:1,background:bg,padding:'10px 8px',textAlign:'center',borderRight:i<2?'2px solid #1a1a1a':'none'}}>
            <p style={{fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:'1.3rem',color,margin:'0 0 2px'}}>{value}</p>
            <p style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'0.6rem',letterSpacing:'0.08em',color,opacity:0.85,margin:0}}>{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function SemesterSelector({ value, onChange }) {
  return (
    <div>
      <span style={st.sectionLabel}>SELECT YOUR SEMESTER</span>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'1.5rem'}}>
        {Object.entries(SEMESTERS).map(([key,sem])=>(
          <button key={key} type="button" onClick={()=>onChange(key)} style={{...st.card(value===key),padding:'1rem',textAlign:'center'}}>
            <div style={{color:value===key?'#D42B2B':'#CBCBCB',marginBottom:'10px',display:'flex',justifyContent:'center'}}>
              {key==='spring2026'?(
                <svg width="30" height="30" viewBox="0 0 30 30" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="15" cy="15" r="5.5"/><line x1="15" y1="2" x2="15" y2="6"/><line x1="15" y1="24" x2="15" y2="28"/><line x1="2" y1="15" x2="6" y2="15"/><line x1="24" y1="15" x2="28" y2="15"/>
                </svg>
              ):(
                <svg width="30" height="30" viewBox="0 0 30 30" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 4 C22 4 24 11 21 16 C18.5 20 14 21 10 19.5 C6 18 5 14.5 6.5 10.5 C8 7 13 4.5 17.5 5.5 C20 6 22 4 22 4Z"/>
                  <path d="M21 5 L9 28"/>
                </svg>
              )}
            </div>
            <p style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'1.1rem',letterSpacing:'0.08em',color:'#D42B2B',margin:'0 0 2px'}}>{sem.short}</p>
            <p style={{fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:'0.85rem',color:'#1a1a1a',margin:'0 0 2px'}}>{sem.label}</p>
            <p style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'0.63rem',letterSpacing:'0.04em',color:'#9CA3AF',margin:0}}>
              {new Date(sem.start+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'})} – {new Date(sem.end+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'})}
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}

function SemesterSection({ answers, set, semesterCalendarReady, toggleOffDay }) {
  const toggleBreakEnabled=(id)=>set('semesterBreaks',answers.semesterBreaks.map(b=>b.id===id?{...b,enabled:!b.enabled,weekendEnabled:false}:b))
  const toggleBreakWeekend=(id)=>set('semesterBreaks',answers.semesterBreaks.map(b=>b.id===id?{...b,weekendEnabled:!b.weekendEnabled}:b))
  return (
    <div>
      <SemesterSelector value={answers.semesterPreset} onChange={(key)=>{
        const sem=SEMESTERS[key]; set('semesterPreset',key); set('semesterStart',sem.start); set('semesterEnd',sem.end)
        set('semesterBreaks',sem.breaks.map(b=>({...b,enabled:false,weekendEnabled:false}))); set('customOffDays',[])
      }}/>
      {answers.semesterBreaks.length>0 && (
        <div>
          <span style={st.sectionLabel}>BREAKS — ENABLE THE ONES YOU'LL BE AWAY FOR</span>
          {answers.semesterBreaks.map(brk=>(
            <BreakCard key={brk.id} brk={brk} onToggleEnabled={()=>!isBreakPast(brk)&&toggleBreakEnabled(brk.id)} onToggleWeekend={(e)=>{e?.stopPropagation?.();toggleBreakWeekend(brk.id)}}/>
          ))}
        </div>
      )}
      {semesterCalendarReady && (
        <div>
          <span style={st.sectionLabel}>YOUR SEMESTER — CLICK UPCOMING DAYS TO MARK AS AWAY</span>
          <CalendarView semesterStart={answers.semesterStart} semesterEnd={answers.semesterEnd} breaks={answers.semesterBreaks} customOffDays={answers.customOffDays} onToggleDay={toggleOffDay} onClearCustom={()=>set('customOffDays',[])}/>
        </div>
      )}
    </div>
  )
}

function PreferencesStep({ answers, toggleArr, set, onBack, onNext, step, isNewPlan }) {
  return (
    <div>
      {isNewPlan && <span style={st.pathPill}>FINDING YOU THE RIGHT PLAN</span>}
      <span style={{display:'block',...st.eyebrow}}>DINING DOLLAR PREFERENCES</span>
      <h2 style={st.heading}>What are your food preferences?</h2>
      <p style={st.sub}>We'll use these to recommend dining dollar vendors near campus that match your taste, needs, and lifestyle.</p>
      <div style={{display:'flex',alignItems:'center',gap:'6px',margin:'1.4rem 0 0.7rem'}}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 21 C11.4 21 5.8 16.8 6 11 C6.2 5.5 10.2 3.8 12 4 C13.8 3.8 18 5.5 18 11 C18 16.8 12.6 21 12 21Z" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        <span style={{...st.sectionLabel,margin:0,display:'inline'}}>DIETARY RESTRICTIONS & GOALS</span>
      </div>
      <div style={{display:'flex',flexWrap:'wrap',gap:'8px',marginBottom:'0.5rem'}}>{DIET_OPTIONS.map(opt=><Chip key={opt} label={opt} selected={answers.diet.includes(opt)} onToggle={()=>toggleArr('diet',opt)}/>)}</div>
      <div style={{display:'flex',alignItems:'center',gap:'6px',margin:'1.4rem 0 0.7rem'}}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 3.5 L21 20.5 L3 20.5 Z" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><line x1="12" y1="10" x2="12" y2="15" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"/></svg>
        <span style={{...st.sectionLabel,margin:0,display:'inline'}}>ALLERGENS TO AVOID</span>
      </div>
      <div style={{display:'flex',flexWrap:'wrap',gap:'8px',marginBottom:'0.5rem'}}>{ALLERGEN_OPTIONS.map(opt=><Chip key={opt} label={opt} selected={answers.allergens.includes(opt)} onToggle={()=>toggleArr('allergens',opt)}/>)}</div>
      <div style={{display:'flex',alignItems:'center',gap:'6px',margin:'1.4rem 0 0.7rem'}}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.5" stroke="#9CA3AF" strokeWidth="1.5"/><path d="M3.5 12 L20.5 12" stroke="#9CA3AF" strokeWidth="1" strokeLinecap="round"/></svg>
        <span style={{...st.sectionLabel,margin:0,display:'inline'}}>CUISINE PREFERENCES</span>
      </div>
      <p style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'0.72rem',letterSpacing:'0.03em',color:'#9CA3AF',margin:'-4px 0 8px'}}>Based on vendors near Northeastern</p>
      <div style={{display:'flex',flexWrap:'wrap',gap:'8px',marginBottom:'0.5rem'}}>{CUISINE_OPTIONS.map(opt=><Chip key={opt} label={opt} selected={answers.cuisines.includes(opt)} onToggle={()=>toggleArr('cuisines',opt)}/>)}</div>
      <div style={{display:'flex',alignItems:'center',gap:'6px',margin:'1.4rem 0 0.7rem'}}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4.5 10.5 C4.5 16.5 7.8 20.5 12 20.5 C16.2 20.5 19.5 16.5 19.5 10.5 Z" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><line x1="3" y1="10.5" x2="21" y2="10.5" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"/></svg>
        <span style={{...st.sectionLabel,margin:0,display:'inline'}}>WHAT DO YOU USUALLY EAT?</span>
      </div>
      <div style={{display:'flex',flexWrap:'wrap',gap:'8px',marginBottom:'0.5rem'}}>{FOOD_TYPE_OPTIONS.map(opt=><Chip key={opt} label={opt} selected={(answers.foodTypes||[]).includes(opt)} onToggle={()=>toggleArr('foodTypes',opt)}/>)}</div>
      <div style={{display:'flex',alignItems:'center',gap:'6px',margin:'1.4rem 0 0.7rem'}}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="6" width="18" height="13" rx="2" stroke="#9CA3AF" strokeWidth="1.5"/><line x1="3" y1="11" x2="21" y2="11" stroke="#9CA3AF" strokeWidth="1.5"/></svg>
        <span style={{...st.sectionLabel,margin:0,display:'inline'}}>DINING STYLE</span>
      </div>
      <div style={{display:'flex',flexWrap:'wrap',gap:'8px',marginBottom:'0.5rem'}}>{DINING_STYLE_OPTIONS.map(opt=><Chip key={opt} label={opt} selected={(answers.diningStyle||[]).includes(opt)} onToggle={()=>toggleArr('diningStyle',opt)}/>)}</div>
      <div style={{display:'flex',alignItems:'center',gap:'6px',margin:'1.4rem 0 0.7rem'}}>
        <span style={{...st.sectionLabel,margin:0,display:'inline'}}>PORTION SIZE</span>
      </div>
      <div style={{display:'flex'}}>
        {PORTION_OPTIONS.map((opt,i)=>(
          <button key={opt} type="button" onClick={()=>set('portionSize',opt)} style={{...st.toggleBtn(answers.portionSize===opt),borderRadius:i===0?'8px 0 0 8px':i===PORTION_OPTIONS.length-1?'0 8px 8px 0':'0',borderRight:i<PORTION_OPTIONS.length-1?'none':'1.5px solid rgba(0,0,0,0.15)'}}>{opt}</button>
        ))}
      </div>
      <NavButtons step={step} onBack={onBack} onNext={onNext}/>
    </div>
  )
}

function HabitsStep({ answers, set, onBack, onNext, step }) {
  return (
    <div>
      <span style={{display:'block',...st.eyebrow}}>EATING HABITS</span>
      <h2 style={st.heading}>How do you plan to use your dining plan?</h2>
      <p style={st.sub}>Give us your best estimate — we'll use this to recommend the right plan.</p>
      <div style={{marginBottom:'1.4rem'}}>
        <label style={st.label}>EXPECTED SWIPES PER WEEK</label>
        <input type="text" inputMode="numeric" placeholder="e.g. 10" value={answers.swipesAmt}
          onChange={e=>{ const val=e.target.value; if(val===''||/^\d+$/.test(val)){ if(val!==''&&parseInt(val)>50){ set('swipesAmt','50'); return } set('swipesAmt',val) } }}
          style={st.input}/>
        <p style={st.hint}>Includes dining halls, Outtakes, and Market @ 60.</p>
      </div>
      <div>
        <label style={st.label}>DINING DOLLARS PER WEEK</label>
        <div style={{position:'relative'}}>
          <span style={{position:'absolute',left:'12px',top:'50%',transform:'translateY(-50%)',color:'#9CA3AF',fontSize:'0.9rem'}}>$</span>
          <input type="text" inputMode="decimal" placeholder="e.g. 35" value={answers.dollarsPerWeek}
            onChange={e=>{ const val=e.target.value; if(val===''||/^\d*\.?\d*$/.test(val)){ const parts=val.split('.'); if(parts[1]&&parts[1].length>2) return; if(val!==''&&parseFloat(val)>100){ set('dollarsPerWeek','100'); return } set('dollarsPerWeek',val) } }}
            style={{...st.input,paddingLeft:'28px'}}/>
        </div>
        <p style={st.hint}>Money you plan to spend at dining-plan restaurants per week.</p>
      </div>
      <NavButtons step={step} onBack={onBack} onNext={onNext} nextLabel="CONTINUE"/>
    </div>
  )
}

export default function Onboarding() {
  const navigate = useNavigate()

  // Always start with yes/no question — onPlan starts as null
  const [step, setStep] = useState(1)
  const [answers, setAnswers] = useState({
    onPlan: null, planId: null,
    swipesLeft: '', diningDollarsLeft: '',
    semesterPreset: null, semesterStart: '', semesterEnd: '2026-04-26',
    semesterBreaks: [], customOffDays: [],
    diet: [], cuisines: [], allergens: [], diningStyle: [], foodTypes: [],
    portionSize: '',
    swipesAmt: '', swipesPeriod: 'week', dollarsPerWeek: '',
  })

  const set = (key, val) => setAnswers(a => ({ ...a, [key]: val }))
  const toggleArr = (key, val) => setAnswers(a => ({ ...a, [key]: a[key].includes(val) ? a[key].filter(x => x !== val) : [...a[key], val] }))
  const toggleOffDay = (dateStr) => setAnswers(a => ({ ...a, customOffDays: a.customOffDays.includes(dateStr) ? a.customOffDays.filter(d => d !== dateStr) : [...a.customOffDays, dateStr] }))

  // Caps derived from selected plan (yes-path); fixed caps for no-path habits
  const selectedPlanForCap = PLANS.find(p => p.id === answers.planId)
  const maxSwipes = selectedPlanForCap ? (selectedPlanForCap.swipes ?? 999) : 999
  const maxDD = selectedPlanForCap ? selectedPlanForCap.diningDollars : 9999

  // null = showing yes/no (no progress bar), true = yes path (4 steps), false = no path (5 steps)
  const totalSteps = answers.onPlan === null ? 0 : answers.onPlan ? 4 : 5
  const next = () => setStep(s => Math.min(s + 1, totalSteps))
  const back = () => setStep(s => Math.max(s - 1, 1))

  const semesterCalendarReady = !!(answers.semesterPreset && answers.semesterStart && answers.semesterEnd)
  const effDays = calcEffectiveDays(answers.semesterStart, answers.semesterEnd, answers.semesterBreaks, answers.customOffDays)
  const daysRemaining = calcDaysRemaining(answers.semesterEnd)
  const projSwipes = Math.round((parseInt(answers.swipesAmt)||0) * (effDays/7))
  const selectedPlan = PLANS.find(p => p.id === answers.planId)

  const finish = async () => {
    const planData = selectedPlan || (answers.onPlan ? {
      id: 'custom', name: 'My Dining Plan', price: 0, guestPasses: 10,
      swipes: answers.swipesLeft ? parseInt(answers.swipesLeft) : null,
      diningDollars: parseFloat(answers.diningDollarsLeft) || 0,
      tag: null,
    } : null)

    const swipesStart = answers.onPlan
      ? (selectedPlan?.swipes ?? (answers.swipesLeft ? parseInt(answers.swipesLeft) : null))
      : (planData?.swipes ?? null)
    const swipesCurrent = answers.onPlan
      ? (answers.swipesLeft ? parseInt(answers.swipesLeft) : swipesStart)
      : swipesStart
    const ddStart = answers.onPlan
      ? (selectedPlan?.diningDollars ?? parseFloat(answers.diningDollarsLeft) ?? null)
      : (planData?.diningDollars ?? null)
    const ddCurrent = answers.onPlan
      ? (parseFloat(answers.diningDollarsLeft) || ddStart)
      : ddStart

    const derivedDollarsPerWeek = answers.dollarsPerWeek
      ? Math.round(parseFloat(answers.dollarsPerWeek) * 100) / 100
      : ddStart && effDays > 0 ? Math.round((ddStart / (effDays / 7)) * 100) / 100 : null

    const allOffDays = [...new Set([...getBreakOffDays(answers.semesterBreaks || []), ...(answers.customOffDays || [])])]

    await updateMealPlan({
      planName:              planData?.name ?? null,
      swipesStart,
      diningDollarsStart:    ddStart,
      startDate:             answers.semesterStart || null,
      endDate:               answers.semesterEnd || null,
      swipesCurrent,
      diningDollarsCurrent:  ddCurrent,
      dollarsPerWeek:        derivedDollarsPerWeek,
      offdays:               allOffDays.length ? allOffDays : null,
      dietaryPreferences:    answers.cuisines.length ? answers.cuisines : null,
      dietaryRestrictions:   answers.diet.length ? answers.diet : null,
    })

    await loadAndStoreUserData()

    // Write plan values directly to localStorage as a guaranteed fallback
    // (loadAndStoreUserData may return stale data if the DB write is delayed)
    if (planData?.name)              localStorage.setItem('oasis_plan_name',                 planData.name)
    if (swipesStart != null)         localStorage.setItem('oasis_swipes_start',              swipesStart)
    if (swipesCurrent != null)       localStorage.setItem('oasis_swipes_current',            swipesCurrent)
    if (ddStart != null)             localStorage.setItem('oasis_dining_dollars_start',      ddStart)
    if (ddCurrent != null)           localStorage.setItem('oasis_dining_dollars_current',    ddCurrent)
    if (answers.semesterStart)       localStorage.setItem('oasis_start_date',                answers.semesterStart)
    if (answers.semesterEnd)         localStorage.setItem('oasis_end_date',                  answers.semesterEnd)
    if (allOffDays.length)           localStorage.setItem('oasis_offdays',                   JSON.stringify(allOffDays))

    localStorage.setItem('nomnom_profile', JSON.stringify({
      allergens:    answers.allergens,
      diningStyle:  answers.diningStyle,
      foodTypes:    answers.foodTypes,
      spiceLevel:   answers.spiceLevel,
      portionSize:  answers.portionSize,
      createdAt:    new Date().toISOString(),
    }))
    navigate('/dashboard')
  }

  return (
    <div style={st.page}>
      <div style={{position:'fixed',inset:0,zIndex:0,pointerEvents:'none',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(0,0,0,0.035) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.035) 1px,transparent 1px)',backgroundSize:'28px 28px'}}/>
        <div style={{position:'absolute',left:0,top:0,bottom:0,width:'4px',background:'#D42B2B'}}/>
      </div>

      <div style={{...st.topbar,position:'sticky',zIndex:100}}>
        <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
          <span style={{...st.logo,cursor:'pointer'}} onClick={()=>navigate('/')}>SwipeWise</span>
        </div>
        <div style={{position:'absolute',left:0,right:0,bottom:-20,height:20,zIndex:999,pointerEvents:'none'}}>
          <svg viewBox="0 0 1200 20" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'100%',display:'block'}}>
            <path d="M0,0 C200,18 400,18 600,10 C800,2 1000,2 1200,10 L1200,0 Z" fill="#FBF2D8"/>
          </svg>
        </div>
      </div>

      <div style={{...st.container,position:'relative',zIndex:1}}>

        {/* Only show progress bar once user has chosen a path */}
        {answers.onPlan !== null && <ProgressBar step={step} total={totalSteps}/>}

        {/* ── Yes/No question (shown when navigating directly with no URL param) ── */}
        {answers.onPlan === null && (
          <div>
            <span style={st.eyebrow}>LET'S GET STARTED</span>
            <h2 style={st.heading}>Are you currently on a dining plan?</h2>
            <p style={st.sub}>Tell us where you're at so we can set up the right experience for you.</p>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px'}}>
              {[
                { val: true,  title: 'Yes, I am',  sub: "I'm currently enrolled in a plan this semester and want to track my balance and usage.", icon: <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="16" cy="16" r="12"/><polyline points="10,16 14,20 22,12"/></svg> },
                { val: false, title: 'Not yet',    sub: "I'm choosing a plan for an upcoming semester and want help finding the right one.", icon: <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="14" cy="14" r="8"/><line x1="20" y1="20" x2="27" y2="27"/></svg> },
              ].map(({ val, title, sub, icon }) => {
                const sel = answers.onPlan === val
                return (
                  <button key={String(val)} onClick={() => { set('onPlan', val); setStep(1) }} style={st.card(sel)}>
                    <div style={{color:sel?'#D42B2B':'#CBCBCB',marginBottom:'12px',transition:'color 0.15s'}}>{icon}</div>
                    <p style={{fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:'1rem',color:'#1a1a1a',margin:'0 0 6px'}}>{title}</p>
                    <p style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'0.78rem',letterSpacing:'0.03em',color:'#6B7280',margin:0,lineHeight:1.55}}>{sub}</p>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ── "Yes I have a plan" path ── */}

        {answers.onPlan === true && step === 1 && (
          <div>
            <span style={st.eyebrow}>YOUR CURRENT BALANCES</span>
            <h2 style={st.heading}>How much do you have left?</h2>
            <p style={st.sub}>Select your dining plan first so we can set the right limits, then enter your remaining balances.</p>
            <div style={{display:'flex',flexDirection:'column',gap:'1.4rem'}}>
              <div>
                <label style={st.label}>YOUR DINING PLAN</label>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
                  {PLANS.map(plan=>(
                    <button key={plan.id} type="button" onClick={()=>{ set('planId', plan.id); set('swipesLeft', plan.swipes === null ? '999' : ''); set('diningDollarsLeft','') }} style={{...st.card(answers.planId===plan.id),padding:'10px 12px'}}>
                      <p style={{fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:'0.88rem',color:'#1a1a1a',margin:'0 0 3px'}}>{plan.name}</p>
                      <p style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'0.65rem',letterSpacing:'0.05em',color:'#9CA3AF',margin:0}}>
                        {plan.swipes===null?'UNLIMITED':plan.swipes+' SWIPES'} · ${plan.diningDollars} DD
                      </p>
                    </button>
                  ))}
                </div>
              </div>
              {answers.planId && (
                <>
                  <div>
                    <label style={st.label}>SWIPES REMAINING</label>
                    {selectedPlanForCap?.swipes === null ? (
                      <div style={{...st.input, background:'#F3F4F6', color:'#9CA3AF', display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'not-allowed'}}>
                        <span>Unlimited</span>
                        <span style={{fontFamily:"'Bebas Neue',sans-serif", fontSize:'0.7rem', letterSpacing:'0.06em'}}>UNLIMITED PLAN</span>
                      </div>
                    ) : (
                      <input type="text" inputMode="numeric"
                        placeholder="e.g. 80"
                        value={answers.swipesLeft}
                        onChange={e=>{
                          const val=e.target.value
                          if(val===''||/^\d+$/.test(val)){
                            if(val!==''&&parseInt(val)>maxSwipes){ set('swipesLeft',String(maxSwipes)); return }
                            set('swipesLeft',val)
                          }
                        }}
                        style={st.input}/>
                    )}
                    <p style={st.hint}>Check the GET app for your current swipe count.</p>
                  </div>
                  <div>
                    <label style={st.label}>DINING DOLLARS REMAINING</label>
                    <div style={{position:'relative'}}>
                      <span style={{position:'absolute',left:'12px',top:'50%',transform:'translateY(-50%)',color:'#9CA3AF',fontSize:'0.9rem'}}>$</span>
                      <input type="text" inputMode="decimal"
                        placeholder={`Max $${maxDD}`}
                        value={answers.diningDollarsLeft}
                        onChange={e=>{
                          const val=e.target.value
                          if(val===''||/^\d*\.?\d*$/.test(val)){
                            const parts=val.split('.'); if(parts[1]&&parts[1].length>2) return
                            if(val!==''&&parseFloat(val)>maxDD){ set('diningDollarsLeft',String(maxDD)); return }
                            set('diningDollarsLeft',val)
                          }
                        }}
                        style={{...st.input,paddingLeft:'28px'}}/>
                    </div>
                    <p style={st.hint}>Check the GET app or Dining portal for your current balance.</p>
                  </div>
                </>
              )}
            </div>
            <NavButtons step={step} onBack={back} onNext={next} nextDisabled={!answers.planId || !answers.diningDollarsLeft}/>
          </div>
        )}

        {answers.onPlan === true && step === 2 && (
          <div>
            <span style={st.eyebrow}>SEMESTER</span>
            <h2 style={st.heading}>When is your semester?</h2>
            <p style={st.sub}>Select your semester and mark any breaks or days away so we can build accurate projections.</p>
            <SemesterSection answers={answers} set={set} semesterCalendarReady={semesterCalendarReady} toggleOffDay={toggleOffDay}/>
            <NavButtons step={step} onBack={back} onNext={next} nextDisabled={!answers.semesterPreset}/>
          </div>
        )}

        {answers.onPlan === true && step === 3 && (
          <PreferencesStep answers={answers} toggleArr={toggleArr} set={set} onBack={back} onNext={next} step={step} isNewPlan={false}/>
        )}

        {answers.onPlan === true && step === 4 && (
          <div>
            <span style={st.eyebrow}>ALL DONE</span>
            <h2 style={st.heading}>Here's your summary</h2>
            <p style={st.sub}>Everything we'll use to set up your dashboard. Make sure it looks right!</p>

            {/* Balances */}
            <div style={st.summaryCard}>
              <span style={st.summaryLabel}>CURRENT BALANCES</span>
              <div style={{display:'flex',gap:'0',borderRadius:'8px',overflow:'hidden',border:'2px solid #1a1a1a',boxShadow:'3px 3px 0 #1a1a1a',marginTop:'8px'}}>
                {[
                  { label: answers.swipesLeft ? `${answers.swipesLeft} SWIPES` : 'UNLIMITED', sub: 'REMAINING', bg: '#1a1a1a', color: '#fff' },
                  { label: `$${answers.diningDollarsLeft||'0'}`, sub: 'DINING DOLLARS', bg: '#FFE45C', color: '#1a1a1a' },
                ].map(({ label, sub, bg, color }, i) => (
                  <div key={sub} style={{ flex:1, background:bg, padding:'12px 14px', textAlign:'center', borderRight: i===0 ? '2px solid #1a1a1a' : 'none' }}>
                    <p style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:'1.3rem', color, margin:'0 0 2px' }}>{label}</p>
                    <p style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'0.62rem', letterSpacing:'0.1em', color, opacity:0.7, margin:0 }}>{sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Semester */}
            <div style={st.summaryCard}>
              <span style={st.summaryLabel}>SEMESTER</span>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'8px'}}>
                <p style={{fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:'1rem',color:'#1a1a1a',margin:0}}>{answers.semesterPreset?SEMESTERS[answers.semesterPreset]?.label:'—'}</p>
                <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'0.78rem',letterSpacing:'0.06em',padding:'3px 10px',borderRadius:'99px',background:'#FBF2D8',border:'1.5px solid #1a1a1a',color:'#1a1a1a'}}>{daysRemaining ?? effDays} DAYS REMAINING</span>
              </div>
              {(answers.semesterBreaks.some(b=>b.enabled) || answers.customOffDays.length > 0) && (
                <div style={{marginTop:'8px',display:'flex',gap:'8px',flexWrap:'wrap'}}>
                  {answers.semesterBreaks.filter(b=>b.enabled).map(b=>(
                    <span key={b.id} style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'0.65rem',letterSpacing:'0.06em',padding:'2px 8px',borderRadius:'4px',background:'#D42B2B',color:'#fff',border:'1px solid #a82020'}}>{b.label.toUpperCase()}</span>
                  ))}
                  {answers.customOffDays.length > 0 && (
                    <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'0.65rem',letterSpacing:'0.06em',padding:'2px 8px',borderRadius:'4px',background:'#FFE45C',color:'#1a1a1a',border:'1px solid #c8a800'}}>{answers.customOffDays.length} DAYS AWAY</span>
                  )}
                </div>
              )}
            </div>

            {/* Projections */}
            {answers.diningDollarsLeft && daysRemaining > 0 && (
              <div style={st.summaryCard}>
                <span style={st.summaryLabel}>WHAT THIS MEANS FOR YOU</span>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginTop:'6px'}}>
                  {[
                    { val: `$${(parseFloat(answers.diningDollarsLeft)/daysRemaining).toFixed(2)}`, label:'DINING $ / DAY' },
                    { val: answers.swipesLeft && answers.swipesLeft !== '999' ? `${(parseInt(answers.swipesLeft)/daysRemaining).toFixed(1)}` : '∞', label:'SWIPES / DAY' },
                    { val: `$${(parseFloat(answers.diningDollarsLeft)/(daysRemaining/7)).toFixed(2)}`, label:'DINING $ / WEEK' },
                    { val: answers.swipesLeft && answers.swipesLeft !== '999' ? `${Math.round(parseInt(answers.swipesLeft)/(daysRemaining/7))}` : '∞', label:'SWIPES / WEEK' },
                  ].map(({val,label})=>(
                    <div key={label} style={{background:'#FAF9F6',border:'1.5px solid rgba(0,0,0,0.08)',borderRadius:'8px',padding:'10px 12px',textAlign:'center'}}>
                      <p style={{fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:'1.2rem',color:'#1a1a1a',margin:'0 0 2px'}}>{val}</p>
                      <p style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'0.6rem',letterSpacing:'0.1em',color:'#9CA3AF',margin:0}}>{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Preferences */}
            {([...answers.diet,...answers.allergens,...answers.cuisines,...(answers.foodTypes||[]),...(answers.diningStyle||[])].length > 0 || answers.spiceLevel || answers.portionSize) && (
              <div style={st.summaryCard}>
                <span style={st.summaryLabel}>YOUR FOOD PREFERENCES</span>
                <div style={{display:'flex',flexWrap:'wrap',gap:'6px',marginTop:'6px'}}>
                  {[...answers.diet,...answers.allergens,...answers.cuisines,...(answers.foodTypes||[]),...(answers.diningStyle||[])].map(tag=>(
                    <span key={tag} style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'0.7rem',letterSpacing:'0.06em',padding:'3px 10px',borderRadius:'99px',background:'#FFE45C',border:'1.5px solid #1a1a1a',color:'#1a1a1a'}}>{tag}</span>
                  ))}
                  {answers.portionSize && <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'0.7rem',letterSpacing:'0.06em',padding:'3px 10px',borderRadius:'99px',background:'#FBF2D8',border:'1.5px solid #1a1a1a',color:'#1a1a1a'}}>{answers.portionSize} PORTIONS</span>}
                </div>
              </div>
            )}

            <NavButtons step={step} onBack={back} onNext={finish} nextLabel="GO TO MY DASHBOARD"/>
          </div>
        )}

        {/* ── "No plan yet" path ── */}

        {answers.onPlan === false && step === 1 && (
          <PreferencesStep answers={answers} toggleArr={toggleArr} set={set} onBack={back} onNext={next} step={step} isNewPlan={true}/>
        )}

        {answers.onPlan === false && step === 2 && (
          <HabitsStep answers={answers} set={set} onBack={back} onNext={next} step={step}/>
        )}

        {answers.onPlan === false && step === 3 && (
          <div>
            <span style={st.pathPill}>FINDING YOU THE RIGHT PLAN</span>
            <span style={{display:'block',...st.eyebrow}}>SEMESTER DATES</span>
            <h2 style={st.heading}>When is your semester?</h2>
            <p style={st.sub}>Select your semester to auto-fill dates and breaks, then mark any days you'll be away.</p>
            <SemesterSection answers={answers} set={set} semesterCalendarReady={semesterCalendarReady} toggleOffDay={toggleOffDay}/>
            <NavButtons step={step} onBack={back} onNext={next} nextLabel="SEE MY RECOMMENDATION" nextDisabled={!answers.semesterPreset}/>
          </div>
        )}

        {answers.onPlan === false && step === 4 && (() => {
          const rec = suggestPlan(projSwipes, answers.dollarsPerWeek, effDays)
          const projPlanDD = Math.round((parseFloat(answers.dollarsPerWeek)||0)*(effDays/7))
          return (
            <div>
              <span style={st.pathPill}>FINDING YOU THE RIGHT PLAN</span>
              <span style={{display:'block',...st.eyebrow}}>PLAN SUGGESTION</span>
              <h2 style={st.heading}>Here's what we'd recommend</h2>
              <p style={st.sub}>Based on ~{projSwipes} projected swipes and ~${projPlanDD} in dining dollars over {effDays} days remaining.</p>
              {PLANS.map(plan => {
                const isRec=plan.id===rec?.id, isSelected=answers.planId?answers.planId===plan.id:isRec
                const ddDiff=plan.diningDollars-projPlanDD, swipeDiff=plan.swipes!==null?plan.swipes-projSwipes:null
                const oop=calcOutOfPocket(answers.dollarsPerWeek,effDays,plan.diningDollars)
                return (
                  <div key={plan.id}>
                    <PlanCard plan={plan} selected={isSelected} onClick={()=>set('planId',plan.id)} recBadge={isRec}/>
                    {isSelected && (
                      <div style={{marginTop:'-6px',marginBottom:'10px',padding:'8px 14px',background:'#FBF2D8',border:'1px solid rgba(0,0,0,0.08)',borderTop:'none',borderRadius:'0 0 8px 8px',display:'flex',flexDirection:'column',gap:'4px'}}>
                        <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'0.7rem',letterSpacing:'0.04em',color:'#6B7280'}}>
                          {swipeDiff!==null?swipeDiff>=0?`+${swipeDiff} SWIPES TO SPARE`:`${Math.abs(swipeDiff)} SWIPES SHORT`:'UNLIMITED SWIPES'}{' · '}
                          {ddDiff>=0?`+$${ddDiff} DINING DOLLARS TO SPARE`:`$${Math.abs(ddDiff)} SHORT ON DINING DOLLARS`}
                        </span>
                        {oop>0 && <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'0.7rem',letterSpacing:'0.04em',color:'#D42B2B'}}>~${Math.round(oop)} WOULD NEED TO COME OUT OF POCKET</span>}
                      </div>
                    )}
                  </div>
                )
              })}
              <NavButtons step={step} onBack={back} onNext={next} nextLabel="LOOKS GOOD"/>
            </div>
          )
        })()}

        {answers.onPlan === false && step === 5 && (
          <div>
            <span style={st.eyebrow}>ALL DONE</span>
            <h2 style={st.heading}>Here's your summary</h2>
            <p style={st.sub}>Everything we'll use to set up your dashboard. Make sure it looks right!</p>

            {/* Recommended plan */}
            {(() => {
              const pickedPlan = selectedPlan || suggestPlan(projSwipes, answers.dollarsPerWeek, effDays)
              return pickedPlan ? (
                <div style={st.summaryCard}>
                  <span style={st.summaryLabel}>YOUR PLAN</span>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:'6px',flexWrap:'wrap',gap:'8px'}}>
                    <div>
                      <p style={{fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:'1rem',color:'#1a1a1a',margin:'0 0 4px'}}>{pickedPlan.name}</p>
                      <div style={{display:'flex',gap:'12px',flexWrap:'wrap'}}>
                        <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'0.75rem',letterSpacing:'0.05em',color:'#6B7280'}}>{pickedPlan.swipes===null?'UNLIMITED SWIPES':`${pickedPlan.swipes} SWIPES`}</span>
                        <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'0.75rem',letterSpacing:'0.05em',color:'#6B7280'}}>${pickedPlan.diningDollars} DINING DOLLARS</span>
                      </div>
                    </div>
                    <span style={{fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:'1.1rem',color:'#1a1a1a'}}>${pickedPlan.price.toLocaleString()}/sem</span>
                  </div>
                </div>
              ) : null
            })()}

            {/* Semester */}
            <div style={st.summaryCard}>
              <span style={st.summaryLabel}>SEMESTER</span>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'8px'}}>
                <p style={{fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:'1rem',color:'#1a1a1a',margin:0}}>{answers.semesterPreset?SEMESTERS[answers.semesterPreset]?.label:'—'}</p>
                <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'0.78rem',letterSpacing:'0.06em',padding:'3px 10px',borderRadius:'99px',background:'#FBF2D8',border:'1.5px solid #1a1a1a',color:'#1a1a1a'}}>{daysRemaining ?? effDays} DAYS REMAINING</span>
              </div>
              {(answers.semesterBreaks.some(b=>b.enabled) || answers.customOffDays.length > 0) && (
                <div style={{marginTop:'8px',display:'flex',gap:'8px',flexWrap:'wrap'}}>
                  {answers.semesterBreaks.filter(b=>b.enabled).map(b=>(
                    <span key={b.id} style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'0.65rem',letterSpacing:'0.06em',padding:'2px 8px',borderRadius:'4px',background:'#D42B2B',color:'#fff',border:'1px solid #a82020'}}>{b.label.toUpperCase()}</span>
                  ))}
                  {answers.customOffDays.length > 0 && (
                    <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'0.65rem',letterSpacing:'0.06em',padding:'2px 8px',borderRadius:'4px',background:'#FFE45C',color:'#1a1a1a',border:'1px solid #c8a800'}}>{answers.customOffDays.length} DAYS AWAY</span>
                  )}
                </div>
              )}
            </div>

            {/* Projected usage */}
            {(answers.swipesAmt || answers.dollarsPerWeek) && (
              <div style={st.summaryCard}>
                <span style={st.summaryLabel}>YOUR PROJECTED USAGE</span>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginTop:'6px'}}>
                  {[
                    answers.swipesAmt ? { val: `~${projSwipes}`, label:'PROJECTED SWIPES' } : null,
                    answers.dollarsPerWeek ? { val: `$${answers.dollarsPerWeek}/wk`, label:'DINING $ / WEEK' } : null,
                    answers.swipesAmt ? { val: `${answers.swipesAmt}/wk`, label:'SWIPES / WEEK' } : null,
                    answers.dollarsPerWeek ? { val: `~$${Math.round((parseFloat(answers.dollarsPerWeek)||0)*(effDays/7))}`, label:'TOTAL DINING $ SEMESTER' } : null,
                  ].filter(Boolean).map(({val,label})=>(
                    <div key={label} style={{background:'#FAF9F6',border:'1.5px solid rgba(0,0,0,0.08)',borderRadius:'8px',padding:'10px 12px',textAlign:'center'}}>
                      <p style={{fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:'1.2rem',color:'#1a1a1a',margin:'0 0 2px'}}>{val}</p>
                      <p style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'0.6rem',letterSpacing:'0.1em',color:'#9CA3AF',margin:0}}>{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Preferences */}
            {([...answers.diet,...answers.allergens,...answers.cuisines,...(answers.foodTypes||[]),...(answers.diningStyle||[])].length > 0 || answers.spiceLevel || answers.portionSize) && (
              <div style={st.summaryCard}>
                <span style={st.summaryLabel}>YOUR FOOD PREFERENCES</span>
                <div style={{display:'flex',flexWrap:'wrap',gap:'6px',marginTop:'6px'}}>
                  {[...answers.diet,...answers.allergens,...answers.cuisines,...(answers.foodTypes||[]),...(answers.diningStyle||[])].map(tag=>(
                    <span key={tag} style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'0.7rem',letterSpacing:'0.06em',padding:'3px 10px',borderRadius:'99px',background:'#FFE45C',border:'1.5px solid #1a1a1a',color:'#1a1a1a'}}>{tag}</span>
                  ))}
                  {answers.portionSize && <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'0.7rem',letterSpacing:'0.06em',padding:'3px 10px',borderRadius:'99px',background:'#FBF2D8',border:'1.5px solid #1a1a1a',color:'#1a1a1a'}}>{answers.portionSize} PORTIONS</span>}
                </div>
              </div>
            )}

            <NavButtons step={step} onBack={back} onNext={finish} nextLabel="GO TO MY DASHBOARD"/>
          </div>
        )}

      </div>
    </div>
  )
}
