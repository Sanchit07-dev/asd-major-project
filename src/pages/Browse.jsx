import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import ResourceCard from '../components/ResourceCard'

const TYPES = ['video', 'pdf', 'article', 'notes', 'github', 'other']

export default function Browse() {
  const [resources, setResources] = useState([])
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [semester, setSemester] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [type, setType] = useState('')
  const [sort, setSort] = useState('rating')

  useEffect(() => {
    async function load() {
      const [r, s] = await Promise.all([
        supabase.from('resource_stats').select('*'),
        supabase.from('subjects').select('*').order('semester').order('name'),
      ])
      if (r.error || s.error) setError((r.error || s.error).message)
      setResources(r.data || [])
      setSubjects(s.data || [])
      setLoading(false)
    }
    load()
  }, [])

  const subjectMap = useMemo(
    () => Object.fromEntries(subjects.map((s) => [s.id, s])),
    [subjects]
  )
  const semesters = [...new Set(subjects.map((s) => s.semester))]
  const subjectOptions = subjects.filter((s) => !semester || s.semester === Number(semester))

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    return resources
      .filter((r) => !subjectId || r.subject_id === Number(subjectId))
      .filter((r) => !semester || subjectMap[r.subject_id]?.semester === Number(semester))
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
          : Number(b.avg_rating) - Number(a.avg_rating) || b.review_count - a.review_count
      )
  }, [resources, subjectMap, search, semester, subjectId, type, sort])

  const field = 'p-2 rounded bg-slate-800 text-white outline-none'

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-white mb-4">Browse resources</h1>

      <div className="flex flex-wrap gap-3 mb-6">
        <input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`${field} flex-1 min-w-[200px]`}
        />
        <select value={semester} onChange={(e) => { setSemester(e.target.value); setSubjectId('') }} className={field}>
          <option value="">All semesters</option>
          {semesters.map((s) => <option key={s} value={s}>Semester {s}</option>)}
        </select>
        <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className={field}>
          <option value="">All subjects</option>
          {subjectOptions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select value={type} onChange={(e) => setType(e.target.value)} className={field}>
          <option value="">All types</option>
          {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className={field}>
          <option value="rating">Top rated</option>
          <option value="newest">Newest</option>
        </select>
      </div>

      {loading && <p className="text-slate-400">Loading...</p>}
      {error && <p className="text-red-400">{error}</p>}
      {!loading && visible.length === 0 && (
        <p className="text-slate-400">No resources found. Be the first to add one!</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((r) => (
          <ResourceCard key={r.id} resource={r} subjectName={subjectMap[r.subject_id]?.name} />
        ))}
      </div>
    </div>
  )
}
