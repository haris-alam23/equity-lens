function SkeletonBlock({ className, style }) {
  return (
    <div
      className={`shimmer rounded ${className || ''}`}
      style={style}
    />
  )
}

function ChartSkeleton() {
  return (
    <div className="card animate-fade-in-up-1">
      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        <SkeletonBlock className="h-4 w-28" />
        <SkeletonBlock className="h-4 w-20" />
      </div>
      {/* Stat lines */}
      <div className="flex gap-6 mb-8">
        <div className="space-y-1.5">
          <SkeletonBlock className="h-8 w-28" />
          <SkeletonBlock className="h-3 w-20" />
        </div>
        <div className="space-y-1.5">
          <SkeletonBlock className="h-8 w-20" />
          <SkeletonBlock className="h-3 w-16" />
        </div>
        <div className="space-y-1.5">
          <SkeletonBlock className="h-8 w-20" />
          <SkeletonBlock className="h-3 w-16" />
        </div>
      </div>
      {/* Chart area */}
      <SkeletonBlock className="h-52 w-full" style={{ borderRadius: '12px' }} />
      {/* Bottom lines */}
      <div className="flex justify-between mt-3">
        <SkeletonBlock className="h-2.5 w-12" />
        <SkeletonBlock className="h-2.5 w-12" />
        <SkeletonBlock className="h-2.5 w-12" />
        <SkeletonBlock className="h-2.5 w-12" />
      </div>
    </div>
  )
}

function StatsSkeleton() {
  return (
    <div className="card animate-fade-in-up-2">
      <SkeletonBlock className="h-4 w-24 mb-6" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="space-y-2">
            <SkeletonBlock className="h-3 w-16" />
            <SkeletonBlock className="h-6 w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}

function SignalSkeleton() {
  return (
    <div className="card animate-fade-in-up-3">
      <SkeletonBlock className="h-4 w-24 mb-6" />
      {/* Gauge circle */}
      <div className="flex flex-col items-center gap-3 mb-6">
        <SkeletonBlock
          className="w-32 h-20"
          style={{ borderRadius: '40px 40px 0 0' }}
        />
        <SkeletonBlock className="h-6 w-20 rounded-full" />
      </div>
      {/* Explanation box */}
      <SkeletonBlock className="h-20 w-full" style={{ borderRadius: '12px' }} />
      <div className="flex justify-between mt-3">
        <SkeletonBlock className="h-2.5 w-16" />
        <SkeletonBlock className="h-2.5 w-16" />
        <SkeletonBlock className="h-2.5 w-16" />
      </div>
    </div>
  )
}

function SentimentSkeleton() {
  return (
    <div className="card animate-fade-in-up-3">
      <SkeletonBlock className="h-4 w-28 mb-6" />
      {/* Circle + text */}
      <div className="flex items-center gap-4 mb-6">
        <SkeletonBlock
          className="w-20 h-20 shrink-0"
          style={{ borderRadius: '50%' }}
        />
        <div className="flex-1 space-y-2">
          <SkeletonBlock className="h-5 w-20" />
          <SkeletonBlock className="h-3 w-32" />
          <SkeletonBlock className="h-3 w-24" />
        </div>
      </div>
      {/* Bar chart placeholder */}
      <SkeletonBlock className="h-14 w-full mb-6" style={{ borderRadius: '8px' }} />
      {/* Headlines */}
      <SkeletonBlock className="h-3 w-24 mb-3" />
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-3">
            <SkeletonBlock
              className="w-2 h-2 shrink-0 mt-1"
              style={{ borderRadius: '50%' }}
            />
            <div className="flex-1 space-y-1.5">
              <SkeletonBlock className={`h-3 w-${i === 1 ? '4/5' : 'full'}`} />
              <SkeletonBlock className="h-2.5 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PredictionSkeleton() {
  return (
    <div className="card animate-fade-in-up-5">
      <SkeletonBlock className="h-4 w-32 mb-6" />
      <div className="flex items-center gap-4 mb-6">
        <SkeletonBlock
          className="w-16 h-16 shrink-0"
          style={{ borderRadius: '12px' }}
        />
        <div className="space-y-2">
          <SkeletonBlock className="h-7 w-28" />
          <SkeletonBlock className="h-3 w-40" />
        </div>
      </div>
      <SkeletonBlock className="h-16 w-full" style={{ borderRadius: '12px' }} />
      <SkeletonBlock className="h-3 w-full mt-3" />
      <SkeletonBlock className="h-3 w-4/5 mt-1.5" />
    </div>
  )
}

function GenericSkeleton({ title }) {
  return (
    <div className="card animate-fade-in-up-1">
      <SkeletonBlock className="h-4 w-32 mb-4" />
      {title && <p className="text-xs text-gray-700 mb-4">{title}</p>}
      <div className="space-y-2.5">
        <SkeletonBlock className="h-3 w-full" />
        <SkeletonBlock className="h-3 w-4/5" />
        <SkeletonBlock className="h-3 w-3/5" />
      </div>
    </div>
  )
}

export default function LoadingCard({ title, type }) {
  switch (type) {
    case 'chart': return <ChartSkeleton />
    case 'stats': return <StatsSkeleton />
    case 'signal': return <SignalSkeleton />
    case 'sentiment': return <SentimentSkeleton />
    case 'prediction': return <PredictionSkeleton />
    default: return <GenericSkeleton title={title} />
  }
}
