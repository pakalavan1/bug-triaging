import { useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'

export default function Results() {
  const location = useLocation()
  const navigate = useNavigate()
  const result = location.state?.result
  const form = location.state?.form

  useEffect(() => {
    if (!result) {
      navigate('/submit', { replace: true })
    }
  }, [result, navigate])

  if (!result) return null

  const { predicted_developer, top3, message } = result

  return (
    <div className="space-y-8">
      <div
        className="rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-900 px-4 py-3 text-sm font-medium"
        role="status"
      >
        ✓ {message || 'Prediction complete. Review the recommended assignees below.'}
      </div>

      <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 rounded-2xl shadow-lift text-white p-8 sm:p-10">
        <p className="text-indigo-200 text-sm font-medium uppercase tracking-wider mb-2">Recommended assignee</p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">{predicted_developer}</h1>
        {form && (
          <p className="text-indigo-100/90 text-sm max-w-xl leading-relaxed">
            <span className="text-white/80">Severity:</span> {form.severity}
            {form.component ? (
              <>
                {' '}
                · <span className="text-white/80">Component:</span> {form.component}
              </>
            ) : null}
          </p>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-6">Top 3 developers</h2>
        <div className="space-y-6 mb-8">
          {top3.map((row, i) => (
            <div key={row.developer}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium text-slate-800">
                  #{i + 1} {row.developer}
                </span>
                <span className="tabular-nums text-indigo-600 font-semibold">{row.confidence_percent.toFixed(2)}%</span>
              </div>
              <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full gradient-accent transition-all duration-500"
                  style={{ width: `${Math.min(100, row.confidence_percent)}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Model P(assignee): {row.raw_probability_percent.toFixed(2)}%
              </p>
            </div>
          ))}
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-medium">
              <tr>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Developer</th>
                <th className="px-4 py-3 text-right">Confidence</th>
                <th className="px-4 py-3 text-right">Raw P(%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {top3.map((row, i) => (
                <tr key={row.developer} className="bg-white hover:bg-slate-50/80">
                  <td className="px-4 py-3 text-slate-500">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{row.developer}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-indigo-600 font-medium">
                    {row.confidence_percent.toFixed(2)}%
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-slate-600">
                    {row.raw_probability_percent.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-slate-500 mt-4 leading-relaxed">
          Display confidence is scaled for demo clarity (typically 80–95% for the lead). Raw probability reflects the
          classifier output across all developers.
        </p>
      </div>

      <div className="flex flex-wrap gap-4">
        <Link
          to="/submit"
          className="inline-flex rounded-xl bg-slate-900 text-white px-6 py-3 font-medium hover:bg-slate-800 transition-colors"
        >
          Submit another bug
        </Link>
        <Link
          to="/dashboard"
          className="inline-flex rounded-xl border border-slate-200 bg-white px-6 py-3 font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          View dashboard
        </Link>
      </div>
    </div>
  )
}
