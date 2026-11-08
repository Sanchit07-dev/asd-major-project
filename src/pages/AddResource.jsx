import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Field from '../components/Field'

const TYPES = ['video', 'pdf', 'article', 'notes', 'github', 'other']

export default function AddResource() {
  const navigate = useNavigate()

  const [subjects, setSubjects] = useState([])
  const [topics, setTopics] = useState([])

  const [form, setForm] = useState({
    title: '',
    url: '',
    type: 'video',
    description: '',
    subject_id: '',
    topic_id: '',
  })

  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    async function fetchSubjects() {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('semester')
        .order('name')

      if (error) {
        setError(error.message)
        return
      }

      setSubjects(data || [])
    }

    fetchSubjects()
  }, [])

  useEffect(() => {
    async function fetchTopics() {
      if (!form.subject_id) {
        setTopics([])
        return
      }

      const { data, error } = await supabase
        .from('topics')
        .select('*')
        .eq('subject_id', form.subject_id)
        .order('name')

      if (error) {
        setError(error.message)
        setTopics([])
        return
      }

      setTopics(data || [])
    }

    fetchTopics()
  }, [form.subject_id])

  const set = (key) => (e) => {
    setForm({ ...form, [key]: e.target.value })
  }

  const semesters = [...new Set(subjects.map((s) => s.semester))]
  const topicOptions = form.subject_id ? topics : []

  async function handleSubmit(e) {
    e.preventDefault()

    setError('')
    setBusy(true)

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        setError('Please log in before submitting a resource.')
        return
      }

      const { data, error } = await supabase
        .from('resources')
        .insert({
          title: form.title.trim(),
          url: form.url.trim(),
          type: form.type,
          description: form.description.trim() || null,
          subject_id: Number(form.subject_id),
          topic_id: form.topic_id
            ? Number(form.topic_id)
            : null,
        })
        .select()
        .single()

      if (error) {
        setError(error.message)
        return
      }

      navigate(`/resource/${data.id}`)
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-14">
      <h1 className="text-3xl font-semibold tracking-tight">
        Add a resource
      </h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Field label="Title">
          <input
            required
            value={form.title}
            onChange={set('title')}
            className="field"
          />
        </Field>

        <Field label="URL">
          <input
            required
            type="url"
            placeholder="https://..."
            value={form.url}
            onChange={set('url')}
            className="field"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Semester">
            <select
              required
              value={
                subjects.find(
                  (s) => s.id === Number(form.subject_id)
                )?.semester || ''
              }
              onChange={(e) => {
                const first = subjects.find(
                  (s) => s.semester === Number(e.target.value)
                )

                setForm({
                  ...form,
                  subject_id: first ? String(first.id) : '',
                  topic_id: '',
                })
              }}
              className="field"
            >
              <option value="">Select semester</option>

              {semesters.map((s) => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Subject">
            <select
              required
              value={form.subject_id}
              onChange={set('subject_id')}
              className="field"
            >
              <option value="">Select subject</option>

              {subjects
                .filter((s) => {
                  const currentSem = subjects.find(
                    (x) => x.id === Number(form.subject_id)
                  )?.semester

                  return !currentSem || s.semester === currentSem
                })
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
            </select>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Topic (optional)">
            <select
              value={form.topic_id}
              onChange={set('topic_id')}
              className="field"
              disabled={!topicOptions.length}
            >
              <option value="">Select topic</option>

              {topicOptions.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Type">
            <select
              value={form.type}
              onChange={set('type')}
              className="field"
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Description (optional)">
          <textarea
            rows={3}
            value={form.description}
            onChange={set('description')}
            className="field font-read"
          />
        </Field>

        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}

        <button disabled={busy} className="btn w-full">
          {busy ? 'Submitting...' : 'Submit resource'}
        </button>
      </form>
    </div>
  )
}