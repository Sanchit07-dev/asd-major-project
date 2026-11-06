import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const item = ({ isActive }) => (isActive ? 'mark font-medium' : 'text-mute hover:text-ink')

export default function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  async function logout() {
    await signOut()
    navigate('/')
  }

  return (
    <header className="border-b border-rule">
      <nav className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-6 py-4">
        <Link to="/" className="mr-2 text-lg font-bold tracking-tight">NST Learning Hub</Link>
        <NavLink to="/browse" className={item}>Browse</NavLink>
        <NavLink to="/add" className={item}>Add resource</NavLink>
        <NavLink to="/profile" className={item}>My resources</NavLink>
        <div className="ml-auto flex items-center gap-4">
          {user ? (
            <>
              <span className="text-mute">{user.user_metadata?.full_name || user.email}</span>
              <button onClick={logout} className="underline underline-offset-4">Log out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="underline underline-offset-4">Log in</Link>
              <Link to="/signup" className="btn">Create account</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
