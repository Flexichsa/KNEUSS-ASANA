'use client'

import { useEffect, useState } from 'react'
import { ProjectType } from '@/types'
import { Plus, FolderOpen } from 'lucide-react'
import Link from 'next/link'
import CreateProjectModal from '@/components/projects/CreateProjectModal'

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectType[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects')
      const data = await res.json()
      setProjects(Array.isArray(data) ? data : [])
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProjects() }, [])

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-medium text-asana-text-primary">Projekte</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="asana-btn-primary flex items-center gap-2"
        >
          <Plus size={16} />
          Neues Projekt
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-asana-bg-secondary flex items-center justify-center mx-auto mb-4">
            <FolderOpen size={28} className="text-asana-text-secondary" />
          </div>
          <h2 className="text-lg font-medium text-asana-text-primary mb-2">Erstellen Sie Ihr erstes Projekt</h2>
          <p className="text-sm text-asana-text-secondary max-w-md mx-auto mb-4">
            Projekte helfen Ihnen, die Arbeit Ihres Teams zu organisieren und zu verfolgen.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="asana-btn-primary"
          >
            <Plus size={16} className="inline mr-1.5" />
            Neues Projekt
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(project => (
            <Link
              key={project.id}
              href={`/projects/${project.id}/list`}
              className="asana-card hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-8 h-8 rounded-md flex items-center justify-center text-white text-sm font-medium"
                  style={{ backgroundColor: project.color }}
                >
                  {project.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-asana-text-primary truncate group-hover:text-asana-link">
                    {project.name}
                  </h3>
                  {project.team && (
                    <p className="text-xs text-asana-text-secondary">{project.team.name}</p>
                  )}
                </div>
              </div>
              {project.description && (
                <p className="text-xs text-asana-text-secondary truncate">{project.description}</p>
              )}
              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs text-asana-text-secondary">
                  {project._count?.tasks ?? 0} Aufgaben
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={() => {
          setShowCreateModal(false)
          fetchProjects()
        }}
      />
    </div>
  )
}
