export default function LoadingCard({ title }) {
  return (
    <div className="card animate-pulse">
      <div className="h-4 w-32 bg-border rounded mb-4" />
      {title && <p className="text-xs text-gray-600 mb-4">{title}</p>}
      <div className="space-y-2">
        <div className="h-3 bg-border rounded w-full" />
        <div className="h-3 bg-border rounded w-4/5" />
        <div className="h-3 bg-border rounded w-3/5" />
      </div>
    </div>
  )
}
