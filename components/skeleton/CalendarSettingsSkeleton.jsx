'use client'

export default function CalendarSettingsSkeleton() {
  return (
    <div className="space-y-6 p-4 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-6 w-48 bg-neutral-800 rounded-md mb-2" />
          <div className="h-4 w-64 bg-neutral-800 rounded-md" />
        </div>
        <div className="h-10 w-32 bg-neutral-800 rounded-lg" />
      </div>

      {/* Calendar Activation */}
      <div className="p-5 bg-neutral-900 rounded-xl border border-neutral-800">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-5 w-40 bg-neutral-800 rounded-md mb-2" />
            <div className="h-4 w-56 bg-neutral-800 rounded-md" />
          </div>
          <div className="h-6 w-11 bg-neutral-800 rounded-full" />
        </div>
      </div>

      {/* Integration Type */}
      <div className="p-5 bg-neutral-900 rounded-xl border border-neutral-800 space-y-3">
        <div className="h-5 w-48 bg-neutral-800 rounded-md mb-3" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 bg-neutral-800/60 rounded-lg border border-neutral-700" />
        ))}
      </div>

      {/* Booking Settings */}
      <div className="p-5 bg-neutral-900 rounded-xl border border-neutral-800 space-y-4">
        <div className="h-5 w-40 bg-neutral-800 rounded-md mb-3" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-neutral-800 rounded-lg" />
          ))}
        </div>
      </div>

      {/* Timezone */}
      <div className="p-5 bg-neutral-900 rounded-xl border border-neutral-800 space-y-4">
        <div className="h-5 w-40 bg-neutral-800 rounded-md mb-2" />
        <div className="h-10 bg-neutral-800 rounded-lg" />
      </div>

      {/* Weekly Availability */}
      <div className="p-5 bg-neutral-900 rounded-xl border border-neutral-800 space-y-3">
        <div className="h-5 w-48 bg-neutral-800 rounded-md mb-3" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-14 bg-neutral-800/60 rounded-lg" />
        ))}
      </div>

      {/* Notifications */}
      <div className="p-5 bg-neutral-900 rounded-xl border border-neutral-800 space-y-4">
        <div className="h-5 w-48 bg-neutral-800 rounded-md mb-3" />
        {[1, 2].map((i) => (
          <div key={i} className="h-5 w-64 bg-neutral-800 rounded-md" />
        ))}
      </div>

      {/* Footer Save Button */}
      <div className="flex justify-end pt-4">
        <div className="h-10 w-40 bg-neutral-800 rounded-lg" />
      </div>
    </div>
  )
}
