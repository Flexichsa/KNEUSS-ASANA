'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Users, ChevronDown, ChevronRight } from 'lucide-react'
import { TeamType } from '@/types'

export default function SidebarTeamList() {
  const [teams, setTeams] = useState<TeamType[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set())
  const pathname = usePathname()

  useEffect(() => {
    async function fetchTeams() {
      try {
        const res = await fetch('/api/teams')
        if (res.ok) {
          const data = await res.json()
          setTeams(data)
        }
      } catch (error) {
        console.error('Failed to fetch teams:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchTeams()
  }, [])

  function toggleTeam(teamId: string) {
    setExpandedTeams((prev) => {
      const next = new Set(prev)
      if (next.has(teamId)) {
        next.delete(teamId)
      } else {
        next.add(teamId)
      }
      return next
    })
  }

  if (loading) {
    return (
      <div className="px-4 space-y-1">
        {[1, 2].map((i) => (
          <div key={i} className="flex items-center gap-3 py-1.5">
            <div className="w-4 h-4 rounded bg-asana-sidebar-hover animate-pulse" />
            <div className="h-3 w-20 bg-asana-sidebar-hover rounded animate-pulse" />
          </div>
        ))}
      </div>
    )
  }

  if (teams.length === 0) {
    return (
      <div className="px-4 py-2">
        <p className="text-xs text-asana-sidebar-text">Noch keine Teams</p>
      </div>
    )
  }

  return (
    <div className="space-y-0.5">
      {teams.map((team) => {
        const isExpanded = expandedTeams.has(team.id)
        return (
          <div key={team.id}>
            <button
              onClick={() => toggleTeam(team.id)}
              className="flex items-center gap-3 px-4 py-1.5 text-sm text-asana-sidebar-text hover:bg-asana-sidebar-hover transition-colors duration-150 w-full rounded-md mx-2"
              style={{ width: 'calc(100% - 16px)' }}
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3 flex-shrink-0" />
              ) : (
                <ChevronRight className="w-3 h-3 flex-shrink-0" />
              )}
              <Users className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{team.name}</span>
            </button>

            {isExpanded && team.projects && team.projects.length > 0 && (
              <div className="ml-6 space-y-0.5">
                {team.projects.map((project) => {
                  const isActive = pathname.startsWith(
                    `/projects/${project.id}`
                  )
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
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: project.color || '#4573D2',
                        }}
                      />
                      <span className="truncate">{project.name}</span>
                    </Link>
                  )
                })}
              </div>
            )}

            {isExpanded &&
              (!team.projects || team.projects.length === 0) && (
                <div className="ml-10 px-4 py-1.5">
                  <p className="text-xs text-asana-sidebar-text">
                    Keine Projekte in diesem Team
                  </p>
                </div>
              )}
          </div>
        )
      })}
    </div>
  )
}
