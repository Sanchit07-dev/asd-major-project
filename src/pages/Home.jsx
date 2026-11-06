import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { intro } from '../lib/intro'

const TYPES = ['video', 'pdf', 'article', 'notes', 'github']
const glass = 'border border-white/10 bg-white/10 backdrop-blur-md'
const gradientText = 'bg-linear-to-r from-white to-amber-200 bg-clip-text text-transparent'

function Orb({ className, duration, drift }) {
  return (
    <motion.div
      aria-hidden="true"
      className={`absolute rounded-full blur-3xl ${className}`}
      animate={{ x: [0, drift, 0], y: [0, -drift, 0], scale: [1, 1.18, 1], opacity: [0.7, 1, 0.7] }}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}

export default function Home() {
  const navigate = useNavigate()
  const [d] = useState(intro.played ? 0 : 1.2)
  const [subjects, setSubjects] = useState([])
  const [counts, setCounts] = useState({})
  const [stats, setStats] = useState({ resources: 0, avg: null })
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [type, setType] = useState('')

  useEffect(() => {
    Promise.all([
      supabase.from('subjects').select('*').order('semester').order('name'),
      supabase.from('resources').select('subject_id'),
      supabase.from('reviews').select('rating'),
    ]).then(([s, r, rv]) => {
      const res = r.data || []
      const c = {}
      res.forEach((x) => { c[x.subject_id] = (c[x.subject_id] || 0) + 1 })
      const ratings = (rv.data || []).map((x) => x.rating)
      setSubjects(s.data || [])
      setCounts(c)
      setStats({
        resources: res.length,
        avg: ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null,
      })
      setLoading(false)
    })
  }, [])

  function search(e) {
    e.preventDefault()
    const p = new URLSearchParams()
    if (q.trim()) p.set('q', q.trim())
    if (type) p.set('type', type)
    navigate(`/browse?${p}`)
  }

  const semesters = [...new Set(subjects.map((s) => s.semester))]
  const badges = [
    { value: stats.resources, label: 'resources shared' },
    { value: subjects.length, label: 'subjects covered' },
    ...(stats.avg ? [{ value: `★ ${stats.avg.toFixed(1)}`, label: 'average student rating' }] : []),
  ]

  return (
    <div className="relative overflow-hidden bg-linear-to-b from-midnight via-[#0f1f4d] to-navy-dark pb-24 text-white">
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[40rem]"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.4, delay: d, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="grid-bg absolute inset-0" />
        <Orb className="-left-24 top-10 h-96 w-96 bg-navy" duration={11} drift={40} />
        <Orb className="right-0 top-40 h-80 w-80 bg-amber/30" duration={9} drift={30} />
        <Orb className="left-1/3 top-72 h-72 w-72 bg-blue-500/20" duration={13} drift={50} />
      </motion.div>

      <section className="relative mx-auto grid max-w-5xl items-center gap-12 px-6 pb-16 pt-36 md:grid-cols-[1.5fr_1fr]">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -40, filter: 'blur(12px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, delay: d + 0.2, ease: 'easeOut' }}
            className={`pb-1 text-4xl font-semibold leading-tight tracking-tight md:text-6xl ${gradientText}`}
          >
            Study material for every NST subject, rated by the students who used it.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: d + 0.6 }}
            className="mt-5 max-w-xl font-read text-lg leading-relaxed text-white/70"
          >
            Find what to study for your syllabus, and add the links that helped you.
          </motion.p>
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 380, damping: 14, delay: d + 0.8 }}
            className="mt-8 flex flex-wrap items-center gap-4"
          >
            <Link to="/browse" className="btn cta px-6 py-3 text-base transition-transform duration-200 hover:scale-105">
              Browse resources
            </Link>
            <Link to="/add" className={`${glass} rounded-md px-6 py-3 text-base font-medium transition-colors hover:bg-white/15`}>
              Add a resource
            </Link>
          </motion.div>
        </div>

        <div className="flex flex-col gap-4 md:items-end">
          {badges.map((b, i) => (
            <motion.div
              key={b.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 16, delay: d + 0.9 + i * 0.15 }}
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut' }}
                className={`${glass} rounded-2xl px-5 py-4 shadow-[0_0_30px_rgba(245,158,11,0.08)]`}
              >
                <div className="text-2xl font-semibold text-amber">{b.value}</div>
                <div className="text-sm text-white/70">{b.label}</div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </section>

      <motion.form
        onSubmit={search}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: d + 1.1 }}
        className={`${glass} relative mx-auto max-w-5xl rounded-2xl p-4 md:mx-auto`}
      >
        <div className="flex flex-col gap-3 md:flex-row">
          <input
            aria-label="Search resources"
            placeholder="Search by title or description"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full rounded-md border border-white/15 bg-white/10 px-4 py-3 text-white placeholder-white/50"
          />
          <button className="btn px-6 py-3">Search</button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Resource type">
          {TYPES.map((t) => (
            <button
              type="button"
              key={t}
              aria-pressed={type === t}
              onClick={() => setType(type === t ? '' : t)}
              className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                type === t ? 'border-amber bg-amber text-midnight' : 'border-white/20 text-white/80 hover:border-amber/60'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </motion.form>

      <section className="relative mx-auto mt-20 max-w-5xl px-6">
        <h2 className={`pb-1 text-3xl font-semibold tracking-tight ${gradientText}`}>Find your subject</h2>
        {loading && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-white/10" />)}
          </div>
        )}
        {semesters.map((sem) => (
          <div key={sem} className="mt-10">
            <h3 className="mb-4 text-lg font-semibold text-amber-200">Semester {sem}</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {subjects.filter((s) => s.semester === sem).map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                >
                  <Link
                    to={`/browse?subject=${s.id}`}
                    className={`${glass} block rounded-2xl p-5 shadow-lg shadow-black/20 transition duration-200 hover:-translate-y-1 hover:border-amber/60 hover:shadow-[0_10px_30px_rgba(245,158,11,0.18)]`}
                  >
                    <div className="font-semibold">{s.name}</div>
                    <div className="mt-2 text-sm text-white/60">
                      <span className="text-amber">{counts[s.id] || 0}</span> {counts[s.id] === 1 ? 'resource' : 'resources'}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}
