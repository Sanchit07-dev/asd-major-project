import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import {
  getBookmarkedResourceIds,
  toggleBookmark,
} from '../lib/bookmarks'
import ResourceCard from '../components/ResourceCard'
const TYPES = ['video', 'pdf', 'article', 'notes', 'github', 'other']
const PAGE_SIZE = 10
export default function Browse() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const [searchInput, setSearchInput] = useState(
    params.get('q') || ''
  )
  const [resources, setResources] = useState([])
  const [subjects, setSubjects] = useState([])
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set())
  const [updatingBookmarks, setUpdatingBookmarks] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [bookmarkError, setBookmarkError] = useState('')
  const [bookmarkLoading, setBookmarkLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [pagination, setPagination] = useState({
    filterKey: '',
    page: 1,
  })
  const [retryCount, setRetryCount] = useState(0)
  const [bookmarkRetry, setBookmarkRetry] = useState(0)
  // Read filters directly from the URL.
  const search = params.get('q') || ''
  const rawType = params.get('type') || ''
  const type = TYPES.includes(rawType) ? rawType : ''
  const sort = params.get('sort') === 'newest' ? 'newest' : 'rating'
  const subjectId = params.get('subject') || ''
  // Identify the current filter combination.
  const filterKey = JSON.stringify([
    search,
    type,
    subjectId,
    sort,
  ])
  // Use page 1 immediately when the filter combination changes.
  const page =
    pagination.filterKey === filterKey
      ? pagination.page
      : 1
  // Update pagination while keeping it associated with current filters.
  const setPage = (nextPage) => {
    setPagination((previous) => {
      const currentPage =
        previous.filterKey === filterKey
          ? previous.page
          : 1
      const resolvedPage =
        typeof nextPage === 'function'
          ? nextPage(currentPage)
          : nextPage
      return {
        filterKey,
        page: Math.max(1, resolvedPage),
      }
    })
  }
  const totalPages = Math.ceil(totalCount / PAGE_SIZE)
  const hasActiveFilters = Boolean(
  search.trim() || type || subjectId || sort !== 'rating'
)
  // Update a URL parameter while preserving the other parameters.
  const updateParam = (key, value, options = {}) => {
    const nextParams = new URLSearchParams(params)
    if (value) {
      nextParams.set(key, value)
    } else {
      nextParams.delete(key)
    }
    setParams(nextParams, options)
  }
  // Keep the input synchronized with URL changes,
  // including browser back/forward navigation.
  useEffect(() => {
    setSearchInput(search)
  }, [search])
  // Update the URL only after the user stops typing.
  useEffect(() => {
    if (searchInput === search) return
    const timeout = setTimeout(() => {
      const nextParams = new URLSearchParams(params)
      const value = searchInput.trim()
      if (value) {
        nextParams.set('q', value)
      } else {
        nextParams.delete('q')
      }
      if (nextParams.toString() !== params.toString()) {
        setParams(nextParams, { replace: true })
      }
    }, 400)
    return () => clearTimeout(timeout)
  }, [searchInput, search, params, setParams])
  // Load subjects once.
  useEffect(() => {
    let cancelled = false
    const loadSubjects = async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('semester')
        .order('name')
      if (cancelled) return
      if (error) {
        console.error('Failed to load subjects:', error)
        setError('Unable to load subjects. Please try again.')
        return
      }
      setSubjects(data || [])
    }
    loadSubjects()
    return () => {
      cancelled = true
    }
  }, [])
  // Load only the resources required for the current page.
  useEffect(() => {
    let cancelled = false
    const loadResources = async () => {
      setLoading(true)
      setError('')
      try {
        const from = (page - 1) * PAGE_SIZE
        const to = from + PAGE_SIZE - 1
        let query = supabase
          .from('resource_stats')
          .select('*', { count: 'exact' })
        if (subjectId) {
          query = query.eq('subject_id', Number(subjectId))
        }
        if (type) {
          query = query.eq('type', type)
        }
        const q = search.trim()
        if (q) {
          // Escape characters with special meaning in PostgREST filters.
          const safeSearch = q.replace(/[\\%_,"()]/g, '\\$&')
          query = query.or(
            `title.ilike.%${safeSearch}%,description.ilike.%${safeSearch}%`
          )
        }
        if (sort === 'newest') {
          query = query.order('created_at', {
            ascending: false,
          })
        } else {
          query = query
            .order('avg_rating', {
              ascending: false,
              nullsFirst: false,
            })
            .order('review_count', { ascending: false })
            .order('created_at', { ascending: false })
        }
        query = query
          .order('id', { ascending: true })
          .range(from, to)
        const { data, error, count } = await query
        if (error) throw error
        if (!cancelled) {
          setResources(data || [])
          setTotalCount(count || 0)
        }
      } catch (err) {
        console.error('Failed to load resources:', err)
        if (!cancelled) {
          setError('Unable to load resources. Please try again.')
          setResources([])
          setTotalCount(0)
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
  }, [page, search, type, subjectId, sort, retryCount])
  // Load bookmarks for the current user.
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
  const retryResources = () => {
    setRetryCount((previous) => previous + 1)
  }
  const retryBookmarks = () => {
    setBookmarkRetry((previous) => previous + 1)
  }
  // Clear all active search and filter options.
  const clearFilters = () => {
    const nextParams = new URLSearchParams(params)
    nextParams.delete('q')
    nextParams.delete('subject')
    nextParams.delete('type')
    nextParams.delete('sort')
    setParams(nextParams)
    setSearchInput('')
    setPage(1)
  }
  // Toggle bookmark status.
  const handleToggleBookmark = async (resourceId) => {
    if (!user) {
      navigate('/login')
      return
    }
    if (updatingBookmarks.has(resourceId)) return
    const isBookmarked = bookmarkedIds.has(resourceId)
    setUpdatingBookmarks((previous) => {
      const next = new Set(previous)
      next.add(resourceId)
      return next
    })
    // Optimistically update the bookmark state.
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
      // Restore the previous state if the request fails.
      setBookmarkedIds((previous) => {
        const next = new Set(previous)
        if (isBookmarked) {
          next.add(resourceId)
        } else {
          next.delete(resourceId)
        }
        return next
      })
      setBookmarkError(
        'Could not update your bookmark. Please try again.'
      )
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
  // Generate a maximum of five visible page numbers.
  const pageNumbers = useMemo(() => {
    const start = Math.max(
      1,
      Math.min(page - 2, totalPages - 4)
    )
    const end = Math.min(totalPages, start + 4)
    return Array.from(
      { length: end - start + 1 },
      (_, index) => start + index
    )
  }, [page, totalPages])
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
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="field"
            />
            <select
              aria-label="Subject"
              value={subjectId}
              onChange={(e) => updateParam('subject', e.target.value)}
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
              onChange={(e) => updateParam('type', e.target.value)}
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
              onChange={(e) => updateParam('sort', e.target.value)}
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
            {totalCount} {totalCount === 1 ? 'resource' : 'resources'}
          </p>
          <div className="flex items-center gap-4">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-medium text-pen hover:underline"
              >
                Clear filters
              </button>
            )}
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
        </div>
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
              type="button"
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
            <div
              role="alert"
              className="my-8 rounded border border-red-200 bg-red-50 p-5"
            >
              <h2 className="font-semibold text-red-800">
                Unable to load resources
              </h2>
              <p className="mt-1 text-sm text-red-700">
                {error}
              </p>
              <button
                type="button"
                onClick={retryResources}
                disabled={loading}
                className="mt-3 rounded border border-red-300 px-4 py-2 text-sm font-medium text-red-800 hover:bg-red-100 disabled:opacity-50"
              >
                {loading ? 'Retrying...' : 'Try again'}
              </button>
            </div>
          )}
          {!loading && !error && resources.length === 0 && (
            <div className="py-12 text-center">
              {hasActiveFilters ? (
                <>
                  <h2 className="text-lg font-semibold text-ink">
                    No matching resources found
                  </h2>
                  <p className="mt-2 text-sm text-mute">
                    Try changing your search or selecting different filters.
                  </p>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-4 rounded border border-navy px-4 py-2 text-sm font-medium text-navy hover:bg-slate-50"
                  >
                    Clear all filters
                  </button>
                </>
              ) : (
                <>
                  <h2 className="text-lg font-semibold text-ink">
                    No resources available yet
                  </h2>
                  <p className="mt-2 text-sm text-mute">
                    Be the first to contribute a learning resource.
                  </p>
                  <Link
                    to="/add"
                    className="mt-4 inline-block rounded bg-navy px-4 py-2 text-sm font-medium text-paper hover:opacity-90"
                  >
                    Add a resource
                  </Link>
                </>
              )}
            </div>
          )}
          {!loading &&
            !error &&
            resources.map((r) => (
              <ResourceCard
                key={r.id}
                resource={r}
                subjectName={subjectName[r.subject_id]}
                isBookmarked={bookmarkedIds.has(r.id)}
                onToggleBookmark={handleToggleBookmark}
              />
            ))}
        </div>
        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setPage((previous) => previous - 1)}
              disabled={page === 1}
              className="rounded border border-rule px-3 py-2 text-sm font-medium text-ink hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            {pageNumbers.map((number) => (
              <button
                key={number}
                type="button"
                onClick={() => setPage(number)}
                aria-current={page === number ? 'page' : undefined}
                className={`min-w-10 rounded border px-3 py-2 text-sm font-medium transition ${
                  page === number
                    ? 'border-navy bg-navy text-paper'
                    : 'border-rule text-ink hover:bg-slate-50'
                }`}
              >
                {number}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPage((previous) => previous + 1)}
              disabled={page === totalPages}
              className="rounded border border-rule px-3 py-2 text-sm font-medium text-ink hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
        {!loading && !error && totalCount > 0 && (
          <p className="mt-3 text-center text-xs text-mute">
            Showing {(page - 1) * PAGE_SIZE + 1}–
            {Math.min(page * PAGE_SIZE, totalCount)} of {totalCount} resources
          </p>
        )}
      </div>
    </>
  )
}
