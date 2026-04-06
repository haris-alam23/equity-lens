import { useState, useEffect, useCallback } from 'react'

const TICKER_SYMBOLS = ['SPY', 'QQQ', 'NVDA', 'BTC-USD', 'AAPL', 'TSLA']

function TickerItem({ symbol, price, change, pct }) {
  const isPositive = change >= 0
  const color = isPositive ? '#22c55e' : '#ef4444'
  const arrow = isPositive ? '▲' : '▼'

  return (
    <div
      className="flex items-center gap-2 px-4 py-1.5 shrink-0"
      style={{ borderRight: '1px solid rgba(99,102,241,0.1)' }}
    >
      <span className="text-xs font-mono font-semibold text-gray-300">{symbol}</span>
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
        <span className="text-xs font-mono text-gray-600">--</span>
      )}
    </div>
  )
}

function TickerTape({ tickers }) {
  // Duplicate the list for seamless looping
  const items = [...tickers, ...tickers]

  return (
    <div className="overflow-hidden" style={{ width: '480px', maxWidth: 'calc(100vw - 220px)' }}>
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
      const price = latest.close ?? latest.price ?? null
      const prevPrice = prev.close ?? prev.price ?? null
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
        background: 'rgba(8, 10, 15, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(99, 102, 241, 0.12)',
        boxShadow: '0 1px 0 rgba(99, 102, 241, 0.05)',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              boxShadow: '0 0 12px rgba(99, 102, 241, 0.4)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 12L6 7L9 10L14 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="14" cy="4" r="1.5" fill="white" />
            </svg>
          </div>
          <div>
            <span className="text-base font-bold tracking-tight gradient-text">EquityLens</span>
            <span className="hidden sm:block text-xs text-gray-600 leading-none mt-0.5">
              Market Intelligence
            </span>
          </div>
        </div>

        {/* Ticker tape */}
        <TickerTape tickers={tickers} />

        {/* Status badge */}
        <div
          className="hidden md:flex items-center gap-1.5 shrink-0 px-2.5 py-1 rounded-full text-xs font-mono text-gray-500"
          style={{ border: '1px solid rgba(99, 102, 241, 0.1)', background: 'rgba(99,102,241,0.04)' }}
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
