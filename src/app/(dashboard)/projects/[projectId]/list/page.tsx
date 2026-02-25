'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import type { ProjectType } from '@/types'
import ProjectHeader from '@/components/projects/ProjectHeader'
import TaskListView from '@/components/tasks/TaskListView'
import TaskDetailPane from '@/components/tasks/TaskDetailPane'
import { Loader2 } from 'lucide-react'

export default function ListViewPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const [project, setProject] = useState<ProjectType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  const fetchProject = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`)
      if (!res.ok) {
        if (res.status === 404) {
          setError('Projekt nicht gefunden')
        } else {
          setError('Projekt konnte nicht geladen werden')
        }
        return
      }
      const data = await res.json()
      setProject(data)
      setError(null)
    } catch (err) {
      console.error('Failed to fetch project:', err)
      setError('Projekt konnte nicht geladen werden')
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchProject()
  }, [fetchProject])

  if (loading) {
    return (
      <div className="h-full flex flex-col">
        {/* Skeleton header */}
        <div className="bg-white border-b border-asana-border">
          <div className="px-6 pt-5 pb-3">
            <div className="animate-pulse h-7 bg-gray-200 rounded w-48" />
          </div>
          <div className="px-6 pb-0">
            <div className="flex gap-4 border-b border-asana-border">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse h-4 bg-gray-100 rounded w-14 my-3" />
              ))}
            </div>
          </div>
        </div>
        {/* Skeleton rows */}
        <div className="flex-1 p-0">
          <div className="animate-pulse h-9 bg-gray-50 border-b border-asana-border" />
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse h-10 border-b border-asana-border flex items-center px-4 gap-3">
              <div className="w-4 h-4 bg-gray-200 rounded-full" />
              <div className="h-3 bg-gray-200 rounded flex-1 max-w-xs" />
              <div className="w-6 h-6 bg-gray-200 rounded-full ml-auto" />
              <div className="h-3 bg-gray-200 rounded w-16" />
              <div className="h-5 bg-gray-200 rounded-full w-14" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-asana-text-secondary text-sm">{error || 'Projekt nicht gefunden'}</p>
          <button
            onClick={fetchProject}
            className="mt-2 text-sm text-asana-link hover:underline"
          >
            Erneut versuchen
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex">
      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <ProjectHeader project={project} activeView="list" />
        <TaskListView
          sections={project.sections || []}
          projectId={projectId}
          onTaskSelect={(id) => setSelectedTaskId(id)}
          selectedTaskId={selectedTaskId}
          onRefresh={fetchProject}
        />
      </div>

      {/* Detail pane */}
      {selectedTaskId && (
        <TaskDetailPane
          taskId={selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
          onRefresh={fetchProject}
        />
      )}
    </div>
  )
}
