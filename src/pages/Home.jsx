import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [subjects, setSubjects] = useState([])
  const [counts, setCounts] = useState({})

  useEffect(() => {
    Promise.all([
      supabase.from('subjects').select('*').order('semester').order('name'),
      supabase.from('resources').select('subject_id'),
    ]).then(([s, r]) => {
      setSubjects(s.data || [])
      const c = {}
      ;(r.data || []).forEach((x) => { c[x.subject_id] = (c[x.subject_id] || 0) + 1 })
      setCounts(c)
    })
  }, [])

  const semesters = [...new Set(subjects.map((s) => s.semester))]

  return (
    <div className="page">
      <h1 className="max-w-2xl text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
        Study material for every NST subject, rated by the students who used it.
      </h1>
      <p className="mt-5 max-w-xl font-read text-lg leading-relaxed text-mute">
        Pick your subject below, or <Link to="/add" className="text-pen underline underline-offset-4">add a link</Link> that helped you.
      </p>

      <div className="mt-14 border-t border-ink">
        {semesters.map((sem) => (
          <section key={sem} className="grid gap-4 border-b border-rule py-6 md:grid-cols-[10rem_1fr]">
            <h2 className="text-xl font-semibold">Semester {sem}</h2>
            <ul>
              {subjects.filter((s) => s.semester === sem).map((s) => (
                <li key={s.id}>
                  <Link to={`/browse?subject=${s.id}`} className="-mx-2 flex justify-between gap-4 px-2 py-2 hover:bg-white">
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
  )
}
