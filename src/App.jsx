import { useEffect, useState } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { intro } from './lib/intro'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Browse from './pages/Browse'
import ResourceDetail from './pages/ResourceDetail'
import AddResource from './pages/AddResource'
import Profile from './pages/Profile'

function Splash() {
  const [show, setShow] = useState(!intro.played)

  useEffect(() => {
    const hide = setTimeout(() => setShow(false), 1200)
    const done = setTimeout(() => { intro.played = true }, 2800)
    return () => { clearTimeout(hide); clearTimeout(done) }
  }, [])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          aria-hidden="true"
          className="fixed inset-0 z-50 grid place-items-center bg-midnight"
          exit={{ y: '-100%' }}
          transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: [0, 1, 1, 0], scale: [0.9, 1, 1.05, 1.12] }}
            transition={{ duration: 1.2, times: [0, 0.3, 0.7, 1], ease: 'easeOut' }}
            className="flex items-center gap-4 rounded-2xl border border-amber/40 bg-white/5 px-7 py-4 shadow-[0_0_70px_rgba(245,158,11,0.45)] backdrop-blur-md"
          >
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-amber text-2xl font-bold text-midnight">N</span>
            <span className="text-3xl font-bold tracking-tight text-white">NST Learning Hub</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Shell() {
  const { pathname } = useLocation()
  return (
    <div className="min-h-screen">
      <Navbar />
      <div key={pathname} className={`page-enter ${pathname === '/' ? '' : 'pt-20'}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/resource/:id" element={<ResourceDetail />} />
          <Route path="/add" element={<ProtectedRoute><AddResource /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Routes>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <AuthProvider>
          <Splash />
          <Shell />
        </AuthProvider>
      </BrowserRouter>
    </MotionConfig>
  )
}
