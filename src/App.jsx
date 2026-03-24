import React from 'react'
import Onboarding from './assets/Pages/Onboarding'
import { Routes, Route, useLocation } from 'react-router-dom'
import Nav from './assets/components/Nav'
import Footer from './assets/components/Footer'
import Home from './assets/pages/Home'
import Login from './assets/pages/Login'
import Dashboard from './assets/pages/Dashboard'
import DiningDollars from './assets/pages/DiningDollars'
import Swipes from './assets/pages/Swipes'

export default function App() {
  const location = useLocation()
  const isHome = location.pathname === '/' || location.pathname === '/onboarding'

  return (
    <div className="min-h-screen flex flex-col">
      {!isHome && <Nav />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dining-dollars" element={<DiningDollars />} />
          <Route path="/swipes" element={<Swipes />} />
          <Route path="/onboarding" element={<Onboarding />} />
        </Routes>
      </main>
      {!isHome && <Footer />}
    </div>
  )
}