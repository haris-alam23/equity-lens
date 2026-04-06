import LoadingCard from './LoadingCard'

/** Two-sided probability bar: green fills from left (up%), red fills from right (down%) */
function ProbabilityBar({ probUp, probDown }) {
  return (
    <div>
      <div className="flex justify-between mb-1.5">
        <span className="text-xs font-semibold" style={{ color: '#22c55e' }}>
          Up {probUp.toFixed(1)}%
        </span>
        <span className="text-xs font-semibold" style={{ color: '#ef4444' }}>
          Down {probDown.toFixed(1)}%
        </span>
      </div>
      <div
        className="w-full h-4 rounded-full overflow-hidden flex"
        style={{ background: '#080a0f' }}
      >
        <div
          className="h-full transition-all duration-700"
          style={{
            width: `${probUp}%`,
            background: 'linear-gradient(90deg, #16a34a, #22c55e)',
            borderRadius: probUp >= 99 ? '9999px' : '9999px 0 0 9999px',
          }}
        />
        <div
          className="h-full transition-all duration-700"
          style={{
            width: `${probDown}%`,
            background: 'linear-gradient(90deg, #ef4444, #b91c1c)',
            borderRadius: probDown >= 99 ? '9999px' : '0 9999px 9999px 0',
          }}
        />
      </div>
      {/* Center marker */}
      <div className="relative h-1 mt-0.5">
        <div
          className="absolute top-0 bottom-0 w-px bg-gray-600"
          style={{ left: '50%' }}
        />
      </div>
    </div>
  )
}

/** Horizontal mini bar chart for feature importances using inline div widths */
function FeatureImportanceChart({ features }) {
  if (!features || features.length === 0) return null

  // Scale bars relative to the max importance so the top bar is full-width
  const maxImp = features[0].importance

  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Feature Importance
      </p>
      <div className="space-y-2.5">
        {features.map(({ feature, importance }) => {
          const pct = maxImp > 0 ? (importance / maxImp) * 100 : 0
          const displayPct = (importance * 100).toFixed(1)
          return (
            <div key={feature}>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-gray-400">{feature}</span>
                <span className="text-xs font-mono text-gray-500">{displayPct}%</span>
              </div>
              <div
                className="w-full rounded-full overflow-hidden"
                style={{ height: '5px', background: '#080a0f' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${pct}%`,
                    background: 'linear-gradient(90deg, #6366f1, #818cf8)',
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function PredictionCard({ data, loading, error }) {
  if (loading) return <LoadingCard type="prediction" />
  if (error) return <ErrorCard message={error} />
  if (!data) return null

  const { prediction, confidence, direction, prob_up, prob_down, feature_importance, model_accuracy } = data
  const isUp = direction === 'up'
  const color = isUp ? '#22c55e' : '#ef4444'

  // Fallback if prob_up/prob_down not provided (old API)
  const upPct = prob_up ?? confidence
  const downPct = prob_down ?? (100 - confidence)

  return (
    <div className="card animate-fade-in-up-5">
      <h3 className="text-xs font-semibold tracking-widest mb-5 uppercase" style={{ color: 'rgba(99,102,241,0.7)' }}>
        ML Prediction · Next Day
      </h3>

      {/* Direction row */}
      <div className="flex items-center gap-4 mb-5">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: `${color}15`, border: `1.5px solid ${color}`, boxShadow: `0 0 16px ${color}25` }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            {isUp ? (
              <path
                d="M12 19V5M5 12l7-7 7 7"
                stroke={color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : (
              <path
                d="M12 5v14M5 12l7 7 7-7"
                stroke={color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
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

      {/* Up / Down probability bar */}
      <div
        className="p-4 rounded-xl border mb-3"
        style={{ background: 'rgba(8, 10, 15, 0.6)', borderColor: 'rgba(99, 102, 241, 0.1)' }}
      >
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Probability Breakdown
        </p>
        <ProbabilityBar probUp={upPct} probDown={downPct} />
      </div>

      {/* Feature importance */}
      {feature_importance && feature_importance.length > 0 && (
        <div
          className="p-4 rounded-xl border mb-3"
          style={{ background: 'rgba(8, 10, 15, 0.6)', borderColor: 'rgba(99, 102, 241, 0.1)' }}
        >
          <FeatureImportanceChart features={feature_importance} />
        </div>
      )}

      {/* Footer row: disclaimer + model accuracy badge */}
      <div className="flex items-end justify-between gap-3 mt-1">
        <p className="text-xs text-gray-600 leading-relaxed flex-1">
          Random Forest trained on price momentum, moving averages, volatility, and sentiment.
          Not financial advice.
        </p>
        {model_accuracy != null && (
          <span
            className="shrink-0 text-xs font-mono px-2 py-1 rounded-md whitespace-nowrap"
            style={{ background: 'rgba(8, 10, 15, 0.6)', border: '1px solid rgba(99, 102, 241, 0.1)', color: '#6b7280' }}
          >
            Model accuracy: {(model_accuracy * 100).toFixed(1)}%
          </span>
        )}
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
