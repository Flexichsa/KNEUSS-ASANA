'use client'

import { GanttChart } from 'lucide-react'

export default function TimelineViewPage() {
  return (
    <div className="p-6">
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-full bg-asana-bg-secondary flex items-center justify-center mx-auto mb-4">
          <GanttChart size={28} className="text-asana-text-secondary" />
        </div>
        <h2 className="text-lg font-medium text-asana-text-primary mb-2">Zeitachse</h2>
        <p className="text-sm text-asana-text-secondary max-w-md mx-auto">
          Sehen Sie, wie die Teile Ihres Plans zusammenpassen. Weisen Sie Start- und Fälligkeitsdaten zu, setzen Sie Abhängigkeiten und verfolgen Sie den Fortschritt.
        </p>
        <p className="text-xs text-asana-text-secondary mt-4">
          Die Zeitachsen-Ansicht (Gantt) ist ab dem Starter-Plan verfügbar.
        </p>
      </div>
    </div>
  )
}
