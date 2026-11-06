import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Field from '../components/Field'

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
    if (error) setError(error.message)
    else if (data.session) navigate('/browse')
    else setMessage('Account created. Confirm your email, then log in.')
  }

  return (
    <div className="mx-auto max-w-md px-6 py-14">
      <h1 className="text-3xl font-semibold tracking-tight">Create account</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Field label="Full name">
          <input required autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="field" />
        </Field>
        <Field label="Email">
          <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="field" />
        </Field>
        <Field label="Password (at least 6 characters)">
          <input type="password" required minLength={6} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className="field" />
        </Field>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        {message && <p className="text-sm text-green-800">{message}</p>}
        <button disabled={busy} className="btn">{busy ? 'Creating...' : 'Create account'}</button>
      </form>
      <p className="mt-6 text-mute">
        Already registered? <Link to="/login" className="text-pen underline underline-offset-4">Log in</Link>
      </p>
    </div>
  )
}
