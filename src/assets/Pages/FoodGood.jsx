import React from 'react'
import { useState } from 'react'
import { Card, SectionTitle, Badge } from '../components/UI'

const FOODS = [
  { emoji: '🍕', name: 'Margherita Pizza', location: 'Stetson East', rating: 4.5, ratingCount: 89, tags: ['🌱 Vegetarian', '🔄 Swipe'], price: '1 Swipe', sub: 'or $8.50', bg: 'bg-orange-50' },
  { emoji: '🌮', name: 'Burrito Bowl', location: 'Qdoba (Dining $)', rating: 4.3, ratingCount: 156, tags: ['🌮 Mexican', '💵 Dining $'], price: '$10.25', sub: 'dining dollars', bg: 'bg-amber-50', orange: true },
  { emoji: '🥗', name: 'Garden Salad Bar', location: 'International Village', rating: 3.8, ratingCount: 204, tags: ['🌱 Vegan', '🌾 Gluten-Free', '🔄 Swipe'], price: '1 Swipe', sub: '', bg: 'bg-green-50' },
  { emoji: '🍛', name: 'Chicken Tikka Masala', location: 'International Village', rating: 4.8, ratingCount: 312, tags: ['🍛 Indian', '🥩 Halal', '🔄 Swipe'], price: '1 Swipe', sub: '', bg: 'bg-red-50' },
  { emoji: '🍔', name: 'Classic Burger', location: 'Stetson West', rating: 4.0, ratingCount: 128, tags: ['🍔 American', '🔄 Swipe'], price: '1 Swipe', sub: '', bg: 'bg-yellow-50' },
  { emoji: '🍱', name: 'Sushi Platter', location: 'Outtakes', rating: 4.6, ratingCount: 77, tags: ['🍣 Asian', '🥡 Outtake'], price: '1 Outtake', sub: '', bg: 'bg-blue-50', orange: true },
]

const RATING_LABELS = ['', 'Not worth it 😬', 'Meh, okay 😐', 'Pretty good 🙂', 'Really good! 😊', 'Absolutely fire! 🔥']

function RatingModal({ food, onClose, onSubmit }) {
  const [stars, setStars] = useState(0)
  const [note, setNote] = useState('')
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full relative animate-fade-up shadow-float" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-gray-400 transition-colors">✕</button>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Rate this meal</p>
        <h3 className="font-display text-2xl font-bold text-charcoal mb-5">{food}</h3>

        <div className="flex gap-3 justify-center text-4xl mb-2">
          {[1,2,3,4,5].map(n => (
            <button key={n} onClick={() => setStars(n)}
              className="hover:scale-125 transition-transform cursor-pointer">
              {n <= stars ? '⭐' : '☆'}
            </button>
          ))}
        </div>
        <p className="text-center font-semibold text-forest text-sm h-5 mb-5">{RATING_LABELS[stars]}</p>

        <textarea value={note} onChange={e => setNote(e.target.value)}
          placeholder="Add a note... e.g. The spicy option was great!"
          rows={3}
          className="w-full px-4 py-3 border border-black/[0.08] rounded-xl text-sm outline-none focus:border-forest resize-none mb-4 transition-colors"
        />
        <button onClick={() => stars > 0 && onSubmit()}
          className="w-full py-3.5 bg-forest text-white font-bold rounded-xl hover:bg-forest-light transition-all">
          Submit Rating →
        </button>
      </div>
    </div>
  )
}

function Toast({ message, onDone }) {
  setTimeout(onDone, 3000)
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-forest-deep text-white px-6 py-3.5 rounded-2xl font-semibold text-sm z-50 animate-fade-up shadow-float whitespace-nowrap flex items-center gap-2">
      {message}
    </div>
  )
}

function Stars({ rating }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-amber-400 text-xs">{'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}</span>
      <span className="font-bold text-xs text-charcoal">{rating}</span>
    </div>
  )
}

