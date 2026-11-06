import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Field from '../components/Field'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    const { error } = await signIn(email, password)
    setBusy(false)
    if (error) setError(error.message)
    else navigate('/browse')
  }

  return (
    <div className="mx-auto max-w-md px-6 py-14">
      <h1 className="text-3xl font-semibold tracking-tight">Log in</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Field label="Email">
          <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="field" />
        </Field>
        <Field label="Password">
          <input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="field" />
        </Field>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <button disabled={busy} className="btn">{busy ? 'Logging in...' : 'Log in'}</button>
      </form>
      <p className="mt-6 text-mute">
        New here? <Link to="/signup" className="text-pen underline underline-offset-4">Create an account</Link>
      </p>
    </div>
  )
}
