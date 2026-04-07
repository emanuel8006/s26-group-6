import FoodGood from './assets/Pages/FoodGood'
import React from 'react'
import Onboarding from './assets/Pages/Onboarding'
import { Routes, Route, useLocation } from 'react-router-dom'
import Nav from './assets/Components/Nav'
import Footer from './assets/Components/Footer'
import Home from './assets/Pages/Home'
import Login from './assets/Pages/Login'
import Dashboard from './assets/Pages/Dashboard'
import DiningDollars from './assets/Pages/DiningDollars'
import Swipes from './assets/Pages/Swipes'

export default function App() {
  const location = useLocation()
  const isHome = location.pathname === '/' || location.pathname === '/onboarding' || location.pathname === '/login' //add all path names to this bool

  return (
    <div className="min-h-screen flex flex-col">
      <div className="page-transition-overlay" id="pageTransition">
        <div className="rip-piece"><div className="rip-snapshot"></div></div>
        <div className="rip-piece"><div className="rip-snapshot"></div></div>
        <div className="rip-piece"><div className="rip-snapshot"></div></div>
        <div className="rip-piece"><div className="rip-snapshot"></div></div>
        <div className="rip-piece"><div className="rip-snapshot"></div></div>
      </div>
      {!isHome && <Nav />}
      <main className="flex-1">
        <Routes>
          <Route path="/menu" element={<FoodGood />} />
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