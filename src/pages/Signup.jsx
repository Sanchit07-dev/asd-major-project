import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')
    setBusy(true)
    const { data, error } = await signUp(email, password, fullName)
    setBusy(false)
    if (error) {
      setError(error.message)
    } else if (data.session) {
      navigate('/browse')
    } else {
      setMessage('Account created. Check your email to confirm, then log in.')
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-16 p-6 rounded-xl bg-slate-800 text-white">
      <h1 className="text-2xl font-bold mb-4">Create account</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          required
          placeholder="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full p-2 rounded bg-slate-700 outline-none"
        />
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 rounded bg-slate-700 outline-none"
        />
        <input
          type="password"
          required
          minLength={6}
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 rounded bg-slate-700 outline-none"
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        {message && <p className="text-green-400 text-sm">{message}</p>}
        <button
          disabled={busy}
          className="w-full p-2 rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50"
        >
          {busy ? 'Creating...' : 'Sign up'}
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-300">
        Already have an account? <Link to="/login" className="underline">Log in</Link>
      </p>
    </div>
  )
}
