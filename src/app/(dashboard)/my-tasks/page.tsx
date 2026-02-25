'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState, useCallback } from 'react'
import { TaskType } from '@/types'
import { isDueDateOverdue, STATUS_OPTIONS } from '@/lib/utils'
import TaskRow from '@/components/tasks/TaskRow'
import TaskDetailPane from '@/components/tasks/TaskDetailPane'
import { ChevronDown, ChevronRight, Plus } from 'lucide-react'

interface TaskSection {
  title: string
  tasks: TaskType[]
}

export default function MyTasksPage() {
  const { data: session } = useSession()
  const [tasks, setTasks] = useState<TaskType[]>([])
  const [loading, setLoading] = useState(true)
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set())
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  const fetchTasks = useCallback(async () => {
    if (!session?.user?.id) return
    try {
      const res = await fetch(`/api/tasks?assigneeId=${session.user.id}`)
      const data = await res.json()
      setTasks(Array.isArray(data) ? data.filter((t: TaskType) => !t.completed) : [])
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [session?.user?.id])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  const toggleSection = (title: string) => {
    setCollapsedSections(prev => {
      const next = new Set(prev)
      if (next.has(title)) next.delete(title)
      else next.add(title)
      return next
    })
  }

  // Group tasks by timeframe
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)

  const sections: TaskSection[] = [
    {
      title: 'Überfällig',
      tasks: tasks.filter(t => t.dueDate && isDueDateOverdue(t.dueDate)),
    },
    {
      title: 'Heute',
      tasks: tasks.filter(t => {
        if (!t.dueDate) return false
        const d = new Date(t.dueDate)
        d.setHours(0, 0, 0, 0)
        return d.getTime() === today.getTime()
      }),
    },
    {
      title: 'Anstehend',
      tasks: tasks.filter(t => {
        if (!t.dueDate) return false
        const d = new Date(t.dueDate)
        d.setHours(0, 0, 0, 0)
        return d > today && d <= weekFromNow
      }),
    },
    {
      title: 'Später',
      tasks: tasks.filter(t => {
        if (!t.dueDate) return false
        const d = new Date(t.dueDate)
        d.setHours(0, 0, 0, 0)
        return d > weekFromNow
      }),
    },
  ].filter(s => s.tasks.length > 0)

  // Tasks without due date
  const noDueDateTasks = tasks.filter(t => !t.dueDate)
  if (noDueDateTasks.length > 0) {
    sections.push({ title: 'Kürzlich zugewiesen', tasks: noDueDateTasks })
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-32" />
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-9 bg-gray-100 rounded" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex">
      {/* Task list */}
      <div className="flex-1 overflow-y-auto">
        {/* Column headers - sticky row */}
        <div className="sticky top-0 z-20 bg-white border-b border-asana-border">
          <table className="w-full table-fixed">
            <colgroup>
              <col /> {/* Task name - flexible */}
              <col style={{ width: 52 }} /> {/* Zuständig */}
              <col style={{ width: 110 }} /> {/* Fälligkeitsdatum */}
              <col style={{ width: 120 }} /> {/* Status */}
              <col style={{ width: 140 }} /> {/* Projekt */}
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
                <th className="text-left py-1.5 px-3 text-[11px] font-medium text-asana-text-secondary tracking-wide">
                  Projekt
                </th>
                <th className="py-1.5 px-2 text-[11px] font-medium text-asana-text-secondary text-center tracking-wide">
                  Prio
                </th>
              </tr>
            </thead>
          </table>
        </div>

        {sections.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-asana-text-secondary">Ihnen wurden noch keine Aufgaben zugewiesen.</p>
            <p className="text-sm text-asana-text-secondary mt-1">
              Ihnen zugewiesene Aufgaben erscheinen hier.
            </p>
          </div>
        ) : (
          sections.map(section => (
            <div key={section.title}>
              {/* Section Header */}
              <div
                onClick={() => toggleSection(section.title)}
                className="flex items-center gap-2 py-2 px-4 cursor-pointer group hover:bg-asana-bg-secondary sticky top-[33px] bg-white z-10 border-b border-asana-border"
              >
                <button className="p-0.5 text-asana-text-secondary hover:text-asana-text-primary transition-colors">
                  {collapsedSections.has(section.title) ? (
                    <ChevronRight size={14} />
                  ) : (
                    <ChevronDown size={14} />
                  )}
                </button>
                <h3 className="text-[13px] font-semibold text-asana-text-primary">
                  {section.title}
                </h3>
                <span className="text-[11px] text-asana-text-secondary">
                  {section.tasks.length}
                </span>
              </div>

              {/* Tasks */}
              {!collapsedSections.has(section.title) && (
                <table className="w-full table-fixed">
                  <colgroup>
                    <col /> {/* Task name - flexible */}
                    <col style={{ width: 52 }} /> {/* Zuständig */}
                    <col style={{ width: 110 }} /> {/* Fälligkeitsdatum */}
                    <col style={{ width: 120 }} /> {/* Status */}
                    <col style={{ width: 140 }} /> {/* Projekt */}
                    <col style={{ width: 48 }} /> {/* Priorität */}
                  </colgroup>
                  <tbody>
                    {section.tasks.map(task => (
                      <TaskRow
                        key={task.id}
                        task={task}
                        onSelect={(id) => setSelectedTaskId(id)}
                        isSelected={selectedTaskId === task.id}
                        onRefresh={fetchTasks}
                        showProject={true}
                      />
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ))
        )}
      </div>

      {/* Detail pane */}
      {selectedTaskId && (
        <TaskDetailPane
          taskId={selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
          onRefresh={fetchTasks}
        />
      )}
    </div>
  )
}
