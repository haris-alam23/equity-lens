import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import LoadingCard from './LoadingCard'

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card border border-border rounded-xl p-3 text-xs shadow-xl">
      <p className="text-gray-400 mb-2 font-medium">{formatDate(label)}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center justify-between gap-4">
          <span style={{ color: entry.color }}>{entry.name}</span>
          <span className="font-mono font-semibold">${entry.value?.toFixed(2)}</span>
        </div>
      ))}
    </div>
  )
}

export default function PriceChart({ data, loading, error }) {
  if (loading) return <LoadingCard title="Fetching price data..." />
  if (error) return <ErrorCard message={error} />
  if (!data) return null

  const { ticker, company_name, current_price, price_change_pct, prices } = data
  const isPositive = price_change_pct >= 0

  // Sample to ~90 data points for cleaner chart
  const step = Math.max(1, Math.floor(prices.length / 90))
  const chartData = prices.filter((_, i) => i % step === 0 || i === prices.length - 1)

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">{ticker}</h2>
          <p className="text-sm text-gray-400">{company_name}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold font-mono">${current_price.toFixed(2)}</p>
          <p className={`text-sm font-semibold ${isPositive ? 'text-bullish' : 'text-bearish'}`}>
            {isPositive ? '+' : ''}{price_change_pct.toFixed(2)}% today
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fill: '#6b7280', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={['auto', 'auto']}
            tick={{ fill: '#6b7280', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `$${v.toFixed(0)}`}
            width={52}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }}
            formatter={(value) => <span style={{ color: '#9ca3af' }}>{value}</span>}
          />
          <Line
            type="monotone"
            dataKey="close"
            name="Close"
            stroke="#6366f1"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#6366f1' }}
          />
          <Line
            type="monotone"
            dataKey="ma5"
            name="MA 5"
            stroke="#22c55e"
            strokeWidth={1.5}
            dot={false}
            strokeDasharray="4 2"
          />
          <Line
            type="monotone"
            dataKey="ma10"
            name="MA 10"
            stroke="#f59e0b"
            strokeWidth={1.5}
            dot={false}
            strokeDasharray="4 2"
          />
        </LineChart>
      </ResponsiveContainer>
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
