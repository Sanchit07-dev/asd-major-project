import { useEffect, useState } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { isSupabaseConfigured } from './lib/supabase'
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

function ConfigurationRequired() {
  return (
    <main className="grid min-h-screen place-items-center bg-midnight px-6 text-white">
      <section className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-md">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-amber">NST Learning Hub</p>
        <h1 className="mb-4 text-3xl font-bold">Connect Supabase to continue</h1>
        <p className="mb-6 leading-7 text-white/70">
          The app is running, but Supabase credentials have not been configured.
          Create <code className="rounded bg-white/10 px-2 py-1 text-amber">.env.local</code> in the project root with:
        </p>
        <pre className="overflow-x-auto rounded-xl bg-black/30 p-4 text-sm leading-7 text-white/90">
{`VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key`}
</pre>
        <p className="mt-6 text-sm text-white/50">
          Copy <code>.env.example</code>, replace both placeholder values, then restart <code>npm run dev</code>.
        </p>
      </section>
    </main>
  )
}

export default function App() {
  if (!isSupabaseConfigured) {
    return <ConfigurationRequired />
  }

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
