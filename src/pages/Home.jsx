import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [subjects, setSubjects] = useState([])
  const [counts, setCounts] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('subjects').select('*').order('semester').order('name'),
      supabase.from('resources').select('subject_id'),
    ]).then(([s, r]) => {
      setSubjects(s.data || [])
      const c = {}
      ;(r.data || []).forEach((x) => { c[x.subject_id] = (c[x.subject_id] || 0) + 1 })
      setCounts(c)
      setLoading(false)
    })
  }, [])

  const semesters = [...new Set(subjects.map((s) => s.semester))]

  return (
    <>
      <section className="band bg-navy text-paper">
        <div className="mx-auto max-w-5xl px-6 pb-16 pt-12">
          <h1 className="max-w-2xl text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
            Study material for every NST subject, rated by the students who used it.
          </h1>
          <div className="mt-8 flex flex-wrap items-center gap-6">
            <Link to="/browse" className="btn">Browse resources</Link>
            <Link to="/add" className="navlink">Add a resource</Link>
          </div>
        </div>
      </section>

      <div className="page">
        <h2 className="text-2xl font-semibold">Find your subject</h2>
        <div className="stagger mt-4 border-t border-navy">
          {loading && [0, 1, 2].map((i) => <div key={i} className="skeleton my-4 h-16" />)}
          {semesters.map((sem) => (
            <section key={sem} className="grid gap-4 border-b border-rule py-6 md:grid-cols-[10rem_1fr]">
              <h3 className="text-xl font-semibold text-navy">Semester {sem}</h3>
              <ul>
                {subjects.filter((s) => s.semester === sem).map((s) => (
                  <li key={s.id}>
                    <Link to={`/browse?subject=${s.id}`} className="-mx-2 flex justify-between gap-4 px-2 py-2 transition-colors hover:bg-white">
                      <span>{s.name}</span>
                      <span className="text-mute">
                        {counts[s.id] || 0} {counts[s.id] === 1 ? 'resource' : 'resources'}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </>
  )
}
