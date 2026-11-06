import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import StarRating from '../components/StarRating'
import Field from '../components/Field'

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
    const mine = (rv || []).find((x) => x.user_id === user?.id)
    if (mine) { setRating(mine.rating); setComment(mine.comment || '') }
    setLoading(false)
  }, [id, user?.id])

  useEffect(() => { load() }, [load])

  async function submitReview(e) {
    e.preventDefault()
    if (!rating) { setError('Choose a star rating first.'); return }
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

  if (loading) return <p className="page text-mute">Loading...</p>
  if (!resource) return <p className="page text-mute">This resource doesn't exist or was removed.</p>

  const n = resource.review_count
  const hasReviewed = reviews.some((rv) => rv.user_id === user?.id)

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link to="/browse" className="text-sm text-mute underline underline-offset-4">Back to browse</Link>
      <h1 className="mt-6 text-3xl font-semibold leading-tight tracking-tight">{resource.title}</h1>
      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-mute">
        {subject && <span>Semester {subject.semester}, {subject.name}</span>}
        <span className="rounded-sm border border-rule px-1.5 text-sm">{resource.type}</span>
      </div>

      <div className="mt-6 flex items-center gap-3">
        {n > 0 ? (
          <>
            <span className="mark text-3xl font-semibold">{Number(resource.avg_rating).toFixed(1)}</span>
            <StarRating value={resource.avg_rating} />
            <span className="text-mute">{n} {n === 1 ? 'review' : 'reviews'}</span>
          </>
        ) : (
          <span className="text-mute">No ratings yet</span>
        )}
      </div>

      {resource.description && (
        <p className="mt-6 max-w-prose font-read text-lg leading-relaxed">{resource.description}</p>
      )}
      <a href={resource.url} target="_blank" rel="noreferrer" className="btn mt-8">Open resource</a>

      <h2 className="mt-14 text-xl font-semibold">{hasReviewed ? 'Your review' : 'Rate this resource'}</h2>
      {user ? (
        <form onSubmit={submitReview} className="mt-4 max-w-xl space-y-4">
          <StarRating value={rating} onChange={setRating} size="text-3xl" />
          <Field label="Comment (optional)">
            <textarea rows={3} value={comment} onChange={(e) => setComment(e.target.value)} className="field font-read" />
          </Field>
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          <button disabled={busy} className="btn">{hasReviewed ? 'Update review' : 'Post review'}</button>
        </form>
      ) : (
        <p className="mt-4 text-mute">
          <Link to="/login" className="text-pen underline underline-offset-4">Log in</Link> to rate this resource.
        </p>
      )}

      <h2 className="mt-14 border-b border-ink pb-2 text-xl font-semibold">Reviews ({reviews.length})</h2>
      {reviews.length === 0 && <p className="py-4 text-mute">No reviews yet.</p>}
      {reviews.map((rv) => (
        <div key={rv.id} className="border-b border-rule py-4">
          <div className="flex items-center gap-3">
            <span className="font-medium">{rv.profiles?.full_name || 'Student'}</span>
            <StarRating value={rv.rating} size="text-base" />
          </div>
          {rv.comment && <p className="mt-1 max-w-prose font-read leading-relaxed">{rv.comment}</p>}
        </div>
      ))}
    </div>
  )
}
