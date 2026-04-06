import Header from './components/Header'
import SearchBar from './components/SearchBar'
import PriceChart from './components/PriceChart'
import SentimentSection from './components/SentimentSection'
import MarketSignal from './components/MarketSignal'
import PredictionCard from './components/PredictionCard'
import { useStockData } from './hooks/useStockData'

function HeroEmpty() {
  return (
    <div className="text-center py-20 text-gray-600">
      <div className="mb-4 flex justify-center">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="12" fill="#1a1d27" />
          <path d="M10 34L18 22L24 28L32 16L38 22" stroke="#2a2d3a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="38" cy="22" r="3" fill="#2a2d3a" />
        </svg>
      </div>
      <p className="text-base font-medium text-gray-500">Enter a ticker to get started</p>
      <p className="text-sm mt-1">Price history · News sentiment · Market signal · ML prediction</p>
    </div>
  )
}

export default function App() {
  const { data, loading, errors, activeTicker, isAnyLoading, hasResults, search } = useStockData()

  return (
    <div className="min-h-screen bg-surface">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* Search */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-center mb-2">
            Financial Sentiment &amp; Market Intelligence
          </h1>
          <p className="text-gray-500 text-center text-sm mb-8">
            Combines price momentum, news sentiment, and ML to surface a clear market signal.
          </p>
          <SearchBar onSearch={search} isLoading={isAnyLoading} />
        </div>

        {/* Active ticker badge */}
        {activeTicker && (
          <div className="flex items-center gap-2 mb-6">
            <span className="text-sm text-gray-400">Showing results for</span>
            <span className="font-mono font-semibold text-accent-light bg-accent/10 px-2.5 py-0.5 rounded-md text-sm">
              {activeTicker}
            </span>
            {isAnyLoading && (
              <span className="text-xs text-gray-600 animate-pulse">Loading…</span>
            )}
          </div>
        )}

        {/* Empty state */}
        {!hasResults && !isAnyLoading && <HeroEmpty />}

        {/* Results grid */}
        {(hasResults || isAnyLoading) && (
          <div className="space-y-6">
            {/* Price chart — full width */}
            <PriceChart
              data={data.stock}
              loading={loading.stock}
              error={errors.stock}
            />

            {/* 3-column grid for the lower cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <SentimentSection
                data={data.sentiment}
                loading={loading.sentiment}
                error={errors.sentiment}
              />
              <MarketSignal
                data={data.signal}
                loading={loading.signal}
                error={errors.signal}
              />
              <PredictionCard
                data={data.prediction}
                loading={loading.prediction}
                error={errors.prediction}
              />
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-border mt-16 py-6 text-center text-xs text-gray-700">
        EquityLens — for educational purposes only. Not financial advice.
      </footer>
    </div>
  )
}
