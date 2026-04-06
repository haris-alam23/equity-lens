export default function Header() {
  return (
    <header className="border-b border-border">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 12L6 7L9 10L14 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="14" cy="4" r="1.5" fill="white"/>
            </svg>
          </div>
          <span className="text-lg font-semibold tracking-tight">EquityLens</span>
          <span className="hidden sm:inline text-xs text-gray-500 border border-border rounded-full px-2.5 py-0.5">
            Financial Sentiment Platform
          </span>
        </div>
        <span className="text-xs text-gray-600 font-mono">MVP v1.0</span>
      </div>
    </header>
  )
}
