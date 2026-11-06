import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  async function logout() {
    await signOut()
    navigate('/')
  }

  return (
    <header className="bg-navy text-paper">
      <nav className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-6 py-4">
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
    </header>
  )
}
