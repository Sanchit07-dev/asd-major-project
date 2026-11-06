import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await signOut()
    navigate('/')
  }

  return (
    <nav className="flex items-center gap-4 p-4 text-slate-200 border-b border-slate-700">
      <Link to="/" className="font-bold text-white">NST Learning Hub</Link>
      <Link to="/browse">Browse</Link>
      <Link to="/add">Add Resource</Link>
      <Link to="/profile">Profile</Link>
      <div className="ml-auto flex items-center gap-4">
        {user ? (
          <>
            <span className="text-sm text-slate-400">{user.user_metadata?.full_name || user.email}</span>
            <button onClick={handleLogout} className="underline">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup" className="px-3 py-1 rounded bg-indigo-600 text-white">Sign up</Link>
          </>
        )}
      </div>
    </nav>
  )
}
