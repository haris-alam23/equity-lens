// StatsCard — displays key stock statistics pulled from stock.info via the backend

function fmt(value, decimals = 2) {
  if (value == null) return '—'
  return Number(value).toFixed(decimals)
}

function fmtVolume(value) {
  if (value == null) return '—'
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`
  if (value >= 1e3) return `${(value / 1e3).toFixed(0)}K`
  return `${value}`
}

// 52-week range progress bar showing where the current price sits
function WeekRangeBar({ low, high, current }) {
  if (low == null || high == null || current == null) {
    return <span className="font-mono text-sm">—</span>
  }
  const range = high - low
  const pct = range > 0 ? Math.min(100, Math.max(0, ((current - low) / range) * 100)) : 50

  return (
    <div className="w-full">
      <div className="relative h-1.5 rounded-full bg-white/10 mt-1">
        <div
          className="absolute top-0 left-0 h-full rounded-full bg-indigo-500"
          style={{ width: `${pct}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow"
          style={{ left: `calc(${pct}% - 4px)` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span className="font-mono">${fmt(low)}</span>
        <span className="font-mono text-gray-400">${fmt(current)} now</span>
        <span className="font-mono">${fmt(high)}</span>
      </div>
    </div>
  )
}

function StatRow({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5 py-3 border-b border-border last:border-0">
      <span className="text-xs text-gray-500 uppercase tracking-wide">{label}</span>
      <span className="text-sm font-semibold font-mono">{value}</span>
    </div>
  )
}

export default function StatsCard({ data }) {
  if (!data) return null

  const { stats, current_price } = data

  if (!stats) return null

  const {
    market_cap,
    pe_ratio,
    eps,
    beta,
    week_52_high,
    week_52_low,
    avg_volume,
    dividend_yield,
  } = stats

  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-gray-300 mb-1 uppercase tracking-wider">Key Statistics</h3>

      {/* 2-column grid for most stats */}
      <div className="grid grid-cols-2 gap-x-6">
        <StatRow label="Market Cap" value={market_cap ?? '—'} />
        <StatRow label="P/E Ratio" value={pe_ratio != null ? fmt(pe_ratio) : '—'} />
        <StatRow label="EPS (TTM)" value={eps != null ? `$${fmt(eps)}` : '—'} />
        <StatRow label="Beta" value={beta != null ? fmt(beta) : '—'} />
        <StatRow label="Avg Volume" value={fmtVolume(avg_volume)} />
        <StatRow label="Dividend Yield" value={dividend_yield != null ? `${fmt(dividend_yield)}%` : '—'} />
      </div>

      {/* 52-week range spans full width */}
      <div className="mt-2 pt-3 border-t border-border">
        <span className="text-xs text-gray-500 uppercase tracking-wide">52-Week Range</span>
        <div className="mt-2">
          <WeekRangeBar low={week_52_low} high={week_52_high} current={current_price} />
        </div>
      </div>
    </div>
  )
}
