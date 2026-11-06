import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import StarRating from '../components/StarRating'

export default function ResourceDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [resource, setResource] = useState(null)
  const [subject, setSubject] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    const { data: r } = await supabase.from('resource_stats').select('*').eq('id', id).maybeSingle()
    setResource(r)
    if (r) {
      const { data: s } = await supabase.from('subjects').select('*').eq('id', r.subject_id).maybeSingle()
      setSubject(s)
    }
    const { data: rv } = await supabase
      .from('reviews')
      .select('*, profiles(full_name)')
      .eq('resource_id', id)
      .order('created_at', { ascending: false })
    setReviews(rv || [])
    setLoading(false)
  }, [id])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    const mine = reviews.find((rv) => rv.user_id === user?.id)
    if (mine) { setRating(mine.rating); setComment(mine.comment || '') }
  }, [reviews, user])

  async function submitReview(e) {
    e.preventDefault()
    if (!rating) { setError('Please pick a star rating.'); return }
    setError('')
    setBusy(true)
    const { error } = await supabase
      .from('reviews')
      .upsert(
        { resource_id: Number(id), user_id: user.id, rating, comment: comment.trim() || null },
        { onConflict: 'resource_id,user_id' }
      )
    setBusy(false)
    if (error) setError(error.message)
    else load()
  }

  if (loading) return <p className="p-6 text-slate-400">Loading...</p>
  if (!resource) return <p className="p-6 text-slate-400">Resource not found.</p>

  const hasReviewed = reviews.some((rv) => rv.user_id === user?.id)

  return (
    <div className="max-w-2xl mx-auto p-6 text-white">
      <Link to="/browse" className="text-sm text-slate-400 underline">← Back to browse</Link>

      <div className="mt-4 p-5 rounded-xl bg-slate-800">
        <div className="flex items-start justify-between gap-2">
          <h1 className="text-2xl font-bold">{resource.title}</h1>
          <span className="text-xs px-2 py-1 rounded bg-indigo-600 uppercase">{resource.type}</span>
        </div>
        <p className="text-sm text-slate-400 mt-1">
          {subject ? `Semester ${subject.semester} · ${subject.name}` : ''}
        </p>
        {resource.description && <p className="mt-3 text-slate-200">{resource.description}</p>}
        <div className="flex items-center gap-2 mt-3">
          <StarRating value={resource.avg_rating} />
          <span className="text-slate-400 text-sm">
            {Number(resource.avg_rating).toFixed(1)} ({resource.review_count} reviews)
          </span>
        </div>
        <a
          href={resource.url}
          target="_blank"
          rel="noreferrer"
          className="inline-block mt-4 px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500"
        >
          Open resource ↗
        </a>
      </div>

      <h2 className="text-xl font-semibold mt-8 mb-3">{hasReviewed ? 'Your review' : 'Leave a review'}</h2>
      {user ? (
        <form onSubmit={submitReview} className="p-4 rounded-xl bg-slate-800 space-y-3">
          <StarRating value={rating} onChange={setRating} size="text-3xl" />
          <textarea
            rows={3}
            placeholder="Share your thoughts (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full p-2 rounded bg-slate-700 outline-none"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button disabled={busy} className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50">
            {busy ? 'Saving...' : hasReviewed ? 'Update review' : 'Submit review'}
          </button>
        </form>
      ) : (
        <p className="text-slate-400">
          <Link to="/login" className="underline">Log in</Link> to review this resource.
        </p>
      )}

      <h2 className="text-xl font-semibold mt-8 mb-3">Reviews ({reviews.length})</h2>
      <div className="space-y-3">
        {reviews.length === 0 && <p className="text-slate-400">No reviews yet.</p>}
        {reviews.map((rv) => (
          <div key={rv.id} className="p-4 rounded-xl bg-slate-800">
            <div className="flex items-center justify-between">
              <span className="font-medium">{rv.profiles?.full_name || 'Student'}</span>
              <StarRating value={rv.rating} size="text-base" />
            </div>
            {rv.comment && <p className="mt-2 text-slate-300">{rv.comment}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
