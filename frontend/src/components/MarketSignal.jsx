import LoadingCard from './LoadingCard'

function SignalGauge({ score }) {
  const radius = 54
  const circumference = Math.PI * radius // half-circle
  const progress = (score / 100) * circumference
  const offset = circumference - progress

  const color =
    score >= 60 ? '#22c55e' : score <= 40 ? '#ef4444' : '#f59e0b'

  const glowColor =
    score >= 60
      ? 'rgba(34, 197, 94, 0.3)'
      : score <= 40
      ? 'rgba(239, 68, 68, 0.3)'
      : 'rgba(245, 158, 11, 0.3)'

  return (
    <svg width="140" height="80" viewBox="0 0 140 80" style={{ filter: `drop-shadow(0 0 8px ${glowColor})` }}>
      {/* Track */}
      <path
        d="M 16 72 A 54 54 0 0 1 124 72"
        fill="none"
        stroke="#1a1d2e"
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
  if (label === 'Bullish') return { bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 0.3)', color: '#22c55e' }
  if (label === 'Bearish') return { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)', color: '#ef4444' }
  return { bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.3)', color: '#f59e0b' }
}

export default function MarketSignal({ data, loading, error }) {
  if (loading) return <LoadingCard type="signal" />
  if (error) return <ErrorCard message={error} />
  if (!data) return null

  const { score, label, explanation } = data
  const styles = labelStyles(label)

  return (
    <div className="card animate-fade-in-up-3">
      <h3 className="text-xs font-semibold tracking-widest mb-5 uppercase" style={{ color: 'rgba(99,102,241,0.7)' }}>
        Market Signal
      </h3>

      <div className="flex flex-col items-center mb-4">
        <SignalGauge score={score} />
        <span
          className="label-tag border mt-3 text-xs"
          style={{
            background: styles.bg,
            borderColor: styles.border,
            color: styles.color,
          }}
        >
          {label === 'Bullish' && '↑ '}
          {label === 'Bearish' && '↓ '}
          {label === 'Neutral' && '→ '}
          {label}
        </span>
      </div>

      <div
        className="mt-4 p-4 rounded-xl"
        style={{ background: 'rgba(8, 10, 15, 0.6)', border: '1px solid rgba(99, 102, 241, 0.1)' }}
      >
        <p className="text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'rgba(99,102,241,0.5)' }}>
          Explanation
        </p>
        <p className="text-sm text-gray-300 leading-relaxed">{explanation}</p>
      </div>

      <div className="mt-3 flex justify-between text-xs text-gray-700 font-mono px-1">
        <span>0 — Bearish</span>
        <span>50 — Neutral</span>
        <span>100 — Bullish</span>
      </div>
    </div>
  )
}

function ErrorCard({ message }) {
  return (
    <div className="card" style={{ borderColor: 'rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.05)' }}>
      <p className="text-sm text-red-400">{message}</p>
    </div>
  )
}
