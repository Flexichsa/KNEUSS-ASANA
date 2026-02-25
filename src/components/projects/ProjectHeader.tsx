'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import type { ProjectType } from '@/types'
import Avatar from '@/components/ui/Avatar'
import Dropdown from '@/components/ui/Dropdown'
import ProjectViewTabs from '@/components/projects/ProjectViewTabs'
import { MoreHorizontal, Settings, Trash2, UserPlus } from 'lucide-react'

interface ProjectHeaderProps {
  project: ProjectType
  activeView: 'list' | 'board' | 'calendar' | 'timeline'
}

export default function ProjectHeader({ project, activeView }: ProjectHeaderProps) {
  const [name, setName] = useState(project.name)
  const [isEditing, setIsEditing] = useState(false)

  const handleNameSave = async () => {
    setIsEditing(false)
    const trimmed = name.trim()
    if (!trimmed || trimmed === project.name) {
      setName(project.name)
      return
    }

    try {
      await fetch(`/api/projects/${project.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      })
    } catch (error) {
      console.error('Failed to update project name:', error)
      setName(project.name)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleNameSave()
    } else if (e.key === 'Escape') {
      setName(project.name)
      setIsEditing(false)
    }
  }

  const members = project.members || []

  const menuItems = [
    {
      label: 'Project Settings',
      onClick: () => {},
      icon: <Settings size={14} />,
    },
    {
      label: 'Add Members',
      onClick: () => {},
      icon: <UserPlus size={14} />,
    },
    {
      label: 'Delete Project',
      onClick: () => {},
      icon: <Trash2 size={14} />,
      destructive: true,
      separator: true,
    },
  ]

  return (
    <div className="bg-white border-b border-asana-border">
      {/* Top section */}
      <div className="flex items-center justify-between px-6 pt-5 pb-3">
        <div className="flex items-center gap-3">
          {/* Color dot */}
          <div
            className="w-3 h-3 rounded-sm flex-shrink-0"
            style={{ backgroundColor: project.color }}
          />

          {/* Project name */}
          {isEditing ? (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={handleNameSave}
              onKeyDown={handleKeyDown}
              className="text-xl font-semibold text-asana-text-primary bg-transparent border-b-2 border-asana-link outline-none px-1"
              autoFocus
            />
          ) : (
            <h1
              onClick={() => setIsEditing(true)}
              className="text-xl font-semibold text-asana-text-primary cursor-pointer hover:bg-asana-bg-secondary px-1 -mx-1 rounded transition-colors"
            >
              {project.name}
            </h1>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Member Avatars */}
          <div className="flex -space-x-1.5">
            {members.slice(0, 5).map((member) => (
              <Avatar
                key={member.userId}
                src={member.user?.avatar}
                name={member.user?.name || 'User'}
                size="sm"
                className="ring-2 ring-white"
              />
            ))}
            {members.length > 5 && (
              <div className="w-7 h-7 rounded-full bg-asana-bg-secondary border-2 border-white flex items-center justify-center text-xs text-asana-text-secondary font-medium">
                +{members.length - 5}
              </div>
            )}
          </div>

          {/* Menu */}
          <Dropdown
            trigger={
              <button className="p-1.5 text-asana-text-secondary hover:text-asana-text-primary hover:bg-gray-100 rounded transition-colors">
                <MoreHorizontal size={18} />
              </button>
            }
            items={menuItems}
            align="right"
          />
        </div>
      </div>

      {/* View Tabs */}
      <div className="px-6">
        <ProjectViewTabs projectId={project.id} activeView={activeView} />
      </div>
    </div>
  )
}
