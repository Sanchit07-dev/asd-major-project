import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const TYPES = ['video', 'pdf', 'article', 'notes', 'github', 'other']

export default function AddResource() {
  const navigate = useNavigate()
  const [subjects, setSubjects] = useState([])
  const [topics, setTopics] = useState([])
  const [form, setForm] = useState({
    title: '', url: '', type: 'video', description: '', subject_id: '', topic_id: '',
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    supabase.from('subjects').select('*').order('semester').order('name')
      .then(({ data }) => setSubjects(data || []))
  }, [])

  useEffect(() => {
    if (!form.subject_id) { setTopics([]); return }
    supabase.from('topics').select('*').eq('subject_id', form.subject_id).order('name')
      .then(({ data }) => setTopics(data || []))
  }, [form.subject_id])

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    const { data, error } = await supabase
      .from('resources')
      .insert({
        title: form.title.trim(),
        url: form.url.trim(),
        type: form.type,
        description: form.description.trim() || null,
        subject_id: Number(form.subject_id),
        topic_id: form.topic_id ? Number(form.topic_id) : null,
      })
      .select()
      .single()
    setBusy(false)
    if (error) setError(error.message)
    else navigate(`/resource/${data.id}`)
  }

  const field = 'w-full p-2 rounded bg-slate-700 outline-none'

  return (
    <div className="max-w-lg mx-auto mt-8 p-6 rounded-xl bg-slate-800 text-white">
      <h1 className="text-2xl font-bold mb-4">Share a resource</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input required placeholder="Title" value={form.title} onChange={set('title')} className={field} />
        <input required type="url" placeholder="Link (https://...)" value={form.url} onChange={set('url')} className={field} />
        <select value={form.type} onChange={set('type')} className={field}>
          {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select required value={form.subject_id} onChange={(e) => setForm({ ...form, subject_id: e.target.value, topic_id: '' })} className={field}>
          <option value="">Select subject</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>Sem {s.semester} - {s.name}</option>
          ))}
        </select>
        <select value={form.topic_id} onChange={set('topic_id')} className={field} disabled={!topics.length}>
          <option value="">Topic (optional)</option>
          {topics.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <textarea
          rows={3}
          placeholder="Why is this useful? (optional)"
          value={form.description}
          onChange={set('description')}
          className={field}
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button disabled={busy} className="w-full p-2 rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50">
          {busy ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  )
}
