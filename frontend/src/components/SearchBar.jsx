import { useState, useRef } from 'react'

const STORAGE_KEY = 'equitylens_recent'
const MAX_RECENT = 6

function loadRecent() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function saveRecent(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch {}
}

export default function SearchBar({ onSearch, isLoading }) {
  const [input, setInput] = useState('')
  const [recent, setRecent] = useState(loadRecent)
  const [focused, setFocused] = useState(false)
  const inputRef = useRef(null)

  const suggestions = ['AAPL', 'TSLA', 'MSFT', 'NVDA', 'AMZN', 'GOOGL']

  const addToRecent = (ticker) => {
    setRecent((prev) => {
      const next = [ticker, ...prev.filter((t) => t !== ticker)].slice(0, MAX_RECENT)
      saveRecent(next)
      return next
    })
  }

  const removeFromRecent = (ticker, e) => {
    e.stopPropagation()
    setRecent((prev) => {
      const next = prev.filter((t) => t !== ticker)
      saveRecent(next)
      return next
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const t = input.trim().toUpperCase()
    if (t) {
      addToRecent(t)
      onSearch(t)
    }
  }

  const handleChipClick = (ticker) => {
    setInput(ticker)
    addToRecent(ticker)
    onSearch(ticker)
    inputRef.current?.blur()
  }

  const handleSuggestionClick = (s) => {
    setInput(s)
    addToRecent(s)
    onSearch(s)
  }

  const showRecent = (focused || recent.length > 0) && recent.length > 0

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="flex-1 relative">
          <div
            className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(99,102,241,0.5)" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value.toUpperCase())}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            placeholder="Enter ticker symbol (e.g. AAPL)"
            className="search-input-glow w-full rounded-xl px-4 py-3.5 pl-9 text-sm font-mono
                       placeholder:text-gray-600 transition-all"
            style={{
              background: '#07103A',
              border: '1px solid rgba(0, 255, 255, 0.2)',
              color: 'white',
            }}
            disabled={isLoading}
            spellCheck={false}
            autoComplete="off"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-6 py-3.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: isLoading || !input.trim()
              ? 'rgba(0, 255, 255, 0.15)'
              : 'linear-gradient(135deg, #0000FF 0%, #00FFFF 100%)',
            boxShadow: isLoading || !input.trim()
              ? 'none'
              : '0 0 16px rgba(0, 255, 255, 0.3)',
            color: 'white',
          }}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Spinner size={14} /> Analyzing
            </span>
          ) : (
            'Analyze'
          )}
        </button>
      </form>

      {/* Recent searches */}
      {showRecent && (
        <div className="mt-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-600">Recent:</span>
            {recent.map((ticker) => (
              <button
                key={ticker}
                onClick={() => handleChipClick(ticker)}
                disabled={isLoading}
                className="recent-chip disabled:opacity-40"
              >
                {ticker}
                <span
                  className="recent-chip-x"
                  onClick={(e) => removeFromRecent(ticker, e)}
                >
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="text-xs text-gray-600">Try:</span>
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => handleSuggestionClick(s)}
            disabled={isLoading}
            className="text-xs font-mono text-gray-500 hover:text-accent-light disabled:opacity-40
                       transition-colors px-2 py-0.5 rounded-md"
            style={{
              border: '1px solid rgba(0, 255, 255, 0.15)',
              background: 'rgba(0, 255, 255, 0.04)',
            }}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}

function Spinner({ size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      className="animate-spin"
      fill="none"
    >
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
      <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
