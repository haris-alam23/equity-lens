import { useState, useEffect, useCallback } from 'react'

const TICKER_SYMBOLS = ['SPY', 'QQQ', 'NVDA', 'BTC-USD', 'AAPL', 'TSLA']

function TickerItem({ symbol, price, change, pct }) {
  const isPositive = change >= 0
  const color = isPositive ? '#22c55e' : '#ef4444'
  const arrow = isPositive ? '▲' : '▼'

  return (
    <div
      className="flex items-center gap-2.5 px-5 py-1.5 shrink-0"
      style={{ borderRight: '1px solid rgba(0, 255, 255, 0.08)' }}
    >
      <span className="text-xs font-mono font-bold" style={{ color: '#00FFFF' }}>{symbol}</span>
      {price !== null ? (
        <>
          <span className="text-xs font-mono text-white">
            {price >= 1000
              ? price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
              : price.toFixed(2)}
          </span>
          <span className="text-xs font-mono flex items-center gap-0.5" style={{ color }}>
            <span style={{ fontSize: '8px' }}>{arrow}</span>
            {Math.abs(pct).toFixed(2)}%
          </span>
        </>
      ) : (
        <span className="text-xs font-mono" style={{ color: 'rgba(0,255,255,0.25)' }}>--</span>
      )}
    </div>
  )
}

function TickerTape({ tickers }) {
  const items = [...tickers, ...tickers]

  return (
    <div className="overflow-hidden flex-1">
      <div className="ticker-track">
        {items.map((t, i) => (
          <TickerItem
            key={`${t.symbol}-${i}`}
            symbol={t.symbol}
            price={t.price}
            change={t.change}
            pct={t.pct}
          />
        ))}
      </div>
    </div>
  )
}

export default function Header() {
  const [tickers, setTickers] = useState(
    TICKER_SYMBOLS.map((s) => ({ symbol: s, price: null, change: 0, pct: 0 }))
  )

  const fetchTicker = useCallback(async (symbol) => {
    try {
      const res = await fetch(`/api/stock/${symbol}`)
      if (!res.ok) throw new Error('fetch failed')
      const json = await res.json()
      const prices = json?.prices ?? []
      if (prices.length < 2) throw new Error('not enough data')
      const latest = prices[prices.length - 1]
      const prev = prices[prices.length - 2]
      const price = latest.close ?? null
      const prevPrice = prev.close ?? null
      if (!price || !prevPrice) throw new Error('no price')
      const change = price - prevPrice
      const pct = (change / prevPrice) * 100
      return { symbol, price, change, pct }
    } catch {
      return { symbol, price: null, change: 0, pct: 0 }
    }
  }, [])

  const refreshAll = useCallback(async () => {
    const results = await Promise.all(TICKER_SYMBOLS.map(fetchTicker))
    setTickers(results)
  }, [fetchTicker])

  useEffect(() => {
    refreshAll()
    const interval = setInterval(refreshAll, 60_000)
    return () => clearInterval(interval)
  }, [refreshAll])

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background: 'rgba(2, 8, 24, 0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(0, 255, 255, 0.1)',
        boxShadow: '0 1px 0 rgba(0, 255, 255, 0.04)',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4">
        {/* Ticker tape — takes all available space */}
        <TickerTape tickers={tickers} />

        {/* LIVE badge */}
        <div
          className="flex items-center gap-1.5 shrink-0 px-2.5 py-1 rounded-full text-xs font-mono"
          style={{
            border: '1px solid rgba(0, 255, 255, 0.15)',
            background: 'rgba(0, 255, 255, 0.04)',
            color: 'rgba(0, 255, 255, 0.6)',
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full bg-green-400"
            style={{ boxShadow: '0 0 4px #22c55e' }}
          />
          LIVE
        </div>
      </div>
    </header>
  )
}
