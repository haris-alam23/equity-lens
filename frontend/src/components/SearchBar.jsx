import { useState } from 'react'

export default function SearchBar({ onSearch, isLoading }) {
  const [input, setInput] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const t = input.trim().toUpperCase()
    if (t) onSearch(t)
  }

  const suggestions = ['AAPL', 'TSLA', 'MSFT', 'NVDA', 'AMZN', 'GOOGL']

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value.toUpperCase())}
            placeholder="Enter ticker symbol (e.g. AAPL)"
            className="w-full bg-card border border-border rounded-xl px-4 py-3.5 text-sm font-mono
                       placeholder:text-gray-600 focus:outline-none focus:border-accent transition-colors"
            disabled={isLoading}
            spellCheck={false}
            autoComplete="off"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-6 py-3.5 bg-accent hover:bg-accent-light disabled:opacity-40 disabled:cursor-not-allowed
                     rounded-xl text-sm font-semibold transition-colors whitespace-nowrap"
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

      <div className="mt-3 flex flex-wrap gap-2">
        <span className="text-xs text-gray-600">Try:</span>
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => { setInput(s); onSearch(s) }}
            disabled={isLoading}
            className="text-xs font-mono text-gray-400 hover:text-accent-light disabled:opacity-40
                       border border-border hover:border-accent rounded-md px-2 py-0.5 transition-colors"
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
