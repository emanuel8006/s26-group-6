import React, { useState } from 'react'
import { Card, SectionTitle, Badge, Btn } from '../components/UI'

const DAYS = [
  { name: 'Mon', status: 'used', count: '2 swipes' },
  { name: 'Tue', status: 'used', count: '1 swipe' },
  { name: 'Wed', status: 'today', count: '0 today' },
  { name: 'Thu', status: 'future' },
  { name: 'Fri', status: 'future' },
  { name: 'Sat', status: 'future' },
  { name: 'Sun', status: 'future' },
]

const HALLS = [
  { icon: '🌍', name: 'International Village', detail: 'Open until 9 PM · Short wait', stars: 4, visits: 5 },
  { icon: '🍽️', name: 'Stetson East', detail: 'Open until 8 PM · Medium wait', stars: 5, visits: 8 },
  { icon: '🥘', name: 'Stetson West', detail: 'Open until 7:30 PM · Short wait', stars: 3, visits: 3 },
  { icon: '🥡', name: 'Outtakes', detail: 'Grab & go — uses 1 swipe', stars: 4, visits: 4, isOuttake: true },
]

const inputCls = "w-full px-4 py-2.5 border border-black/[0.08] rounded-xl text-sm outline-none focus:border-forest focus:ring-2 focus:ring-forest/10 transition-all bg-white"

export default function Swipes() {
  const [log, setLog] = useState([
    { icon: '🌍', name: 'International Village', time: 'Today, 8:10 AM', type: 'Dining Hall' },
    { icon: '🍽️', name: 'Stetson East', time: 'Tue, 6:30 PM', type: 'Dining Hall' },
    { icon: '🥡', name: 'Outtakes', time: 'Mon, 12:15 PM', type: 'Outtake' },
    { icon: '🥘', name: 'Stetson West', time: 'Mon, 7:45 AM', type: 'Dining Hall' },
  ])
  const [budget, setBudget] = useState({ total: 80, endDate: '2025-12-15' })

  const addEntry = (name, type) =>
    setLog(p => [{ icon: type === 'Outtake' ? '🥡' : '🍽️', name, time: 'Just now', type }, ...p])

  return (
    <>
      {/* Header */}
      <div className="relative bg-forest-deep overflow-hidden">
        <div className="absolute inset-0 bg-hero-mesh opacity-70" />
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">
          <p className="text-green-300/70 text-xs font-semibold uppercase tracking-widest mb-1">Swipe Manager</p>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-6">🔄 Swipes</h1>

          <div className="flex flex-wrap gap-5 items-end">
            {/* Big swipe count */}
            <div className="glass-dark rounded-2xl px-8 py-6">
              <p className="text-white/40 text-xs uppercase tracking-widest font-bold mb-1">Remaining</p>
              <p className="font-display text-6xl font-bold text-white leading-none">47</p>
              <p className="text-white/40 text-sm mt-1">of 80 this semester</p>
              <div className="mt-3 bg-white/20 rounded-full h-2 w-48">
                <div className="bg-green-300 h-full rounded-full w-[59%]" />
              </div>
            </div>

            <div className="flex gap-5 flex-wrap">
              {[['Used This Week','3'],['Weekly Budget','7'],['Days Left','61']].map(([lbl, val]) => (
                <div key={lbl} className="glass-dark rounded-2xl px-5 py-4">
                  <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-1">{lbl}</p>
                  <p className="font-display text-2xl font-bold text-white">{val}</p>
                </div>
              ))}
            </div>

            <button onClick={() => addEntry('Manual Swipe', 'Dining Hall')}
              className="px-8 py-4 bg-white text-forest font-bold rounded-2xl hover:bg-green-50 hover:-translate-y-0.5 hover:shadow-float transition-all text-sm">
              + Use a Swipe
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Week tracker */}
        <div>
          <SectionTitle>This Week</SectionTitle>
          <div className="flex gap-2 flex-wrap">
            {DAYS.map(({ name, status, count }) => (
              <div key={name} className={`flex-1 min-w-[80px] rounded-2xl p-4 text-center border-2 transition-all ${
                status === 'used'   ? 'border-forest bg-forest-muted' :
                status === 'today'  ? 'border-ember bg-ember-light' :
                'border-black/[0.06] bg-white opacity-50'
              }`}>
                <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${status === 'today' ? 'text-ember' : 'text-gray-400'}`}>
                  {name}{status === 'today' ? ' ←' : ''}
                </p>
                <div className="text-2xl mb-1">{status === 'used' ? '✅' : status === 'today' ? '📍' : '○'}</div>
                <p className="text-xs font-medium text-charcoal">{count ?? '—'}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Dining Halls */}
          <Card>
            <SectionTitle sub="Tap a hall to log a visit">🏛️ Dining Halls</SectionTitle>
            <ul>
              {HALLS.map(({ icon, name, detail, stars, visits, isOuttake }) => (
                <li key={name}
                  onClick={() => addEntry(name, isOuttake ? 'Outtake' : 'Dining Hall')}
                  className="flex items-center gap-3 py-3.5 border-b border-black/[0.04] last:border-0 cursor-pointer hover:bg-parchment rounded-xl px-2 -mx-2 transition-all group"
                >
                  <div className="w-11 h-11 bg-parchment rounded-xl flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-110 transition-transform">{icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-charcoal">{name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{detail}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-amber-400 text-xs">{'★'.repeat(stars)}{'☆'.repeat(5-stars)}</p>
                    <p className="text-xs text-gray-400">{visits} visits</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <div className="space-y-5">
            {/* Log */}
            <Card>
              <SectionTitle>📋 Swipe History</SectionTitle>
              <ul className="mb-6">
                {log.map(({ icon, name, time, type }, i) => (
                  <li key={i} className="flex items-center gap-3 py-2.5 border-b border-black/[0.04] last:border-0">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${type === 'Outtake' ? 'bg-ember' : 'bg-forest'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{name}</p>
                      <p className="text-xs text-gray-400">{time}</p>
                    </div>
                    <Badge variant={type === 'Outtake' ? 'orange' : 'green'}>{type}</Badge>
                  </li>
                ))}
              </ul>

              <p className="font-display text-lg font-semibold text-charcoal mb-4">Budget Settings</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-charcoal/60 uppercase tracking-wider mb-1.5">Total Semester Swipes</label>
                  <input type="number" value={budget.total}
                    onChange={e => setBudget(b => ({ ...b, total: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-charcoal/60 uppercase tracking-wider mb-1.5">Semester End Date</label>
                  <input type="date" value={budget.endDate}
                    onChange={e => setBudget(b => ({ ...b, endDate: e.target.value }))} className={inputCls} />
                </div>
                <Btn variant="primary" className="w-full">Update Budget</Btn>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
