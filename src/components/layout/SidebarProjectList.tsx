'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ProjectType } from '@/types'

export default function SidebarProjectList() {
  const [projects, setProjects] = useState<ProjectType[]>([])
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch('/api/projects')
        if (res.ok) {
          const data = await res.json()
          setProjects(data)
        }
      } catch (error) {
        console.error('Failed to fetch projects:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
  }, [])

  if (loading) {
    return (
      <div className="px-4 space-y-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 py-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-asana-sidebar-hover animate-pulse" />
            <div className="h-3 w-24 bg-asana-sidebar-hover rounded animate-pulse" />
          </div>
        ))}
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="px-4 py-2">
        <p className="text-xs text-asana-sidebar-text">No projects yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-0.5">
      {projects.map((project) => {
        const isActive = pathname.startsWith(`/projects/${project.id}`)
        return (
          <Link
            key={project.id}
            href={`/projects/${project.id}/list`}
            className={`
              flex items-center gap-3 px-4 py-1.5 text-sm transition-colors duration-150 rounded-md mx-2
              ${
                isActive
                  ? 'bg-asana-sidebar-hover text-asana-sidebar-active'
                  : 'text-asana-sidebar-text hover:bg-asana-sidebar-hover'
              }
            `}
          >
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: project.color || '#4573D2' }}
            />
            <span className="truncate">{project.name}</span>
          </Link>
        )
      })}
    </div>
  )
}
