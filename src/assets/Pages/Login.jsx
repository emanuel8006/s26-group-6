import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const DIET_OPTIONS = ['🏠 Dining Hall', '🍽️ Restaurants', '🛒 Groceries', '🥡 Outtakes']
const CUISINE_OPTIONS = ['🌮 Mexican', '🍣 Asian', '🍕 Italian', '🥙 Mediterranean', '🍔 American', '🍛 Indian']
const RESTRICTION_OPTIONS = ['🥦 Vegetarian', '🌱 Vegan', '🌾 Gluten-Free', '🥛 Dairy-Free', '🥩 Halal', '✡️ Kosher']

function Chip({ label, selected, onToggle }) {
  return (
    <button type="button" onClick={onToggle}
      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
        selected
          ? 'bg-forest border-forest text-white shadow-sm'
          : 'border-black/[0.08] text-gray-500 hover:border-forest hover:text-forest bg-white'
      }`}
    >
      {label}
    </button>
  )
}

function ChipGroup({ options, selected, setSelected }) {
  const toggle = (opt) => setSelected(p => p.includes(opt) ? p.filter(o => o !== opt) : [...p, opt])
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => <Chip key={opt} label={opt} selected={selected.includes(opt)} onToggle={() => toggle(opt)} />)}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-bold text-charcoal/70 uppercase tracking-wider mb-1.5">{label}</label>
      {children}
    </div>
  )
}

const inputCls = "w-full px-4 py-2.5 border border-black/[0.08] rounded-xl text-sm outline-none focus:border-forest focus:ring-2 focus:ring-forest/10 transition-all bg-white placeholder:text-gray-300"

export default function Login() {
  const [tab, setTab] = useState('signin')
  const [diet, setDiet] = useState([])
  const [cuisine, setCuisine] = useState([])
  const [restrictions, setRestrictions] = useState([])
  const navigate = useNavigate()

  const handleSubmit = (e) => { e.preventDefault(); navigate('/dashboard') }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-forest-deep via-forest to-forest-light flex">
      {/* Left panel - decorative */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-mesh opacity-50" />
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-20">
            <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center text-lg backdrop-blur-sm">🥦</div>
            <span className="font-display text-2xl font-bold text-white">NomNom</span>
          </div>
          <h2 className="font-display text-4xl font-bold text-white leading-tight mb-4">
            Your dining plan,<br />
            <span className="text-green-300 italic">finally</span> under control.
          </h2>
          <p className="text-white/60 leading-relaxed text-sm max-w-xs">
            Track, plan, and optimize every swipe and dining dollar so nothing goes to waste.
          </p>
        </div>
        <div className="relative z-10 grid grid-cols-2 gap-3">
          {[['💰','$342 left'],['🔄','47 swipes'],['⭐','4.7 rating'],['📊','On pace']].map(([icon, label]) => (
            <div key={label} className="glass-dark rounded-xl px-4 py-3 flex items-center gap-2.5">
              <span>{icon}</span>
              <span className="text-white/80 text-xs font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-cream">
        <div className="w-full max-w-md animate-fade-up">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-forest rounded-lg flex items-center justify-center text-sm">🥦</div>
              <span className="font-display text-xl font-bold text-forest">NomNom</span>
            </div>
          </div>

          <h1 className="font-display text-3xl font-bold text-charcoal mb-1">
            {tab === 'signin' ? 'Welcome back.' : 'Join NomNom.'}
          </h1>
          <p className="text-gray-400 text-sm mb-8">
            {tab === 'signin' ? "Sign in to your account to continue." : "Create a free account in under 2 minutes."}
          </p>

          {/* Tabs */}
          <div className="flex p-1 bg-black/[0.05] rounded-xl mb-8">
            {['signin','signup'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                  tab === t ? 'bg-white text-charcoal shadow-sm' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {t === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {tab === 'signin' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Field label="Email"><input type="email" placeholder="you@university.edu" className={inputCls} /></Field>
              <Field label="Password"><input type="password" placeholder="••••••••" className={inputCls} /></Field>
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-gray-500 cursor-pointer">
                  <input type="checkbox" className="rounded" /> Remember me
                </label>
                <a href="#" className="text-forest hover:underline font-medium">Forgot password?</a>
              </div>
              <button type="submit" className="w-full py-3.5 bg-forest text-white font-bold rounded-xl hover:bg-forest-light transition-all hover:shadow-glow-green mt-2">
                Sign In →
              </button>
              <p className="text-center text-sm text-gray-400">
                Don't have an account?{' '}
                <button type="button" onClick={() => setTab('signup')} className="text-forest font-semibold hover:underline">Sign up free</button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Full Name"><input type="text" placeholder="Your Name" className={inputCls} /></Field>
                <Field label="Username"><input type="text" placeholder="@username" className={inputCls} /></Field>
              </div>
              <Field label="Email"><input type="email" placeholder="you@university.edu" className={inputCls} /></Field>
              <Field label="Password"><input type="password" placeholder="Create a password" className={inputCls} /></Field>
              <Field label="Dining Plan Type">
                <select className={inputCls}>
                  <option>Dining Hall (Swipe-based)</option>
                  <option>Dining Dollars (Balance-based)</option>
                  <option>Both</option>
                </select>
              </Field>
              <div>
                <p className="text-xs font-bold text-charcoal/70 uppercase tracking-wider mb-2">Diet Preferences</p>
                <ChipGroup options={DIET_OPTIONS} selected={diet} setSelected={setDiet} />
              </div>
              <div>
                <p className="text-xs font-bold text-charcoal/70 uppercase tracking-wider mb-2">Cuisine Preferences</p>
                <ChipGroup options={CUISINE_OPTIONS} selected={cuisine} setSelected={setCuisine} />
              </div>
              <div>
                <p className="text-xs font-bold text-charcoal/70 uppercase tracking-wider mb-2">Dietary Restrictions</p>
                <ChipGroup options={RESTRICTION_OPTIONS} selected={restrictions} setSelected={setRestrictions} />
              </div>
              <button type="submit" className="w-full py-3.5 bg-forest text-white font-bold rounded-xl hover:bg-forest-light transition-all hover:shadow-glow-green">
                Create Account →
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
