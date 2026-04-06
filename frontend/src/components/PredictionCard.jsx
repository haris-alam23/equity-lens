import LoadingCard from './LoadingCard'

function ConfidenceBar({ confidence, color }) {
  return (
    <div className="w-full bg-surface rounded-full h-2 mt-2 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${confidence}%`, backgroundColor: color }}
      />
    </div>
  )
}

export default function PredictionCard({ data, loading, error }) {
  if (loading) return <LoadingCard title="Running ML prediction..." />
  if (error) return <ErrorCard message={error} />
  if (!data) return null

  const { prediction, confidence, direction } = data
  const isUp = direction === 'up'
  const color = isUp ? '#22c55e' : '#ef4444'

  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-5">
        ML Prediction · Next Day
      </h3>

      <div className="flex items-center gap-4 mb-5">
        {/* Direction icon */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: `${color}18`, border: `2px solid ${color}` }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            {isUp ? (
              <path d="M12 19V5M5 12l7-7 7 7" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            ) : (
              <path d="M12 5v14M5 12l7 7 7-7" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            )}
          </svg>
        </div>

        <div>
          <p className="text-2xl font-bold" style={{ color }}>
            Price {prediction}
          </p>
          <p className="text-sm text-gray-400 mt-0.5">Predicted next-day direction</p>
        </div>
      </div>

      {/* Confidence */}
      <div className="p-4 bg-surface rounded-xl border border-border">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Model Confidence
          </span>
          <span className="text-sm font-bold font-mono" style={{ color }}>
            {confidence.toFixed(1)}%
          </span>
        </div>
        <ConfidenceBar confidence={confidence} color={color} />
      </div>

      <p className="mt-3 text-xs text-gray-600 leading-relaxed">
        Based on a Random Forest model trained on price momentum, moving averages, volatility,
        and news sentiment. Not financial advice.
      </p>
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
