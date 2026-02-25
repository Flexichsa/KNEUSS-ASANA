'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState, useCallback } from 'react'
import { CheckCircle, Clock, AlertTriangle, FolderOpen, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { TaskType, ProjectType } from '@/types'
import { formatDueDate, isDueDateOverdue } from '@/lib/utils'
import Avatar from '@/components/ui/Avatar'
import Checkbox from '@/components/ui/Checkbox'
import TaskDetailPane from '@/components/tasks/TaskDetailPane'

export default function HomePage() {
  const { data: session } = useSession()
  const [tasks, setTasks] = useState<TaskType[]>([])
  const [projects, setProjects] = useState<ProjectType[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!session?.user?.id) return
    try {
      const [tasksData, projectsData] = await Promise.all([
        fetch('/api/tasks?assigneeId=' + session.user.id).then(r => r.json()),
        fetch('/api/projects').then(r => r.json()),
      ])
      setTasks(Array.isArray(tasksData) ? tasksData : [])
      setProjects(Array.isArray(projectsData) ? projectsData : [])
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [session?.user?.id])

  useEffect(() => { fetchData() }, [fetchData])

  const toggleComplete = async (taskId: string, completed: boolean) => {
    await fetch(`/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed }),
    })
    fetchData()
  }

  const completedTasks = tasks.filter(t => t.completed).length
  const overdueTasks = tasks.filter(t => !t.completed && isDueDateOverdue(t.dueDate))
  const upcomingTasks = tasks.filter(t => !t.completed && !isDueDateOverdue(t.dueDate))

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Guten Morgen'
    if (hour < 18) return 'Guten Tag'
    return 'Guten Abend'
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-200 rounded-lg" />)}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex">
      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl">
          {/* Greeting */}
          <div className="mb-8">
            <h1 className="text-2xl font-medium text-asana-text-primary">
              {greeting()}, {session?.user?.name?.split(' ')[0]}
            </h1>
            <p className="text-asana-text-secondary mt-1">
              Hier ist der aktuelle Stand Ihrer Aufgaben.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="asana-card flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <CheckCircle size={20} className="text-asana-link" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-asana-text-primary">{tasks.length}</p>
                <p className="text-xs text-asana-text-secondary">Alle Aufgaben</p>
              </div>
            </div>
            <div className="asana-card flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <TrendingUp size={20} className="text-asana-success" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-asana-text-primary">{completedTasks}</p>
                <p className="text-xs text-asana-text-secondary">Abgeschlossen</p>
              </div>
            </div>
            <div className="asana-card flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                <AlertTriangle size={20} className="text-asana-danger" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-asana-text-primary">{overdueTasks.length}</p>
                <p className="text-xs text-asana-text-secondary">Überfällig</p>
              </div>
            </div>
            <div className="asana-card flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <FolderOpen size={20} className="text-asana-project-purple" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-asana-text-primary">{projects.length}</p>
                <p className="text-xs text-asana-text-secondary">Projekte</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Tasks */}
            <div className="asana-card">
              <h2 className="text-sm font-semibold text-asana-text-primary mb-4 flex items-center gap-2">
                <Clock size={16} />
                Anstehende Aufgaben
              </h2>
              {upcomingTasks.length === 0 ? (
                <p className="text-sm text-asana-text-secondary py-4 text-center">
                  Keine anstehenden Aufgaben. Alles erledigt!
                </p>
              ) : (
                <div className="space-y-0.5">
                  {upcomingTasks.slice(0, 8).map(task => (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTaskId(task.id)}
                      className={`flex items-center gap-3 py-2 px-2 rounded-md cursor-pointer transition-colors ${
                        selectedTaskId === task.id ? 'bg-blue-50' : 'hover:bg-asana-bg-secondary'
                      }`}
                    >
                      <Checkbox
                        checked={task.completed}
                        onChange={(checked) => toggleComplete(task.id, checked)}
                        size="sm"
                      />
                      <span className="text-sm text-asana-text-primary flex-1 truncate">
                        {task.title}
                      </span>
                      {task.assignee && (
                        <Avatar name={task.assignee.name} size="xs" />
                      )}
                      {task.dueDate && (
                        <span className="text-xs text-asana-text-secondary">
                          {formatDueDate(task.dueDate)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Projects */}
            <div className="asana-card">
              <h2 className="text-sm font-semibold text-asana-text-primary mb-4 flex items-center gap-2">
                <FolderOpen size={16} />
                Ihre Projekte
              </h2>
              {projects.length === 0 ? (
                <p className="text-sm text-asana-text-secondary py-4 text-center">
                  Noch keine Projekte. Erstellen Sie eines, um loszulegen!
                </p>
              ) : (
                <div className="space-y-0.5">
                  {projects.map(project => (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}/list`}
                      className="flex items-center gap-3 py-2 px-2 rounded-md hover:bg-asana-bg-secondary"
                    >
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: project.color }}
                      />
                      <span className="text-sm text-asana-text-primary flex-1 truncate">
                        {project.name}
                      </span>
                      <span className="text-xs text-asana-text-secondary">
                        {project._count?.tasks ?? 0} Aufgaben
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Overdue Tasks */}
          {overdueTasks.length > 0 && (
            <div className="mt-6 asana-card border-l-4 border-l-asana-danger">
              <h2 className="text-sm font-semibold text-asana-danger mb-3 flex items-center gap-2">
                <AlertTriangle size={16} />
                Überfällige Aufgaben ({overdueTasks.length})
              </h2>
              <div className="space-y-0.5">
                {overdueTasks.map(task => (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTaskId(task.id)}
                    className={`flex items-center gap-3 py-2 px-2 rounded-md cursor-pointer transition-colors ${
                      selectedTaskId === task.id ? 'bg-red-100' : 'hover:bg-red-50'
                    }`}
                  >
                    <Checkbox
                      checked={task.completed}
                      onChange={(checked) => toggleComplete(task.id, checked)}
                      size="sm"
                    />
                    <span className="text-sm text-asana-text-primary flex-1 truncate">
                      {task.title}
                    </span>
                    <span className="text-xs text-asana-danger font-medium">
                      {formatDueDate(task.dueDate)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail pane */}
      {selectedTaskId && (
        <TaskDetailPane
          taskId={selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
          onRefresh={fetchData}
        />
      )}
    </div>
  )
}
