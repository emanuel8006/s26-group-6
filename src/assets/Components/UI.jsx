import React from 'react'
// ── Card ──────────────────────────────────────────────────────────
export function Card({ children, className = '', hover = true, glass = false }) {
  return (
    <div
      className={`
        ${glass ? 'glass' : 'bg-white'} 
        rounded-2xl p-6 border border-black/[0.04]
        shadow-card
        ${hover ? 'transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}

// ── StatBox ───────────────────────────────────────────────────────
export function StatBox({ label, value, sub, accent = false }) {
  return (
    <div className={`rounded-2xl px-6 py-5 border transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5 ${accent ? 'bg-forest text-white border-forest-deep' : 'bg-white border-black/[0.04] shadow-card'}`}>
      <p className={`text-[10px] font-bold uppercase tracking-[0.12em] mb-2 ${accent ? 'text-green-300' : 'text-gray-400'}`}>{label}</p>
      <p className={`font-display text-3xl font-bold leading-none ${accent ? 'text-white' : 'text-charcoal'}`}>{value}</p>
      {sub && <p className={`text-xs mt-1.5 ${accent ? 'text-green-200' : 'text-gray-400'}`}>{sub}</p>}
    </div>
  )
}

// ── Badge ─────────────────────────────────────────────────────────
export function Badge({ children, variant = 'green' }) {
  const styles = {
    green:  'bg-forest-muted text-forest border border-forest/10',
    orange: 'bg-ember-light text-ember border border-ember/10',
    red:    'bg-red-50 text-red-600 border border-red-100',
    dark:   'bg-forest-deep text-green-200 border border-forest/20',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide ${styles[variant]}`}>
      {children}
    </span>
  )
}

// ── ProgressBar ───────────────────────────────────────────────────
export function ProgressBar({ value, variant = 'green' }) {
  const colors = {
    green:  'bg-gradient-to-r from-forest to-forest-light',
    orange: 'bg-gradient-to-r from-ember to-amber-400',
    red:    'bg-gradient-to-r from-red-500 to-rose-400',
  }
  return (
    <div className="bg-black/[0.06] rounded-full h-2 overflow-hidden">
      <div
        className={`${colors[variant]} h-full rounded-full transition-all duration-700 ease-out relative`}
        style={{ width: `${Math.min(value, 100)}%` }}
      >
        <div className="absolute inset-0 bg-white/20 rounded-full" />
      </div>
    </div>
  )
}

// ── SectionTitle ──────────────────────────────────────────────────
export function SectionTitle({ children, sub }) {
  return (
    <div className="mb-5">
      <h3 className="font-display text-xl font-semibold text-charcoal">{children}</h3>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}

// ── Btn ───────────────────────────────────────────────────────────
export function Btn({ children, variant = 'primary', className = '', onClick, type = 'button', size = 'md' }) {
  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  }
  const styles = {
    primary: 'bg-forest text-white hover:bg-forest-light shadow-sm hover:shadow-glow-green',
    secondary: 'bg-white text-forest border-2 border-forest hover:bg-forest-muted',
    orange: 'bg-ember text-white hover:bg-ember-deep shadow-sm hover:shadow-glow-ember',
    ghost: 'bg-forest-muted text-forest hover:bg-forest hover:text-white',
    dark: 'bg-forest-deep text-white hover:bg-forest',
  }
  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 hover:-translate-y-0.5 cursor-pointer ${sizes[size]} ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

// ── Divider ───────────────────────────────────────────────────────
export function Divider() {
  return <div className="border-t border-black/[0.05] my-4" />
}

// ── AlertBox ──────────────────────────────────────────────────────
export function AlertBox({ icon, title, body, variant = 'orange' }) {
  const styles = {
    orange: 'bg-ember-light border-ember/30 text-amber-900',
    green: 'bg-forest-muted border-forest/20 text-forest-deep',
    red: 'bg-red-50 border-red-200 text-red-900',
  }
  return (
    <div className={`rounded-2xl border p-5 flex gap-3 ${styles[variant]}`}>
      <span className="text-xl flex-shrink-0 mt-0.5">{icon}</span>
      <div>
        <p className="font-semibold text-sm mb-0.5">{title}</p>
        <p className="text-sm opacity-80 leading-relaxed">{body}</p>
      </div>
    </div>
  )
}

