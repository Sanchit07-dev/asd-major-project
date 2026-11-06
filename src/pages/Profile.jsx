import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import ResourceCard from '../components/ResourceCard'

export default function Profile() {
  const { user } = useAuth()
  const [mine, setMine] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('resource_stats')
      .select('*')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setMine(data || []); setLoading(false) })
  }, [user.id])

  return (
    <div className="page">
      <h1 className="text-3xl font-semibold tracking-tight">{user.user_metadata?.full_name || 'Your account'}</h1>
      <p className="mt-1 text-mute">{user.email}</p>

      <h2 className="mt-12 border-b border-ink pb-2 text-xl font-semibold">Your resources ({mine.length})</h2>
      {loading && <p className="py-4 text-mute">Loading...</p>}
      {!loading && mine.length === 0 && (
        <p className="py-4">
          You haven't added anything yet. <Link to="/add" className="text-pen underline underline-offset-4">Add your first resource</Link>.
        </p>
      )}
      {mine.map((r) => <ResourceCard key={r.id} resource={r} />)}
    </div>
  )
}
