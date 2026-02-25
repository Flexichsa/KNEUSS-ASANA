'use client'

import { Calendar } from 'lucide-react'

export default function CalendarViewPage() {
  return (
    <div className="p-6">
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-full bg-asana-bg-secondary flex items-center justify-center mx-auto mb-4">
          <Calendar size={28} className="text-asana-text-secondary" />
        </div>
        <h2 className="text-lg font-medium text-asana-text-primary mb-2">Kalenderansicht</h2>
        <p className="text-sm text-asana-text-secondary max-w-md mx-auto">
          Sehen Sie alle Aufgaben Ihres Projekts in einem Kalender, um Kadenz, Abdeckung und Fristen einfach zu verfolgen.
        </p>
        <p className="text-xs text-asana-text-secondary mt-4">
          Kalenderansicht kommt bald. Verwenden Sie vorerst die Listen- oder Board-Ansicht.
        </p>
      </div>
    </div>
  )
}
