import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Field from '../components/Field'

const TYPES = ['video', 'pdf', 'article', 'notes', 'github', 'other']

export default function AddResource() {
  const navigate = useNavigate()
  const [subjects, setSubjects] = useState([])
  const [topics, setTopics] = useState([])
  const [form, setForm] = useState({ title: '', url: '', type: 'video', description: '', subject_id: '', topic_id: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    supabase.from('subjects').select('*').order('semester').order('name').then(({ data }) => setSubjects(data || []))
  }, [])

  useEffect(() => {
    if (!form.subject_id) return
    supabase.from('topics').select('*').eq('subject_id', form.subject_id).order('name').then(({ data }) => setTopics(data || []))
  }, [form.subject_id])

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })
  const semesters = [...new Set(subjects.map((s) => s.semester))]
  const topicOptions = form.subject_id ? topics : []

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

  return (
    <div className="mx-auto max-w-xl px-6 py-14">
      <h1 className="text-3xl font-semibold tracking-tight">Add a resource</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Field label="Title">
          <input required value={form.title} onChange={set('title')} className="field" />
        </Field>
        <Field label="Link">
          <input required type="url" placeholder="https://" value={form.url} onChange={set('url')} className="field" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Type">
            <select value={form.type} onChange={set('type')} className="field">
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Subject">
            <select required value={form.subject_id} onChange={(e) => setForm({ ...form, subject_id: e.target.value, topic_id: '' })} className="field">
              <option value="">Choose a subject</option>
              {semesters.map((sem) => (
                <optgroup key={sem} label={`Semester ${sem}`}>
                  {subjects.filter((s) => s.semester === sem).map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Topic (optional)">
          <select value={form.topic_id} onChange={set('topic_id')} disabled={!topicOptions.length} className="field">
            <option value="">No specific topic</option>
            {topicOptions.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </Field>
        <Field label="Why is it useful? (optional)">
          <textarea rows={3} value={form.description} onChange={set('description')} className="field font-read" />
        </Field>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <button disabled={busy} className="btn">{busy ? 'Adding...' : 'Add resource'}</button>
      </form>
    </div>
  )
}
