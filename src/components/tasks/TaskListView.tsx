'use client'

import React, { useState } from 'react'
import type { SectionType } from '@/types'
import TaskRow from '@/components/tasks/TaskRow'
import { ChevronDown, ChevronRight, Plus } from 'lucide-react'

interface TaskListViewProps {
  sections: SectionType[]
  projectId: string
  onTaskSelect: (taskId: string) => void
  selectedTaskId: string | null
  onRefresh: () => void
}

function SectionGroup({
  section,
  projectId,
  onTaskSelect,
  selectedTaskId,
  onRefresh,
}: {
  section: SectionType
  projectId: string
  onTaskSelect: (taskId: string) => void
  selectedTaskId: string | null
  onRefresh: () => void
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const handleAddTask = async () => {
    const title = newTaskTitle.trim()
    if (!title) return

    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          projectId,
          sectionId: section.id,
        }),
      })
      setNewTaskTitle('')
      setIsAdding(false)
      onRefresh()
    } catch (error) {
      console.error('Failed to add task:', error)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddTask()
    } else if (e.key === 'Escape') {
      setNewTaskTitle('')
      setIsAdding(false)
    }
  }

  const tasks = section.tasks || []
  const completedCount = tasks.filter(t => t.completed).length

  return (
    <div>
      {/* Section Header */}
      <div
        className="flex items-center gap-2 py-2 px-4 cursor-pointer group hover:bg-asana-bg-secondary sticky top-[33px] bg-white z-10 border-b border-asana-border"
        onClick={() => setCollapsed(!collapsed)}
      >
        <button className="p-0.5 text-asana-text-secondary hover:text-asana-text-primary transition-colors">
          {collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
        </button>
        <h3 className="text-[13px] font-semibold text-asana-text-primary">
          {section.name}
        </h3>
        <span className="text-[11px] text-asana-text-secondary">
          {completedCount}/{tasks.length}
        </span>
      </div>

      {/* Section Tasks */}
      {!collapsed && (
        <table className="w-full table-fixed">
          <colgroup>
            <col /> {/* Task name - flexible */}
            <col style={{ width: 52 }} /> {/* Zuständig */}
            <col style={{ width: 110 }} /> {/* Fälligkeitsdatum */}
            <col style={{ width: 120 }} /> {/* Status */}
            <col style={{ width: 48 }} /> {/* Priorität */}
          </colgroup>
          <tbody>
            {tasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onSelect={onTaskSelect}
                isSelected={selectedTaskId === task.id}
                onRefresh={onRefresh}
                showProject={false}
              />
            ))}
          </tbody>
        </table>
      )}

      {/* Add Task Row */}
      {!collapsed && (
        <div className="border-b border-asana-border">
          {isAdding ? (
            <div className="flex items-center gap-2 py-1.5 px-4">
              <div className="w-[18px] h-[18px] rounded-full border-2 border-gray-300 flex-shrink-0" />
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={() => {
                  if (!newTaskTitle.trim()) {
                    setIsAdding(false)
                  }
                }}
                placeholder="Aufgabenname eingeben..."
                className="flex-1 text-[13px] bg-transparent outline-none placeholder:text-asana-text-secondary text-asana-text-primary"
                autoFocus
              />
            </div>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 w-full py-1.5 px-4 text-[13px] text-asana-text-secondary hover:text-asana-text-primary hover:bg-asana-bg-secondary transition-colors"
            >
              <Plus size={14} />
              <span>Aufgabe hinzufügen</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default function TaskListView({
  sections,
  projectId,
  onTaskSelect,
  selectedTaskId,
  onRefresh,
}: TaskListViewProps) {
  const [addingSectionName, setAddingSectionName] = useState('')
  const [isAddingSection, setIsAddingSection] = useState(false)

  const handleAddSection = async () => {
    const name = addingSectionName.trim()
    if (!name) return
    try {
      await fetch('/api/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, projectId }),
      })
      setAddingSectionName('')
      setIsAddingSection(false)
      onRefresh()
    } catch (error) {
      console.error('Failed to add section:', error)
    }
  }

  return (
    <div className="flex-1 overflow-auto">
      {/* Column headers - sticky row */}
      <div className="sticky top-0 z-20 bg-white border-b border-asana-border">
        <table className="w-full table-fixed">
          <colgroup>
            <col /> {/* Task name - flexible */}
            <col style={{ width: 52 }} /> {/* Zuständig */}
            <col style={{ width: 110 }} /> {/* Fälligkeitsdatum */}
            <col style={{ width: 120 }} /> {/* Status */}
            <col style={{ width: 48 }} /> {/* Priorität */}
          </colgroup>
          <thead>
            <tr>
              <th className="text-left py-1.5 pl-4 pr-2 text-[11px] font-medium text-asana-text-secondary tracking-wide">
                Aufgabenname
              </th>
              <th className="py-1.5 px-1 text-[11px] font-medium text-asana-text-secondary text-center tracking-wide">
                Zuständig
              </th>
              <th className="text-left py-1.5 px-3 text-[11px] font-medium text-asana-text-secondary tracking-wide">
                Fällig am
              </th>
              <th className="text-left py-1.5 px-2 text-[11px] font-medium text-asana-text-secondary tracking-wide">
                Status
              </th>
              <th className="py-1.5 px-2 text-[11px] font-medium text-asana-text-secondary text-center tracking-wide">
                Prio
              </th>
            </tr>
          </thead>
        </table>
      </div>

      {/* Sections */}
      {sections.map((section) => (
        <SectionGroup
          key={section.id}
          section={section}
          projectId={projectId}
          onTaskSelect={onTaskSelect}
          selectedTaskId={selectedTaskId}
          onRefresh={onRefresh}
        />
      ))}

      {/* Add Section */}
      <div className="border-b border-asana-border">
        {isAddingSection ? (
          <div className="flex items-center gap-2 py-2 px-4">
            <input
              type="text"
              value={addingSectionName}
              onChange={(e) => setAddingSectionName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddSection()
                if (e.key === 'Escape') { setIsAddingSection(false); setAddingSectionName('') }
              }}
              onBlur={() => {
                if (!addingSectionName.trim()) setIsAddingSection(false)
              }}
              placeholder="Abschnittname eingeben..."
              className="flex-1 text-[13px] font-semibold bg-transparent outline-none placeholder:text-asana-text-secondary text-asana-text-primary"
              autoFocus
            />
          </div>
        ) : (
          <button
            onClick={() => setIsAddingSection(true)}
            className="flex items-center gap-2 w-full py-2 px-4 text-[13px] text-asana-text-secondary hover:text-asana-text-primary hover:bg-asana-bg-secondary transition-colors"
          >
            <Plus size={14} />
            <span>Abschnitt hinzufügen</span>
          </button>
        )}
      </div>

      {sections.length === 0 && !isAddingSection && (
        <div className="flex flex-col items-center justify-center py-20 text-asana-text-secondary">
          <p className="text-sm">Noch keine Abschnitte. Erstellen Sie einen Abschnitt, um loszulegen.</p>
        </div>
      )}
    </div>
  )
}
