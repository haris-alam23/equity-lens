import Header from './components/Header'
import SearchBar from './components/SearchBar'
import PriceChart from './components/PriceChart'
import SentimentSection from './components/SentimentSection'
import MarketSignal from './components/MarketSignal'
import PredictionCard from './components/PredictionCard'
import { useStockData } from './hooks/useStockData'

// StatsCard is added by another agent. Import it here once it exists.
// Wrap in a try/catch at module level via a lazy component pattern.
import { lazy, Suspense } from 'react'

const StatsCardLazy = lazy(() =>
  import('./components/StatsCard').catch(() => ({ default: () => null }))
)

function HeroEmpty() {
  return (
    <div className="text-center py-24 animate-fade-in-up-1">
      {/* Decorative glow circle */}
      <div className="relative flex justify-center mb-8">
        <div
          className="absolute inset-0 mx-auto w-32 h-32 rounded-full blur-3xl opacity-20"
          style={{ background: 'radial-gradient(circle, #6366f1, #a855f7)' }}
        />
        <div
          className="relative w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.15) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            boxShadow: '0 0 24px rgba(99,102,241,0.15)',
          }}
        >
          <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
            <path
              d="M10 34L18 22L24 28L32 16L38 22"
              stroke="rgba(99,102,241,0.8)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="38" cy="22" r="3" fill="#6366f1" />
          </svg>
        </div>
      </div>

      <p className="text-base font-semibold text-gray-400 mb-2">Enter a ticker to get started</p>
      <p className="text-sm text-gray-600 max-w-xs mx-auto leading-relaxed">
        Price history · News sentiment · Market signal · ML prediction
      </p>

      {/* Feature pills */}
      <div className="flex flex-wrap justify-center gap-2 mt-8">
        {['Price Chart', 'ML Prediction', 'Sentiment Analysis', 'Market Signal'].map((f) => (
          <span
            key={f}
            className="text-xs px-3 py-1 rounded-full font-medium"
            style={{
              background: 'rgba(99, 102, 241, 0.06)',
              border: '1px solid rgba(99, 102, 241, 0.15)',
              color: 'rgba(165, 180, 252, 0.7)',
            }}
          >
            {f}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function App() {
  const { data, loading, errors, activeTicker, isAnyLoading, hasResults, search } = useStockData()

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* Hero search section */}
        <div className="mb-12 text-center">
          <div className="mb-2">
            <span
              className="text-xs font-mono font-semibold tracking-widest uppercase px-3 py-1 rounded-full"
              style={{
                background: 'rgba(99,102,241,0.08)',
                border: '1px solid rgba(99,102,241,0.2)',
                color: 'rgba(129, 140, 248, 0.9)',
              }}
            >
              Powered by ML + NLP
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-center mt-4 mb-3 leading-tight tracking-tight">
            <span className="gradient-text">Financial Intelligence</span>
            <br />
            <span className="text-gray-300 text-3xl sm:text-4xl font-bold">at your fingertips</span>
          </h1>
          <p className="text-gray-500 text-center text-sm mb-8 max-w-md mx-auto leading-relaxed">
            Combines price momentum, news sentiment, and ML to surface a clear market signal.
          </p>
          <SearchBar onSearch={search} isLoading={isAnyLoading} />
        </div>

        {/* Active ticker badge */}
        {activeTicker && (
          <div className="flex items-center gap-2.5 mb-7 animate-fade-in-up-1">
            <div
              className="w-1.5 h-1.5 rounded-full bg-accent"
              style={{ boxShadow: '0 0 6px rgba(99,102,241,0.8)' }}
            />
            <span className="text-sm text-gray-500">Showing results for</span>
            <span
              className="font-mono font-bold text-sm px-2.5 py-0.5 rounded-lg"
              style={{
                background: 'rgba(99,102,241,0.1)',
                border: '1px solid rgba(99,102,241,0.25)',
                color: '#a5b4fc',
              }}
            >
              {activeTicker}
            </span>
            {isAnyLoading && (
              <span className="text-xs text-gray-700 animate-pulse ml-1">Analyzing...</span>
            )}
          </div>
        )}

        {/* Empty state */}
        {!hasResults && !isAnyLoading && <HeroEmpty />}

        {/* Results */}
        {(hasResults || isAnyLoading) && (
          <div className="space-y-6">
            {/* Price chart — full width */}
            <div className="animate-fade-in-up-1">
              <PriceChart
                data={data.stock}
                loading={loading.stock}
                error={errors.stock}
              />
            </div>

            {/* StatsCard — full width, after price chart (added by another agent) */}
            <div className="animate-fade-in-up-2">
              <Suspense fallback={null}>
                <StatsCardLazy
                  data={data.stock}
                  loading={loading.stock}
                  error={errors.stock}
                />
              </Suspense>
            </div>

            <div className="section-divider" />

            {/* 3-column grid for lower cards */}
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

      {/* Footer */}
      <footer
        className="mt-20 py-8"
        style={{
          borderTop: '1px solid rgba(99, 102, 241, 0.08)',
          background: 'linear-gradient(to bottom, transparent, rgba(99,102,241,0.03))',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                <path d="M2 12L6 7L9 10L14 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-xs font-semibold text-gray-600">EquityLens</span>
          </div>
          <p className="text-xs text-gray-700 text-center">
            For educational purposes only. Not financial advice. Data may be delayed.
          </p>
          <span className="text-xs font-mono text-gray-700">v1.0</span>
        </div>
      </footer>
    </div>
  )
}