export default function FoodGood() {
  const [modal, setModal] = useState(null)
  const [toast, setToast] = useState(null)

  return (
    <>
      {/* Header */}
      <div className="relative bg-forest-deep overflow-hidden">
        <div className="absolute inset-0 bg-hero-mesh opacity-70" />
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">
          <p className="text-green-300/70 text-xs font-semibold uppercase tracking-widest mb-1">Recommendations</p>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-1">⭐ Is Food Good?</h1>
          <p className="text-white/50 text-sm">Personalized suggestions based on your preferences and today's menus.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Filter bar */}
        <div className="bg-white rounded-2xl p-5 border border-black/[0.04] shadow-card flex flex-wrap gap-4 items-end">
          {[
            { label: 'Location', opts: ['All Locations', 'Dining Hall', 'Restaurants (Dining $)', 'Grocery'] },
            { label: 'Diet', opts: ['Any', 'Vegetarian', 'Vegan', 'Halal', 'Gluten-Free'] },
            { label: 'Cuisine', opts: ['Any Cuisine', 'Asian', 'Mexican', 'Italian', 'American', 'Indian'] },
            { label: 'Sort By', opts: ['Top Rated', 'Best Value', 'Newest'] },
          ].map(({ label, opts }) => (
            <div key={label}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">{label}</p>
              <select className="px-4 py-2 border border-black/[0.08] rounded-xl text-sm outline-none focus:border-forest transition-colors bg-white">
                {opts.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
          <button className="px-5 py-2.5 bg-forest text-white rounded-xl text-sm font-semibold hover:bg-forest-light transition-colors">
            🔍 Filter
          </button>
        </div>

        {/* Today's Pick */}
        <div className="relative bg-forest-deep rounded-2xl p-8 overflow-hidden">
          <div className="absolute inset-0 bg-hero-mesh opacity-60" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-forest-light/20 rounded-full blur-3xl" />
          <div className="relative z-10 flex flex-wrap gap-8 items-center">
            <div className="text-7xl animate-float">🍜</div>
            <div className="flex-1 min-w-[200px]">
              <span className="inline-block text-xs font-bold uppercase tracking-widest text-green-300/70 mb-2">✨ Today's Top Pick For You</span>
              <h2 className="font-display text-3xl font-bold text-white mb-2">Spicy Ramen Bowl</h2>
              <p className="text-white/60 text-sm leading-relaxed mb-4">Available at International Village · Perfect match for your Asian cuisine preference. Vegetarian option available.</p>
              <div className="flex gap-2 flex-wrap">
                {['🌱 Veg Option', '🌶️ Spicy', '🔄 Uses 1 Swipe'].map(tag => (
                  <span key={tag} className="glass-dark rounded-full px-3 py-1 text-xs font-medium text-white">{tag}</span>
                ))}
              </div>
            </div>
            <div className="text-center glass-dark rounded-2xl px-8 py-5">
              <p className="font-display text-5xl font-bold text-white">4.7</p>
              <p className="text-amber-300 text-lg mt-1">★★★★★</p>
              <p className="text-white/40 text-xs mt-1">234 ratings</p>
            </div>
          </div>
        </div>

        {/* Food Grid */}
        <div>
          <SectionTitle sub="Based on your Asian cuisine preference and vegetarian diet">Suggestions For You</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FOODS.map(({ emoji, name, location, rating, ratingCount, tags, price, sub, bg, orange }) => (
              <div key={name} className="group bg-white rounded-2xl overflow-hidden border border-black/[0.04] shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300">
                <div className={`${bg} h-32 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-300 overflow-hidden`}>
                  {emoji}
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-charcoal text-sm leading-tight">{name}</h3>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-gray-400">📍 {location}</p>
                    <Stars rating={rating} />
                  </div>
                  <p className="text-[10px] text-gray-300 mb-2">{ratingCount} ratings</p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {tags.map(tag => (
                      <span key={tag} className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                        orange && (tag.includes('$') || tag.includes('Outtake'))
                          ? 'bg-ember-light text-ember'
                          : 'bg-forest-muted text-forest'
                      }`}>{tag}</span>
                    ))}
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-black/[0.04]">
                    <div>
                      <p className="font-bold text-charcoal text-sm">{price}</p>
                      {sub && <p className="text-xs text-gray-400">{sub}</p>}
                    </div>
                    <button onClick={() => setModal(name)}
                      className="px-3.5 py-1.5 bg-forest-muted text-forest rounded-lg text-xs font-bold hover:bg-forest hover:text-white transition-all">
                      Rate it ★
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {modal && <RatingModal food={modal} onClose={() => setModal(null)} onSubmit={() => { setModal(null); setToast('✅ Rating submitted! Thanks for helping other students.') }} />}
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </>
  )
}
