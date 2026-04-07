import { useEffect, useMemo, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { Link } from 'react-router-dom'
import { fetchBugs } from '../api.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const COLORS = [
  'rgba(99, 102, 241, 0.85)',
  'rgba(14, 165, 233, 0.85)',
  'rgba(16, 185, 129, 0.85)',
  'rgba(245, 158, 11, 0.85)',
  'rgba(236, 72, 153, 0.85)',
  'rgba(139, 92, 246, 0.85)',
]

export default function Dashboard() {
  const [bugs, setBugs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError('')
      try {
        const data = await fetchBugs()
        if (!cancelled) setBugs(Array.isArray(data) ? data : [])
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to load bugs.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const stats = useMemo(() => {
    const counts = {}
    for (const b of bugs) {
      const d = b.predicted_developer || 'Unknown'
      counts[d] = (counts[d] || 0) + 1
    }
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1])
    const topDev = entries[0]?.[0] ?? '—'
    const topCount = entries[0]?.[1] ?? 0
    return { counts, entries, topDev, topCount, total: bugs.length }
  }, [bugs])

  const chartData = useMemo(() => {
    const labels = stats.entries.map(([name]) => name)
    const values = stats.entries.map(([, n]) => n)
    return {
      labels,
      datasets: [
        {
          label: 'Assignments (predicted)',
          data: values,
          backgroundColor: labels.map((_, i) => COLORS[i % COLORS.length]),
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    }
  }, [stats.entries])

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Predicted developer distribution',
        font: { size: 15, weight: '600' },
        color: '#0f172a',
        padding: { bottom: 16 },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.parsed.y} bug(s)`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#64748b', maxRotation: 45, minRotation: 0 },
      },
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, color: '#64748b' },
        grid: { color: 'rgba(148, 163, 184, 0.2)' },
      },
    },
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <span
          className="h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"
          aria-hidden
        />
        <p className="text-slate-600 font-medium">Loading dashboard…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 text-red-800 px-4 py-3">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Dashboard</h1>
        <p className="text-slate-600">Historical bug submissions and triage outcomes stored in the system.</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-card border border-slate-100 p-6">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Total bugs</p>
          <p className="text-3xl font-bold text-slate-900 mt-1 tabular-nums">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-card border border-slate-100 p-6 sm:col-span-2">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Top developer (by count)</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{stats.topDev}</p>
          <p className="text-sm text-slate-600 mt-1">
            {stats.total ? `${stats.topCount} assignment${stats.topCount !== 1 ? 's' : ''}` : 'Submit bugs to see stats'}
          </p>
        </div>
      </div>

      {stats.total === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
          <p className="text-slate-600 mb-4">No bug reports yet.</p>
          <Link to="/submit" className="text-indigo-600 font-semibold hover:underline">
            Submit the first bug →
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6 h-[320px] sm:h-[380px]">
            <Bar data={chartData} options={chartOptions} />
          </div>

          <div className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Recent bug reports</h2>
            </div>
            <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 font-medium">When</th>
                    <th className="px-4 py-3 font-medium">Title</th>
                    <th className="px-4 py-3 font-medium">Severity</th>
                    <th className="px-4 py-3 font-medium">Predicted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bugs.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{b.created_at}</td>
                      <td className="px-4 py-3 text-slate-900 font-medium max-w-[200px] truncate" title={b.title}>
                        {b.title}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                          {b.severity}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-indigo-600 font-medium">{b.predicted_developer}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
