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
  if (loading) return <LoadingCard type="sentiment" />
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
    <div className="card animate-fade-in-up-3">
      <h3 className="text-xs font-semibold tracking-widest mb-5 uppercase" style={{ color: 'rgba(0,255,255,0.7)' }}>
        News Sentiment
      </h3>

      {/* Score + gauge */}
      <div className="flex items-center gap-4 mb-6">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center shrink-0"
          style={{
            border: `2px solid ${color}`,
            background: `${color}10`,
            boxShadow: `0 0 12px ${color}30`,
          }}
        >
          <div className="text-center">
            <p className="text-xl font-bold font-mono leading-none" style={{ color }}>
              {avg_score > 0 ? '+' : ''}{avg_score.toFixed(2)}
            </p>
          </div>
        </div>
        <div>
          <p className="text-lg font-semibold" style={{ color }}>{label}</p>
          <p className="text-xs text-gray-500 mt-0.5">Avg sentiment score (−1 to +1)</p>
          <div className="flex gap-3 mt-2 text-xs font-mono">
            <span style={{ color: '#22c55e' }}>{pct_positive.toFixed(0)}% pos</span>
            <span className="text-gray-600">·</span>
            <span style={{ color: '#ef4444' }}>{pct_negative.toFixed(0)}% neg</span>
          </div>
        </div>
      </div>

      {/* Breakdown bar chart */}
      <div className="mb-6">
        <ResponsiveContainer width="100%" height={64}>
          <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: '#6b7280', fontSize: 11, fontFamily: 'Inter' }}
              axisLine={false}
              tickLine={false}
              width={58}
            />
            <Tooltip
              formatter={(v) => [`${v.toFixed(1)}%`, '']}
              contentStyle={{
                background: '#07103A',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                borderRadius: '8px',
                fontSize: '12px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
              }}
              cursor={{ fill: 'rgba(255,255,255,0.03)' }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={14}>
              {barData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Divider */}
      {headlines?.length > 0 && <div className="section-divider" />}

      {/* Top headlines */}
      {headlines?.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgba(0,255,255,0.5)' }}>
            Top Headlines
          </p>
          <ul className="space-y-3">
            {headlines.map((h, i) => (
              <li key={i} className="flex gap-3">
                <span
                  className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: scoreColor(h.score), boxShadow: `0 0 4px ${scoreColor(h.score)}` }}
                />
                <div>
                  {h.url ? (
                    <a
                      href={h.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-400 hover:text-white transition-colors leading-snug"
                    >
                      {h.title}
                    </a>
                  ) : (
                    <p className="text-sm text-gray-400 leading-snug">{h.title}</p>
                  )}
                  <p className="text-xs text-gray-700 mt-0.5 font-mono">
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
    <div className="card" style={{ borderColor: 'rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.05)' }}>
      <p className="text-sm text-red-400">{message}</p>
    </div>
  )
}
