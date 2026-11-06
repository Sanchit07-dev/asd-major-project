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
    supabase.from('resource_stats').select('*').eq('created_by', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setMine(data || []); setLoading(false) })
  }, [user.id])

  return (
    <div className="max-w-5xl mx-auto p-6 text-white">
      <h1 className="text-2xl font-bold">{user.user_metadata?.full_name || 'My profile'}</h1>
      <p className="text-slate-400 mb-6">{user.email}</p>
      <h2 className="text-xl font-semibold mb-3">My submissions ({mine.length})</h2>
      {loading && <p className="text-slate-400">Loading...</p>}
      {!loading && mine.length === 0 && (
        <p className="text-slate-400">
          You haven't shared anything yet. <Link to="/add" className="underline">Add a resource</Link>
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mine.map((r) => <ResourceCard key={r.id} resource={r} subjectName="" />)}
      </div>
    </div>
  )
}
