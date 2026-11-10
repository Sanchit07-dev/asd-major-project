
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { getBookmarkedResourceIds, toggleBookmark } from '../lib/bookmarks'
import ResourceCard from '../components/ResourceCard'

const TYPES = ['video', 'pdf', 'article', 'notes', 'github', 'other']

export default function Browse() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()

  const [resources, setResources] = useState([])
  const [subjects, setSubjects] = useState([])
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set())
  const [updatingBookmarks, setUpdatingBookmarks] = useState(new Set())

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [bookmarkError, setBookmarkError] = useState('')
  const [bookmarkLoading, setBookmarkLoading] = useState(false)
  const [bookmarkRetry, setBookmarkRetry] = useState(0)

  const [search, setSearch] = useState(params.get('q') || '')
  const [type, setType] = useState(params.get('type') || '')
  const [sort, setSort] = useState('rating')

  const subjectId = params.get('subject') || ''

  // Load resources and subjects.
  useEffect(() => {
    let cancelled = false

    const loadResources = async () => {
      setLoading(true)
      setError('')

      try {
        const [r, s] = await Promise.all([
          supabase.from('resource_stats').select('*'),
          supabase.from('subjects').select('*').order('semester').order('name'),
        ])

        if (r.error) throw r.error
        if (s.error) throw s.error

        if (!cancelled) {
          setResources(r.data || [])
          setSubjects(s.data || [])
        }
      } catch (err) {
        console.error('Failed to load browse data:', err)

        if (!cancelled) {
          setError('Unable to load resources. Please try again.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadResources()

    return () => {
      cancelled = true
    }
  }, [])

  // Load bookmarks whenever the authenticated user changes.
  useEffect(() => {
    let cancelled = false

    const loadBookmarks = async () => {
      if (!user?.id) {
        setBookmarkedIds(new Set())
        setBookmarkError('')
        setBookmarkLoading(false)
        return
      }

      setBookmarkLoading(true)
      setBookmarkError('')

      try {
        const ids = await getBookmarkedResourceIds(user.id)

        if (!cancelled) {
          setBookmarkedIds(ids)
        }
      } catch (err) {
        console.error('Failed to load bookmarks:', err)

        if (!cancelled) {
          setBookmarkError('Unable to load your saved resources.')
        }
      } finally {
        if (!cancelled) {
          setBookmarkLoading(false)
        }
      }
    }

    loadBookmarks()

    return () => {
      cancelled = true
    }
  }, [user?.id, bookmarkRetry])

  // Retry bookmark loading.
  const retryBookmarks = () => {
    setBookmarkRetry((previous) => previous + 1)
  }

  // Toggle bookmark status.
  const handleToggleBookmark = async (resourceId) => {
    if (!user) {
      navigate('/login')
      return
    }

    // Prevent multiple simultaneous updates for the same resource.
    if (updatingBookmarks.has(resourceId)) return

    const isBookmarked = bookmarkedIds.has(resourceId)

    setUpdatingBookmarks((previous) => {
      const next = new Set(previous)
      next.add(resourceId)
      return next
    })

    // Optimistic update.
    setBookmarkedIds((previous) => {
      const next = new Set(previous)

      if (isBookmarked) {
        next.delete(resourceId)
      } else {
        next.add(resourceId)
      }

      return next
    })

    try {
      await toggleBookmark(user.id, resourceId, isBookmarked)
      setBookmarkError('')
    } catch (err) {
      console.error('Failed to update bookmark:', err)

      // Restore the previous bookmark state.
      setBookmarkedIds((previous) => {
        const next = new Set(previous)

        if (isBookmarked) {
          next.add(resourceId)
        } else {
          next.delete(resourceId)
        }

        return next
      })

      setBookmarkError('Could not update your bookmark. Please try again.')
    } finally {
      setUpdatingBookmarks((previous) => {
        const next = new Set(previous)
        next.delete(resourceId)
        return next
      })
    }
  }

  const subjectName = useMemo(
    () => Object.fromEntries(subjects.map((s) => [s.id, s.name])),
    [subjects]
  )

  const semesters = [...new Set(subjects.map((s) => s.semester))]

  // Filter and sort resources.
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()

    return resources
      .filter((r) => !subjectId || r.subject_id === Number(subjectId))
      .filter((r) => !type || r.type === type)
      .filter(
        (r) =>
          !q ||
          r.title.toLowerCase().includes(q) ||
          (r.description || '').toLowerCase().includes(q)
      )
      .sort((a, b) =>
        sort === 'newest'
          ? new Date(b.created_at) - new Date(a.created_at)
          : Number(b.avg_rating) - Number(a.avg_rating) ||
            b.review_count - a.review_count
      )
  }, [resources, search, subjectId, type, sort])

  return (
    <>
      <section className="band bg-navy text-paper">
        <div className="mx-auto max-w-5xl px-6 pb-8 pt-4">
          <h1 className="text-3xl font-semibold tracking-tight">
            {subjectId
              ? subjectName[subjectId] || 'Resources'
              : 'All resources'}
          </h1>

          <div className="mt-5 grid gap-3 text-ink md:grid-cols-[1fr_auto_auto_auto]">
            <input
              aria-label="Search"
              placeholder="Search by title or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="field"
            />

            <select
              aria-label="Subject"
              value={subjectId}
              onChange={(e) =>
                setParams(e.target.value ? { subject: e.target.value } : {})
              }
              className="field"
            >
              <option value="">All subjects</option>

              {semesters.map((sem) => (
                <optgroup key={sem} label={`Semester ${sem}`}>
                  {subjects
                    .filter((s) => s.semester === sem)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>

            <select
              aria-label="Type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="field"
            >
              <option value="">All types</option>
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <select
              aria-label="Sort"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="field"
            >
              <option value="rating">Top rated</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>
      </section>

      <div className="page">
        <div className="flex items-center justify-between">
          <p className="text-sm text-mute">
            {visible.length}{' '}
            {visible.length === 1 ? 'resource' : 'resources'}
          </p>

          {user && (
            <Link
              to="/profile"
              className="text-xs text-pen font-medium hover:underline"
            >
              View your {bookmarkedIds.size} saved{' '}
              {bookmarkedIds.size === 1 ? 'resource' : 'resources'} →
            </Link>
          )}
        </div>

        {/* Bookmark loading and error messages. */}
        {user && bookmarkLoading && (
          <p className="py-2 text-sm text-mute">
            Loading your saved resources...
          </p>
        )}

        {user && bookmarkError && (
          <div
            role="alert"
            className="my-3 flex flex-wrap items-center gap-3 text-sm text-red-700"
          >
            <p>{bookmarkError}</p>

            <button
              onClick={retryBookmarks}
              disabled={bookmarkLoading}
              className="underline font-medium disabled:opacity-50"
            >
              {bookmarkLoading ? 'Retrying...' : 'Retry'}
            </button>
          </div>
        )}

        <div className="stagger mt-2 border-t border-navy">
          {loading &&
            [0, 1, 2, 3].map((i) => (
              <div key={i} className="skeleton my-4 h-20" />
            ))}

          {error && (
            <div role="alert" className="py-6 text-red-700">
              <p>{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 underline font-medium"
              >
                Reload page
              </button>
            </div>
          )}

          {!loading && !error && visible.length === 0 && (
            <p className="py-6">
              Nothing matches yet.{' '}
              <Link
                to="/add"
                className="text-pen underline underline-offset-4"
              >
                Add the first resource
              </Link>{' '}
              for this subject.
            </p>
          )}

          {!error &&
            visible.map((r) => (
              <ResourceCard
                key={r.id}
                resource={r}
                subjectName={subjectName[r.subject_id]}
                isBookmarked={bookmarkedIds.has(r.id)}
                onToggleBookmark={handleToggleBookmark}
              />
            ))}
        </div>
      </div>
    </>
  )
}
