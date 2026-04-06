import { BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import LoadingCard from './LoadingCard'

function scoreColor(score) {
  if (score >= 0.05) return '#22c55e'
  if (score <= -0.05) return '#ef4444'
  return '#f59e0b'
}

function scoreLabel(score) {
  if (score >= 0.05) return 'Positive'
  if (score <= -0.05) return 'Negative'
  return 'Neutral'
}

export default function SentimentSection({ data, loading, error }) {
  if (loading) return <LoadingCard title="Analyzing news sentiment..." />
  if (error) return <ErrorCard message={error} />
  if (!data) return null

  const { avg_score, pct_positive, pct_neutral, pct_negative, headlines } = data

  const barData = [
    { name: 'Positive', value: pct_positive, color: '#22c55e' },
    { name: 'Neutral', value: pct_neutral, color: '#f59e0b' },
    { name: 'Negative', value: pct_negative, color: '#ef4444' },
  ]

  const color = scoreColor(avg_score)
  const label = scoreLabel(avg_score)

  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-5">
        News Sentiment
      </h3>

      {/* Score + gauge */}
      <div className="flex items-center gap-4 mb-6">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center border-4 shrink-0"
          style={{ borderColor: color }}
        >
          <div className="text-center">
            <p className="text-xl font-bold font-mono" style={{ color }}>
              {avg_score > 0 ? '+' : ''}{avg_score.toFixed(2)}
            </p>
          </div>
        </div>
        <div>
          <p className="text-lg font-semibold" style={{ color }}>{label}</p>
          <p className="text-xs text-gray-500 mt-0.5">Average sentiment score (−1 to +1)</p>
          <div className="flex gap-3 mt-2 text-xs font-mono">
            <span className="text-bullish">{pct_positive.toFixed(0)}% positive</span>
            <span className="text-gray-500">·</span>
            <span className="text-bearish">{pct_negative.toFixed(0)}% negative</span>
          </div>
        </div>
      </div>

      {/* Breakdown bar chart */}
      <div className="mb-6">
        <ResponsiveContainer width="100%" height={64}>
          <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis type="category" dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} width={58} />
            <Tooltip
              formatter={(v) => [`${v.toFixed(1)}%`, '']}
              contentStyle={{ background: '#1a1d27', border: '1px solid #2a2d3a', borderRadius: '8px', fontSize: '12px' }}
              cursor={{ fill: '#ffffff08' }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={16}>
              {barData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top headlines */}
      {headlines?.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Top Headlines
          </p>
          <ul className="space-y-3">
            {headlines.map((h, i) => (
              <li key={i} className="flex gap-3">
                <span
                  className="mt-0.5 w-2 h-2 rounded-full shrink-0"
                  style={{ background: scoreColor(h.score), marginTop: '6px' }}
                />
                <div>
                  {h.url ? (
                    <a
                      href={h.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-300 hover:text-white transition-colors leading-snug"
                    >
                      {h.title}
                    </a>
                  ) : (
                    <p className="text-sm text-gray-300 leading-snug">{h.title}</p>
                  )}
                  <p className="text-xs text-gray-600 mt-0.5 font-mono">
                    Score: {h.score > 0 ? '+' : ''}{h.score.toFixed(3)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
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
