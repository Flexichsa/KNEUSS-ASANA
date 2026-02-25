'use client'

import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { List, LayoutGrid, Calendar, GitBranch } from 'lucide-react'

interface ProjectViewTabsProps {
  projectId: string
  activeView: 'list' | 'board' | 'calendar' | 'timeline'
}

const tabs = [
  { key: 'list' as const, label: 'Liste', icon: List },
  { key: 'board' as const, label: 'Board', icon: LayoutGrid },
  { key: 'calendar' as const, label: 'Kalender', icon: Calendar },
  { key: 'timeline' as const, label: 'Zeitachse', icon: GitBranch },
]

export default function ProjectViewTabs({ projectId, activeView }: ProjectViewTabsProps) {
  return (
    <div className="flex items-center gap-1 border-b border-asana-border">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeView === tab.key

        return (
          <Link
            key={tab.key}
            href={`/projects/${projectId}/${tab.key}`}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors relative',
              isActive
                ? 'text-asana-text-primary'
                : 'text-asana-text-secondary hover:text-asana-text-primary'
            )}
          >
            <Icon size={14} />
            <span>{tab.label}</span>
            {isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-asana-text-primary" />
            )}
          </Link>
        )
      })}
    </div>
  )
}
