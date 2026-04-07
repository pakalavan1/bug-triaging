import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { predictBug } from '../api.js'

const SEVERITIES = ['Critical', 'High', 'Medium', 'Low']

export default function SubmitBug() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [severity, setSeverity] = useState('Medium')
  const [component, setComponent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!title.trim() || !description.trim()) {
      setError('Please enter a title and description.')
      return
    }
    setLoading(true)
    try {
      const result = await predictBug({
        title: title.trim(),
        description: description.trim(),
        severity,
        component: component.trim(),
      })
      navigate('/results', { state: { result, form: { title, description, severity, component } } })
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Submit a bug report</h1>
      <p className="text-slate-600 mb-8">
        Describe the issue clearly. Severity and component help the model align with how your team routes work.
      </p>

      {error && (
        <div
          className="mb-6 rounded-xl border border-red-200 bg-red-50 text-red-800 px-4 py-3 text-sm"
          role="alert"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-card border border-slate-100 p-6 sm:p-8 space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1.5">
            Bug title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
            placeholder="Short summary"
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="desc" className="block text-sm font-medium text-slate-700 mb-1.5">
            Description
          </label>
          <textarea
            id="desc"
            rows={6}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-y min-h-[140px]"
            placeholder="Steps to reproduce, expected vs actual behavior, environment…"
            disabled={loading}
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="sev" className="block text-sm font-medium text-slate-700 mb-1.5">
              Severity
            </label>
            <select
              id="sev"
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
              disabled={loading}
            >
              {SEVERITIES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="comp" className="block text-sm font-medium text-slate-700 mb-1.5">
              Component / module
            </label>
            <input
              id="comp"
              type="text"
              value={component}
              onChange={(e) => setComponent(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="e.g. Auth API, Web UI"
              disabled={loading}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto min-w-[200px] rounded-xl gradient-accent text-white font-semibold py-3.5 px-8 shadow-lg hover:opacity-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-opacity"
        >
          {loading ? (
            <>
              <span
                className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"
                aria-hidden
              />
              Analyzing…
            </>
          ) : (
            'Analyze & predict assignee'
          )}
        </button>
      </form>
    </div>
  )
}
