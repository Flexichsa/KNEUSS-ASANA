'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState, useCallback } from 'react'
import { TaskType } from '@/types'
import { formatDueDate, isDueDateOverdue } from '@/lib/utils'
import Checkbox from '@/components/ui/Checkbox'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import { ChevronDown, ChevronRight, Plus } from 'lucide-react'
import Link from 'next/link'

interface TaskSection {
  title: string
  tasks: TaskType[]
}

export default function MyTasksPage() {
  const { data: session } = useSession()
  const [tasks, setTasks] = useState<TaskType[]>([])
  const [loading, setLoading] = useState(true)
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set())

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

  const toggleComplete = async (taskId: string) => {
    await fetch(`/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: true }),
    })
    fetchTasks()
  }

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
        if (!t.dueDate) {
          // Include tasks without a due date that aren't overdue
          return !isDueDateOverdue(t.dueDate)
        }
        const d = new Date(t.dueDate)
        d.setHours(0, 0, 0, 0)
        return d > weekFromNow
      }),
    },
  ].filter(s => s.tasks.length > 0)

  // Tasks without due date that weren't caught above
  const noDueDateTasks = tasks.filter(t => !t.dueDate)
  if (noDueDateTasks.length > 0 && !sections.find(s => s.title === 'Kürzlich zugewiesen')) {
    sections.push({ title: 'Kürzlich zugewiesen', tasks: noDueDateTasks })
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-32" />
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-10 bg-gray-100 rounded" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-xl font-medium text-asana-text-primary">Meine Aufgaben</h1>
      </div>

      {sections.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-asana-text-secondary">Ihnen wurden noch keine Aufgaben zugewiesen.</p>
          <p className="text-sm text-asana-text-secondary mt-1">
            Ihnen zugewiesene Aufgaben erscheinen hier.
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {sections.map(section => (
            <div key={section.title}>
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.title)}
                className="flex items-center gap-2 py-2 px-2 w-full text-left hover:bg-asana-bg-secondary rounded-md group"
              >
                {collapsedSections.has(section.title) ? (
                  <ChevronRight size={14} className="text-asana-text-secondary" />
                ) : (
                  <ChevronDown size={14} className="text-asana-text-secondary" />
                )}
                <span className="text-sm font-semibold text-asana-text-primary">
                  {section.title}
                </span>
                <span className="text-xs text-asana-text-secondary">
                  {section.tasks.length}
                </span>
              </button>

              {/* Tasks */}
              {!collapsedSections.has(section.title) && (
                <div>
                  {section.tasks.map(task => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 py-2 px-2 pl-8 hover:bg-asana-bg-secondary rounded-md group border-b border-asana-border last:border-0"
                    >
                      <Checkbox
                        checked={task.completed}
                        onChange={() => toggleComplete(task.id)}
                        size="sm"
                      />
                      <Link
                        href={`/projects/${task.projectId}/list`}
                        className="flex-1 text-sm text-asana-text-primary truncate hover:text-asana-link"
                      >
                        {task.title}
                      </Link>
                      {task.dueDate && (
                        <span
                          className={`text-xs ${
                            isDueDateOverdue(task.dueDate)
                              ? 'text-asana-danger font-medium'
                              : 'text-asana-text-secondary'
                          }`}
                        >
                          {formatDueDate(task.dueDate)}
                        </span>
                      )}
                      {task.priority && task.priority !== 'medium' && (
                        <Badge variant="priority">{task.priority}</Badge>
                      )}
                      {task.project && (
                        <span className="text-xs text-asana-text-secondary truncate max-w-[120px]">
                          {task.project.name}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
