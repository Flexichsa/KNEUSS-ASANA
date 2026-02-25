'use client'

import { Calendar } from 'lucide-react'

export default function CalendarViewPage() {
  return (
    <div className="p-6">
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-full bg-asana-bg-secondary flex items-center justify-center mx-auto mb-4">
          <Calendar size={28} className="text-asana-text-secondary" />
        </div>
        <h2 className="text-lg font-medium text-asana-text-primary mb-2">Calendar View</h2>
        <p className="text-sm text-asana-text-secondary max-w-md mx-auto">
          See all of your project&apos;s tasks on one calendar, so you can easily track task cadence, coverage, and deadlines.
        </p>
        <p className="text-xs text-asana-text-secondary mt-4">
          Calendar view coming soon. Use List or Board view for now.
        </p>
      </div>
    </div>
  )
}
