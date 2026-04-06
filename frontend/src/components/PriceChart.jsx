import { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts'
import LoadingCard from './LoadingCard'
import { fetchStock } from '../api/client'

// Map display label → API period value
const TIMEFRAMES = [
  { label: '1W', value: '7d' },
  { label: '1M', value: '1mo' },
  { label: '3M', value: '3mo' },
  { label: '6M', value: '6mo' },
  { label: '1Y', value: '1y' },
]

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatVolume(v) {
  if (v == null) return '—'
  if (v >= 1e9) return `${(v / 1e9).toFixed(1)}B`
  if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`
  if (v >= 1e3) return `${(v / 1e3).toFixed(0)}K`
  return `${v}`
}

function PriceTooltip({ active, payload, label }) {
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

function VolumeTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card border border-border rounded-xl p-3 text-xs shadow-xl">
      <p className="text-gray-400 mb-1 font-medium">{formatDate(label)}</p>
      <div className="flex items-center justify-between gap-4">
        <span style={{ color: '#00FFFF' }}>Volume</span>
        <span className="font-mono font-semibold">{formatVolume(payload[0]?.value)}</span>
      </div>
    </div>
  )
}

function RsiTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const val = payload[0]?.value
  return (
    <div className="bg-card border border-border rounded-xl p-3 text-xs shadow-xl">
      <p className="text-gray-400 mb-1 font-medium">{formatDate(label)}</p>
      <div className="flex items-center justify-between gap-4">
        <span style={{ color: '#f59e0b' }}>RSI</span>
        <span className="font-mono font-semibold">{val != null ? val.toFixed(1) : '—'}</span>
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

export default function PriceChart({ data: initialData, loading: externalLoading, error: externalError }) {
  const [period, setPeriod] = useState('3mo')
  const [chartData, setChartData] = useState(null)
  const [innerLoading, setInnerLoading] = useState(false)
  const [innerError, setInnerError] = useState(null)

  // When external data arrives (initial load), sync it into local state
  useEffect(() => {
    if (initialData) {
      setChartData(initialData)
      setInnerError(null)
      // Reset period selector to match the default period used on initial search
      setPeriod('3mo')
    }
  }, [initialData])

  const handlePeriodChange = async (newPeriod) => {
    if (!chartData || newPeriod === period) return
    setPeriod(newPeriod)
    setInnerLoading(true)
    setInnerError(null)
    try {
      const res = await fetchStock(chartData.ticker, newPeriod)
      setChartData(res.data)
    } catch (err) {
      setInnerError(err.response?.data?.detail || err.message || 'Failed to load data')
    } finally {
      setInnerLoading(false)
    }
  }

  const loading = externalLoading || innerLoading
  const error = innerError || externalError

  if (externalLoading) return <LoadingCard title="Fetching price data..." />
  if (externalError && !chartData) return <ErrorCard message={externalError} />
  if (!chartData) return null

  const { ticker, company_name, current_price, price_change_pct, prices } = chartData
  const isPositive = price_change_pct >= 0

  // Sample to ~90 data points for cleaner chart
  const step = Math.max(1, Math.floor(prices.length / 90))
  const sampled = prices.filter((_, i) => i % step === 0 || i === prices.length - 1)

  return (
    <div className="card">
      {/* Header row: ticker info + timeframe pills */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold">{ticker}</h2>
          <p className="text-sm text-gray-400">{company_name}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="text-right">
            <p className="text-2xl font-bold font-mono">${current_price.toFixed(2)}</p>
            <p className={`text-sm font-semibold ${isPositive ? 'text-bullish' : 'text-bearish'}`}>
              {isPositive ? '+' : ''}{price_change_pct.toFixed(2)}% today
            </p>
          </div>
          {/* Timeframe selector pills */}
          <div className="flex gap-1">
            {TIMEFRAMES.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => handlePeriodChange(value)}
                disabled={loading}
                className="px-2.5 py-1 rounded-full text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={
                  period === value
                    ? { background: 'linear-gradient(135deg, #0000FF, #00FFFF)', color: '#fff', boxShadow: '0 0 8px rgba(0,255,255,0.3)' }
                    : { background: 'rgba(255,255,255,0.05)', color: '#6b7280' }
                }
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading overlay indicator */}
      {innerLoading && (
        <p className="text-xs text-gray-500 animate-pulse mb-2">Updating chart…</p>
      )}
      {innerError && (
        <p className="text-xs text-red-400 mb-2">{innerError}</p>
      )}

      {/* Main price chart */}
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={sampled} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#0D1B6E" vertical={false} />
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
          <Tooltip content={<PriceTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }}
            formatter={(value) => <span style={{ color: '#9ca3af' }}>{value}</span>}
          />
          <Line
            type="monotone"
            dataKey="close"
            name="Close"
            stroke="#0000FF"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#0000FF' }}
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

      {/* Volume sub-chart */}
      <div className="mt-2">
        <p className="text-xs text-gray-600 mb-1 ml-1">Volume</p>
        <ResponsiveContainer width="100%" height={60}>
          <BarChart data={sampled} margin={{ top: 0, right: 4, bottom: 0, left: 0 }}>
            <XAxis dataKey="date" hide />
            <YAxis hide domain={['auto', 'auto']} />
            <Tooltip content={<VolumeTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar dataKey="volume" name="Volume" isAnimationActive={false}>
              {sampled.map((_, idx) => (
                <Cell key={idx} fill="rgba(0,0,255,0.5)" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* RSI sub-chart */}
      <div className="mt-2">
        <p className="text-xs text-gray-600 mb-1 ml-1">RSI (14)</p>
        <ResponsiveContainer width="100%" height={80}>
          <LineChart data={sampled} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <XAxis dataKey="date" hide />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: '#6b7280', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              width={28}
              ticks={[30, 70]}
            />
            <Tooltip content={<RsiTooltip />} />
            {/* Overbought line */}
            <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="4 2" strokeWidth={1} />
            {/* Oversold line */}
            <ReferenceLine y={30} stroke="#22c55e" strokeDasharray="4 2" strokeWidth={1} />
            <Line
              type="monotone"
              dataKey="rsi"
              name="RSI"
              stroke="#f59e0b"
              strokeWidth={1.5}
              dot={false}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-1 ml-1">
          <span className="text-xs text-red-400">— 70 overbought</span>
          <span className="text-xs text-green-500">— 30 oversold</span>
        </div>
      </div>
    </div>
  )
}
