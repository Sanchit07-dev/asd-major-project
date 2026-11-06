import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { intro } from '../lib/intro'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [delay] = useState(intro.played ? 0 : 1.1)

  async function logout() {
    await signOut()
    navigate('/')
  }

  return (
    <motion.header
      initial={{ y: '-100%' }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 18, delay }}
      className="fixed inset-x-0 top-0 z-40 px-4 pt-3"
    >
      <nav className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl border border-white/10 bg-midnight/70 px-5 py-3 text-paper backdrop-blur-md">
        <Link to="/" className="mr-2 text-lg font-bold tracking-tight">NST Learning Hub</Link>
        <NavLink to="/browse" className="navlink">Browse</NavLink>
        <NavLink to="/add" className="navlink">Add resource</NavLink>
        <NavLink to="/profile" className="navlink">My resources</NavLink>
        <div className="ml-auto flex items-center gap-4">
          {user ? (
            <>
              <span className="text-paper/75">{user.user_metadata?.full_name || user.email}</span>
              <button onClick={logout} className="navlink">Log out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="navlink">Log in</Link>
              <Link to="/signup" className="btn">Create account</Link>
            </>
          )}
        </div>
      </nav>
    </motion.header>
  )
}
