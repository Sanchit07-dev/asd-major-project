
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { getBookmarkedResources, toggleBookmark } from '../lib/bookmarks'
import ResourceCard from '../components/ResourceCard'
import StarRating from '../components/StarRating'

export default function Profile() {
  const { user } = useAuth()

  const [activeTab, setActiveTab] = useState('resources')
  const [mine, setMine] = useState([])
  const [saved, setSaved] = useState([])
  const [reviews, setReviews] = useState([])

  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const [actionMessage, setActionMessage] = useState('')

  const notificationTimerRef = useRef(null)

  // Display a notification and reset its timer if another appears.
  const showNotification = (msg) => {
    if (notificationTimerRef.current) {
      clearTimeout(notificationTimerRef.current)
    }

    setActionMessage(msg)

    notificationTimerRef.current = setTimeout(() => {
      setActionMessage('')
      notificationTimerRef.current = null
    }, 3000)
  }

  // Clean up the notification timer when the component unmounts.
  useEffect(() => {
    return () => {
      if (notificationTimerRef.current) {
        clearTimeout(notificationTimerRef.current)
      }
    }
  }, [])

  // Load all profile data.
  useEffect(() => {
    let cancelled = false

    const loadProfile = async () => {
      if (!user?.id) {
        setLoading(false)
        return
      }

      setLoading(true)
      setLoadError('')

      try {
        const [myRes, savedRes, myReviews] = await Promise.all([
          supabase
            .from('resource_stats')
            .select('*')
            .eq('created_by', user.id)
            .order('created_at', { ascending: false }),

          getBookmarkedResources(user.id),

          supabase
            .from('reviews')
            .select('*, resources(id, title, type)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false }),
        ])

        if (myRes.error) throw myRes.error
        if (myReviews.error) throw myReviews.error

        if (!cancelled) {
          setMine(myRes.data || [])
          setSaved(savedRes || [])
          setReviews(myReviews.data || [])
        }
      } catch (err) {
        console.error('Failed to load profile:', err)

        if (!cancelled) {
          setLoadError(
            'Unable to load your profile data. Please try again.'
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadProfile()

    return () => {
      cancelled = true
    }
  }, [user?.id, retryCount])

  // Retry profile loading.
  const retryLoading = () => {
    setRetryCount((previous) => previous + 1)
  }

  // Remove a saved bookmark.
  const handleRemoveBookmark = async (resourceId) => {
    try {
      await toggleBookmark(user.id, resourceId, true)

      setSaved((prev) =>
        prev.filter((r) => r.id !== resourceId)
      )

      showNotification('Removed from saved bookmarks')
    } catch (err) {
      console.error('Failed to remove bookmark:', err)
      showNotification('Failed to remove bookmark')
    }
  }

  // Delete a review.
  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Are you sure you want to delete this review?')) return

    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)
        .eq('user_id', user.id)

      if (error) throw error

      setReviews((prev) =>
        prev.filter((r) => r.id !== reviewId)
      )

      showNotification('Review deleted successfully')
    } catch (err) {
      console.error('Failed to delete review:', err)
      showNotification('Failed to delete review')
    }
  }

  // Delete an owned resource.
  const handleDeleteResource = async (resourceId) => {
    if (
      !confirm(
        'Are you sure you want to delete this resource? This will remove all associated reviews.'
      )
    ) {
      return
    }

    try {
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', resourceId)
        .eq('created_by', user.id)

      if (error) throw error

      setMine((prev) =>
        prev.filter((r) => r.id !== resourceId)
      )

      showNotification('Resource deleted successfully')
    } catch (err) {
      console.error('Failed to delete resource:', err)
      showNotification('Failed to delete resource: ' + err.message)
    }
  }

  if (!user) {
    return (
      <div className="page py-8">
        <p>Please log in to view your profile.</p>
        <Link to="/login" className="text-pen underline">
          Login
        </Link>
      </div>
    )
  }

  const statButtonClass = (active) =>
    `cursor-pointer rounded-xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 ${
      active
        ? 'border-navy bg-navy/5 shadow-sm'
        : 'border-rule bg-white hover:bg-slate-50'
    }`

  return (
    <div className="page relative">
      {/* Toast Notification */}
      {actionMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 rounded-lg bg-midnight px-4 py-3 text-sm font-medium text-paper shadow-lg border border-amber/30 transition-all animate-rise"
        >
          {actionMessage}
        </div>
      )}

      {/* User Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-rule pb-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {user.user_metadata?.full_name || 'Your Account'}
          </h1>
          <p className="mt-1 text-mute">{user.email}</p>
        </div>

        <Link to="/add" className="btn text-sm">
          + Add New Resource
        </Link>
      </div>

      {/* Profile Overview Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <button
          type="button"
          aria-pressed={activeTab === 'resources'}
          onClick={() => setActiveTab('resources')}
          className={statButtonClass(activeTab === 'resources')}
        >
          <div className="text-2xl font-bold text-navy">
            {mine.length}
          </div>
          <div className="text-xs font-medium uppercase tracking-wider text-mute mt-1">
            Shared Resources
          </div>
        </button>

        <button
          type="button"
          aria-pressed={activeTab === 'saved'}
          onClick={() => setActiveTab('saved')}
          className={`cursor-pointer rounded-xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 ${
            activeTab === 'saved'
              ? 'border-amber bg-amber/5 shadow-sm'
              : 'border-rule bg-white hover:bg-slate-50'
          }`}
        >
          <div className="text-2xl font-bold text-amber-dark">
            {saved.length}
          </div>
          <div className="text-xs font-medium uppercase tracking-wider text-mute mt-1">
            Saved Bookmarks
          </div>
        </button>

        <button
          type="button"
          aria-pressed={activeTab === 'reviews'}
          onClick={() => setActiveTab('reviews')}
          className={statButtonClass(activeTab === 'reviews')}
        >
          <div className="text-2xl font-bold text-ink">
            {reviews.length}
          </div>
          <div className="text-xs font-medium uppercase tracking-wider text-mute mt-1">
            Reviews Given
          </div>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="mt-8 flex gap-6 border-b border-rule text-sm font-medium">
        <button
          type="button"
          aria-pressed={activeTab === 'resources'}
          onClick={() => setActiveTab('resources')}
          className={`pb-3 transition relative ${
            activeTab === 'resources'
              ? 'text-navy font-semibold border-b-2 border-navy -mb-px'
              : 'text-mute hover:text-ink'
          }`}
        >
          My Resources ({mine.length})
        </button>

        <button
          type="button"
          aria-pressed={activeTab === 'saved'}
          onClick={() => setActiveTab('saved')}
          className={`pb-3 transition relative ${
            activeTab === 'saved'
              ? 'text-navy font-semibold border-b-2 border-navy -mb-px'
              : 'text-mute hover:text-ink'
          }`}
        >
          Saved Bookmarks ({saved.length})
        </button>

        <button
          type="button"
          aria-pressed={activeTab === 'reviews'}
          onClick={() => setActiveTab('reviews')}
          className={`pb-3 transition relative ${
            activeTab === 'reviews'
              ? 'text-navy font-semibold border-b-2 border-navy -mb-px'
              : 'text-mute hover:text-ink'
          }`}
        >
          My Reviews ({reviews.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {loading ? (
          <div className="space-y-4">
            <div className="skeleton h-20" />
            <div className="skeleton h-20" />
          </div>
        ) : loadError ? (
          <div role="alert" className="py-8">
            <p className="text-red-700">{loadError}</p>
            <button
              type="button"
              onClick={retryLoading}
              className="mt-3 text-pen underline font-medium"
            >
              Try again
            </button>
          </div>
        ) : (
          <>
            {/* TAB 1: MY RESOURCES */}
            {activeTab === 'resources' && (
              <div>
                {mine.length === 0 ? (
                  <p className="py-8 text-mute">
                    You haven't contributed any resources yet.{' '}
                    <Link
                      to="/add"
                      className="text-pen underline underline-offset-4"
                    >
                      Share your first study resource
                    </Link>.
                  </p>
                ) : (
                  <div className="divide-y divide-rule">
                    {mine.map((r) => (
                      <div
                        key={r.id}
                        className="flex items-center justify-between py-2 group"
                      >
                        <div className="flex-1">
                          <ResourceCard resource={r} />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteResource(r.id)}
                          className="ml-4 rounded border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-100 transition shrink-0"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: SAVED BOOKMARKS */}
            {activeTab === 'saved' && (
              <div>
                {saved.length === 0 ? (
                  <p className="py-8 text-mute">
                    No saved resources yet. Browse resources and click the
                    bookmark icon to save them for revision.{' '}
                    <Link
                      to="/browse"
                      className="text-pen underline underline-offset-4"
                    >
                      Browse resources
                    </Link>.
                  </p>
                ) : (
                  <div className="divide-y divide-rule">
                    {saved.map((r) => (
                      <ResourceCard
                        key={r.id}
                        resource={r}
                        isBookmarked={true}
                        onToggleBookmark={handleRemoveBookmark}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: MY REVIEWS */}
            {activeTab === 'reviews' && (
              <div>
                {reviews.length === 0 ? (
                  <p className="py-8 text-mute">
                    You haven't submitted any reviews yet.{' '}
                    <Link
                      to="/browse"
                      className="text-pen underline underline-offset-4"
                    >
                      Find a resource to review
                    </Link>.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((rv) => (
                      <div
                        key={rv.id}
                        className="rounded-xl border border-rule bg-white p-5 shadow-xs"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <Link
                              to={`/resource/${rv.resource_id}`}
                              className="font-semibold text-pen hover:underline text-lg"
                            >
                              {rv.resources?.title || 'Resource'}
                            </Link>

                            <span className="ml-2 rounded border border-rule px-1.5 py-0.5 text-xs uppercase font-mono text-mute">
                              {rv.resources?.type}
                            </span>

                            <div className="mt-2 flex items-center gap-3">
                              <StarRating
                                value={rv.rating}
                                size="text-sm"
                              />

                              <span className="text-xs text-mute">
                                {new Date(rv.created_at).toLocaleDateString(
                                  undefined,
                                  {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                  }
                                )}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Link
                              to={`/resource/${rv.resource_id}`}
                              className="rounded border border-rule px-2.5 py-1 text-xs font-medium text-mute hover:bg-slate-50"
                            >
                              Edit on page
                            </Link>

                            <button
                              type="button"
                              onClick={() => handleDeleteReview(rv.id)}
                              className="rounded border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-100 transition"
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        {rv.comment && (
                          <p className="mt-3 font-read text-ink/90 leading-relaxed border-t border-rule/60 pt-3">
                            "{rv.comment}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
