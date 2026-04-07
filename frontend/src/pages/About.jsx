export default function About() {
  const team = [
    'Arjun Kumar',
    'Priya Sharma',
    'Rahul Verma',
    'Sneha Reddy',
    'Karthik Raj',
    'Ananya Iyer',
  ]

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">About</h1>
        <p className="text-slate-600 leading-relaxed">
          This full-stack application demonstrates an <strong>Automated Software Bug Triaging System</strong> suitable for
          academic demos and portfolios. The React dashboard talks to a FastAPI service that runs a scikit-learn pipeline:
          text preprocessing, TF‑IDF vectorization, and multiclass logistic regression to suggest assignees for new tickets.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6 sm:p-8 space-y-4">
        <h2 className="font-semibold text-slate-900">Engineering roster</h2>
        <p className="text-sm text-slate-600">The model predicts among these six developers:</p>
        <ul className="grid sm:grid-cols-2 gap-2 text-sm">
          {team.map((name) => (
            <li key={name} className="flex items-center gap-2 text-slate-800">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              {name}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6 sm:p-8 space-y-3">
        <h2 className="font-semibold text-slate-900">API</h2>
        <ul className="text-sm text-slate-600 space-y-2 list-disc pl-5">
          <li>
            <code className="text-indigo-700 bg-indigo-50 px-1 rounded">POST /predict</code> — submit a bug; returns top-3
            recommendations and persists the row in SQLite.
          </li>
          <li>
            <code className="text-indigo-700 bg-indigo-50 px-1 rounded">GET /bugs</code> — list stored submissions for the
            dashboard.
          </li>
        </ul>
      </div>

      <div className="rounded-xl bg-slate-100 border border-slate-200 px-4 py-3 text-sm text-slate-600">
        <strong className="text-slate-800">Stack:</strong> React (Vite), Tailwind CSS, Chart.js, FastAPI, SQLite, scikit-learn.
      </div>
    </div>
  )
}
