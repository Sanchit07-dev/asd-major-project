import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { intro } from '../lib/intro'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [delay] = useState(intro.played ? 0 : 1.1)
  const [open, setOpen] = useState(false)

  async function logout() {
    await signOut()
    navigate('/')
    setOpen(false)
  }

  const navLinks = (
    <>
      <NavLink to="/browse" className="navlink" onClick={() => setOpen(false)}>Browse</NavLink>
      <NavLink to="/add" className="navlink" onClick={() => setOpen(false)}>Add resource</NavLink>
      <NavLink to="/profile" className="navlink" onClick={() => setOpen(false)}>My Library</NavLink>
    </>
  )

  return (
    <motion.header
      initial={{ y: '-100%' }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 18, delay }}
      className="fixed inset-x-0 top-0 z-40 px-4 pt-3"
    >
      <nav className="mx-auto max-w-5xl rounded-2xl border border-white/10 bg-midnight/70 px-5 py-3 text-paper backdrop-blur-md">
        {/* Desktop row */}
        <div className="flex items-center gap-x-6">
          <Link to="/" className="mr-2 text-lg font-bold tracking-tight" onClick={() => setOpen(false)}>
            NST Learning Hub
          </Link>

          {/* Desktop links */}
          <div className="hidden items-center gap-x-6 sm:flex">
            {navLinks}
          </div>

          <div className="ml-auto flex items-center gap-4">
            {user ? (
              <>
                <span className="hidden text-paper/75 text-sm sm:block">
                  {user.user_metadata?.full_name || user.email}
                </span>
                <button onClick={logout} className="navlink text-sm">Log out</button>
              </>
            ) : (
              <>
                <Link to="/login" className="navlink hidden sm:block" onClick={() => setOpen(false)}>Log in</Link>
                <Link to="/signup" className="btn" onClick={() => setOpen(false)}>Create account</Link>
              </>
            )}

            {/* Hamburger — mobile only */}
            <button
              className="sm:hidden ml-2 flex flex-col gap-1.5 p-1"
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen((o) => !o)}
            >
              <span className={`block h-0.5 w-6 bg-paper transition-transform ${open ? 'translate-y-2 rotate-45' : ''}`} />
              <span className={`block h-0.5 w-6 bg-paper transition-opacity ${open ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 w-6 bg-paper transition-transform ${open ? '-translate-y-2 -rotate-45' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden sm:hidden"
            >
              <div className="flex flex-col gap-3 pt-3 pb-1">
                {navLinks}
                {user ? (
                  <>
                    <span className="text-paper/60 text-sm">{user.user_metadata?.full_name || user.email}</span>
                    <button onClick={logout} className="navlink text-left text-sm">Log out</button>
                  </>
                ) : (
                  <Link to="/login" className="navlink" onClick={() => setOpen(false)}>Log in</Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  )
}
