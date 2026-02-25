'use client'

import { useEffect, useState } from 'react'
import { BarChart3, TrendingUp, Users, FolderOpen } from 'lucide-react'

interface Stats {
  totalTasks: number
  completedTasks: number
  totalProjects: number
}

export default function ReportingPage() {
  const [stats, setStats] = useState<Stats>({ totalTasks: 0, completedTasks: 0, totalProjects: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/tasks').then(r => r.json()),
      fetch('/api/projects').then(r => r.json()),
    ]).then(([tasks, projects]) => {
      const taskArr = Array.isArray(tasks) ? tasks : []
      const projArr = Array.isArray(projects) ? projects : []
      setStats({
        totalTasks: taskArr.length,
        completedTasks: taskArr.filter((t: { completed: boolean }) => t.completed).length,
        totalProjects: projArr.length,
      })
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const completionRate = stats.totalTasks > 0
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
    : 0

  return (
    <div className="p-6 max-w-5xl">
      <h1 className="text-xl font-medium text-asana-text-primary mb-6">Berichte</h1>

      {loading ? (
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-200 rounded-lg" />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="asana-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <BarChart3 size={16} className="text-asana-link" />
                </div>
                <span className="text-sm font-medium text-asana-text-secondary">Alle Aufgaben</span>
              </div>
              <p className="text-3xl font-semibold text-asana-text-primary">{stats.totalTasks}</p>
            </div>
            <div className="asana-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                  <TrendingUp size={16} className="text-asana-success" />
                </div>
                <span className="text-sm font-medium text-asana-text-secondary">Abschlussrate</span>
              </div>
              <p className="text-3xl font-semibold text-asana-text-primary">{completionRate}%</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-asana-success h-2 rounded-full transition-all duration-500"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>
            <div className="asana-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                  <FolderOpen size={16} className="text-asana-project-purple" />
                </div>
                <span className="text-sm font-medium text-asana-text-secondary">Projekte</span>
              </div>
              <p className="text-3xl font-semibold text-asana-text-primary">{stats.totalProjects}</p>
            </div>
          </div>

          <div className="asana-card">
            <h2 className="text-sm font-semibold text-asana-text-primary mb-4">Aufgabenübersicht</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-asana-text-secondary">Abgeschlossen</span>
                <span className="text-sm font-medium text-asana-success">{stats.completedTasks}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-asana-text-secondary">In Bearbeitung</span>
                <span className="text-sm font-medium text-asana-link">{stats.totalTasks - stats.completedTasks}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
