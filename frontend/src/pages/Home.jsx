import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="space-y-10">
      <section className="gradient-hero rounded-2xl shadow-lift text-white p-8 sm:p-12 overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.06\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-80" />
        <div className="relative max-w-2xl">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Automated Software Bug Triaging System
          </h1>
          <p className="text-lg text-slate-200/95 leading-relaxed mb-8">
            Submit bug reports in natural language. Our NLP pipeline extracts signals from the text, scores each engineer with
            TF‑IDF features and logistic regression, and recommends the top three owners—so triage is faster and more consistent.
          </p>
          <Link
            to="/submit"
            className="inline-flex items-center gap-2 rounded-xl bg-white text-slate-900 px-6 py-3.5 font-semibold shadow-lg hover:bg-indigo-50 transition-colors"
          >
            Get started
            <span aria-hidden>→</span>
          </Link>
        </div>
      </section>

      <section className="grid sm:grid-cols-3 gap-6">
        {[
          {
            title: 'NLP preprocessing',
            body: 'Lowercasing, tokenization, and stopword removal prepare unstructured bug text for reliable matching.',
            icon: '📝',
          },
          {
            title: 'TF‑IDF + ML',
            body: 'Term importance vectors feed a multiclass logistic regression model trained on historical assignments.',
            icon: '⚙️',
          },
          {
            title: 'Top‑3 confidence',
            body: 'See ranked developers with calibrated display scores and raw model probabilities for transparency.',
            icon: '📊',
          },
        ].map((c) => (
          <div
            key={c.title}
            className="bg-white rounded-xl p-6 shadow-card border border-slate-100 hover:border-indigo-100 transition-colors"
          >
            <span className="text-3xl mb-3 block">{c.icon}</span>
            <h2 className="font-semibold text-slate-900 mb-2">{c.title}</h2>
            <p className="text-sm text-slate-600 leading-relaxed">{c.body}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
