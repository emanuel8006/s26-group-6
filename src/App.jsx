import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import CorkBoardTransition from './assets/Components/CorkBoardTransition'
import Nav from './assets/components/Nav'
import Footer from './assets/components/Footer'
import Home from './assets/pages/Home'
import Login from './assets/pages/Login'
import Dashboard from './assets/pages/Dashboard'
import DiningDollars from './assets/pages/DiningDollars'
import Swipes from './assets/pages/Swipes'
import FoodGood from './assets/pages/FoodGood'

export default function App() {
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <CorkBoardTransition>
      <div className="min-h-screen flex flex-col">
        {!isHome && <Nav />}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dining-dollars" element={<DiningDollars />} />
            <Route path="/swipes" element={<Swipes />} />
            <Route path="/food-good" element={<FoodGood />} />
          </Routes>
        </main>
        {!isHome && <Footer />}
      </div>
    </CorkBoardTransition>
  )
}