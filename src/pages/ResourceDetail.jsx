import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { getBookmarkedResourceIds, toggleBookmark } from '../lib/bookmarks'
import StarRating from '../components/StarRating'
import Field from '../components/Field'

const TYPES = ['video', 'pdf', 'article', 'notes', 'github', 'other']

export default function ResourceDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [resource, setResource] = useState(null)
  const [subject, setSubject] = useState(null)
  const [reviews, setReviews] = useState([])
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [loading, setLoading] = useState(true)

  // Review state
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [reviewError, setReviewError] = useState('')
  const [reviewBusy, setReviewBusy] = useState(false)

  // Resource Edit state
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({ title: '', url: '', type: 'video', description: '' })
  const [editError, setEditError] = useState('')
  const [editBusy, setEditBusy] = useState(false)

  // Status message / toast
  const [toastMessage, setToastMessage] = useState('')

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3000)
  }

  const load = useCallback(async () => {
    const { data: r } = await supabase.from('resource_stats').select('*').eq('id', id).maybeSingle()
    setResource(r)
    if (r) {
      setEditForm({
        title: r.title || '',
        url: r.url || '',
        type: r.type || 'video',
        description: r.description || '',
      })
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
    if (mine) {
      setRating(mine.rating)
      setComment(mine.comment || '')
    }

    if (user?.id) {
      const bIds = await getBookmarkedResourceIds(user.id)
      setIsBookmarked(bIds.has(Number(id)))
    }

    setLoading(false)
  }, [id, user?.id])

  useEffect(() => {
    load()
  }, [load])

  async function handleToggleBookmark() {
    if (!user) {
      navigate('/login')
      return
    }

    const nextState = !isBookmarked
    setIsBookmarked(nextState)
    try {
      await toggleBookmark(user.id, Number(id), isBookmarked)
      showToast(nextState ? 'Saved to bookmarks' : 'Removed from bookmarks')
    } catch (err) {
      console.error(err)
      setIsBookmarked(!nextState)
      showToast('Failed to update bookmark')
    }
  }

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      showToast('Link copied to clipboard!')
    } catch {
      showToast('Could not copy link')
    }
  }

  async function submitReview(e) {
    e.preventDefault()
    if (!rating) {
      setReviewError('Choose a star rating first.')
      return
    }
    setReviewError('')
    setReviewBusy(true)
    const { error } = await supabase
      .from('reviews')
      .upsert(
        { resource_id: Number(id), user_id: user.id, rating, comment: comment.trim() || null },
        { onConflict: 'resource_id,user_id' }
      )
    setReviewBusy(false)
    if (error) {
      setReviewError(error.message)
    } else {
      showToast('Review submitted!')
      load()
    }
  }

  async function handleDeleteReview(reviewId) {
    if (!confirm('Are you sure you want to remove your review?')) return
    const { error } = await supabase.from('reviews').delete().eq('id', reviewId).eq('user_id', user.id)
    if (error) {
      showToast('Failed to delete review')
    } else {
      setRating(0)
      setComment('')
      showToast('Review deleted')
      load()
    }
  }

  async function handleUpdateResource(e) {
    e.preventDefault()
    setEditError('')
    setEditBusy(true)

    const { error } = await supabase
      .from('resources')
      .update({
        title: editForm.title.trim(),
        url: editForm.url.trim(),
        type: editForm.type,
        description: editForm.description.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('created_by', user.id)

    setEditBusy(false)
    if (error) {
      setEditError(error.message)
    } else {
      setIsEditing(false)
      showToast('Resource updated successfully!')
      load()
    }
  }

  async function handleDeleteResource() {
    if (!confirm('Are you sure you want to delete this resource? This action cannot be undone.')) return
    const { error } = await supabase
      .from('resources')
      .delete()
      .eq('id', id)
      .eq('created_by', user.id)

    if (error) {
      showToast('Failed to delete resource: ' + error.message)
    } else {
      navigate('/browse')
    }
  }

  if (loading) return <p className="page text-mute">Loading...</p>
  if (!resource) return <p className="page text-mute">This resource doesn't exist or was removed.</p>

  const n = resource.review_count
  const isOwner = user && resource.created_by && user.id === resource.created_by
  const hasReviewed = reviews.some((rv) => rv.user_id === user?.id)

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-lg bg-midnight px-4 py-3 text-sm font-medium text-paper shadow-lg border border-amber/30 transition-all animate-rise">
          {toastMessage}
        </div>
      )}

      <div className="flex items-center justify-between">
        <Link to="/browse" className="text-sm text-mute underline underline-offset-4 hover:text-ink">
          ← Back to browse
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 rounded-md border border-rule bg-white px-3 py-1.5 text-xs font-medium text-ink hover:bg-slate-50 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            Share
          </button>
          <button
            type="button"
            onClick={handleToggleBookmark}
            className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition ${
              isBookmarked
                ? 'border-amber bg-amber/10 text-amber-dark font-semibold'
                : 'border-rule bg-white text-ink hover:bg-slate-50'
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill={isBookmarked ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
            </svg>
            {isBookmarked ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>

      {/* Edit Form Modal/Panel if Owner is Editing */}
      {isEditing ? (
        <form onSubmit={handleUpdateResource} className="mt-6 rounded-xl border border-navy/20 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-semibold">Edit Resource</h2>
          <Field label="Title">
            <input
              required
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              className="field"
            />
          </Field>
          <Field label="URL">
            <input
              required
              type="url"
              value={editForm.url}
              onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
              className="field"
            />
          </Field>
          <Field label="Type">
            <select
              value={editForm.type}
              onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
              className="field"
            >
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Description (optional)">
            <textarea
              rows={3}
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              className="field font-read"
            />
          </Field>
          {editError && <p role="alert" className="text-sm text-red-700">{editError}</p>}
          <div className="flex gap-3">
            <button disabled={editBusy} type="submit" className="btn">
              {editBusy ? 'Saving...' : 'Save changes'}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="rounded-md border border-rule px-4 py-2 font-medium text-mute hover:bg-slate-100"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold leading-tight tracking-tight">{resource.title}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-mute">
                {subject && <span>Semester {subject.semester}, {subject.name}</span>}
                <span className="rounded-sm border border-rule px-1.5 text-sm uppercase font-mono text-xs">
                  {resource.type}
                </span>
              </div>
            </div>

            {/* Owner Management Controls */}
            {isOwner && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="rounded-md border border-rule bg-white px-3 py-1.5 text-xs font-medium text-ink hover:bg-slate-50 transition"
                >
                  Edit resource
                </button>
                <button
                  type="button"
                  onClick={handleDeleteResource}
                  className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 transition"
                >
                  Delete
                </button>
              </div>
            )}
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

          <div className="mt-8 flex items-center gap-4">
            <a href={resource.url} target="_blank" rel="noreferrer" className="btn inline-flex items-center gap-2">
              <span>Open resource</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </a>
          </div>
        </>
      )}

      {/* Review Section */}
      <h2 className="mt-14 text-xl font-semibold">{hasReviewed ? 'Your review' : 'Rate this resource'}</h2>
      {user ? (
        <form onSubmit={submitReview} className="mt-4 max-w-xl space-y-4">
          <StarRating value={rating} onChange={setRating} size="text-3xl" />
          <Field label="Comment (optional)">
            <textarea rows={3} value={comment} onChange={(e) => setComment(e.target.value)} className="field font-read" />
          </Field>
          {reviewError && <p role="alert" className="text-sm text-red-700">{reviewError}</p>}
          <button disabled={reviewBusy} className="btn">{hasReviewed ? 'Update review' : 'Post review'}</button>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-medium">{rv.profiles?.full_name || 'Student'}</span>
              <StarRating value={rv.rating} size="text-base" />
            </div>
            {user && rv.user_id === user.id && (
              <button
                type="button"
                onClick={() => handleDeleteReview(rv.id)}
                className="text-xs text-red-600 hover:underline"
              >
                Delete review
              </button>
            )}
          </div>
          {rv.comment && <p className="mt-1 max-w-prose font-read leading-relaxed">{rv.comment}</p>}
        </div>
      ))}
    </div>
  )
}
