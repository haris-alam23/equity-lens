import LoadingCard from './LoadingCard'

function SignalGauge({ score }) {
  const radius = 54
  const circumference = Math.PI * radius // half-circle
  const progress = (score / 100) * circumference
  const offset = circumference - progress

  const color =
    score >= 60 ? '#22c55e' : score <= 40 ? '#ef4444' : '#f59e0b'

  return (
    <svg width="140" height="80" viewBox="0 0 140 80">
      {/* Track */}
      <path
        d="M 16 72 A 54 54 0 0 1 124 72"
        fill="none"
        stroke="#2a2d3a"
        strokeWidth="10"
        strokeLinecap="round"
      />
      {/* Progress */}
      <path
        d="M 16 72 A 54 54 0 0 1 124 72"
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
      {/* Score text */}
      <text x="70" y="62" textAnchor="middle" fill="white" fontSize="24" fontWeight="700" fontFamily="JetBrains Mono, monospace">
        {score}
      </text>
    </svg>
  )
}

function labelStyles(label) {
  if (label === 'Bullish') return 'bg-green-950 text-bullish border-green-800'
  if (label === 'Bearish') return 'bg-red-950 text-bearish border-red-800'
  return 'bg-yellow-950 text-neutral border-yellow-800'
}

export default function MarketSignal({ data, loading, error }) {
  if (loading) return <LoadingCard title="Computing market signal..." />
  if (error) return <ErrorCard message={error} />
  if (!data) return null

  const { score, label, explanation } = data

  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-5">
        Market Signal
      </h3>

      <div className="flex flex-col items-center mb-4">
        <SignalGauge score={score} />
        <span className={`label-tag border mt-3 ${labelStyles(label)}`}>
          {label === 'Bullish' && '↑ '}
          {label === 'Bearish' && '↓ '}
          {label === 'Neutral' && '→ '}
          {label}
        </span>
      </div>

      <div className="mt-4 p-4 bg-surface rounded-xl border border-border">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
          Explanation
        </p>
        <p className="text-sm text-gray-300 leading-relaxed">{explanation}</p>
      </div>

      <div className="mt-3 flex justify-between text-xs text-gray-600 font-mono px-1">
        <span>0 — Bearish</span>
        <span>50 — Neutral</span>
        <span>100 — Bullish</span>
      </div>
    </div>
  )
}

function ErrorCard({ message }) {
  return (
    <div className="card border-red-900/40 bg-red-950/20">
      <p className="text-sm text-red-400">{message}</p>
    </div>
  )
}
