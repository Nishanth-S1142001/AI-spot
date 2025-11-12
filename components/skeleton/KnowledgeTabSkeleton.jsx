'use client'

export default function KnowledgeTabSkeleton() {
  return (
    <div className="space-y-6 p-4 animate-pulse">
      {/* Header */}
      <div>
        <div className="h-6 w-48 bg-neutral-800 rounded-md mb-2" />
        <div className="h-4 w-64 bg-neutral-800 rounded-md" />
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="p-4 bg-neutral-900 rounded-xl border border-neutral-800 space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-neutral-800" />
              <div>
                <div className="h-5 w-12 bg-neutral-800 rounded-md mb-1" />
                <div className="h-3 w-16 bg-neutral-800 rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Section */}
      <div className="p-6 bg-neutral-900 rounded-xl border border-neutral-800 space-y-4">
        <div className="h-5 w-48 bg-neutral-800 rounded-md" />
        <div className="h-10 w-full bg-neutral-800 rounded-lg" />
        <div className="h-24 w-full bg-neutral-800/70 rounded-lg" />
      </div>

      {/* Active Info Section */}
      <div className="p-4 bg-neutral-900 rounded-xl border border-neutral-800">
        <div className="flex items-start gap-3">
          <div className="h-5 w-5 rounded-full bg-neutral-800" />
          <div>
            <div className="h-4 w-48 bg-neutral-800 rounded-md mb-2" />
            <div className="h-3 w-64 bg-neutral-800 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  )
}
