'use client'

import { Target, Plus } from 'lucide-react'

export default function GoalsPage() {
  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-medium text-asana-text-primary">Ziele</h1>
        <button className="asana-btn-primary flex items-center gap-2">
          <Plus size={16} />
          Ziel hinzufügen
        </button>
      </div>

      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-full bg-asana-bg-secondary flex items-center justify-center mx-auto mb-4">
          <Target size={28} className="text-asana-text-secondary" />
        </div>
        <h2 className="text-lg font-medium text-asana-text-primary mb-2">Unternehmensziele setzen</h2>
        <p className="text-sm text-asana-text-secondary max-w-md mx-auto">
          Definieren und verfolgen Sie Ziele für Ihr Team. Verbinden Sie Ziele mit den Projekten und Aufgaben, die sie vorantreiben.
        </p>
        <button className="asana-btn-primary mt-4">
          <Plus size={16} className="inline mr-1.5" />
          Unternehmensziel hinzufügen
        </button>
      </div>
    </div>
  )
}
