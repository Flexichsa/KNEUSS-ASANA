'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { CheckCircle, Clock, AlertTriangle, FolderOpen, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { TaskType, ProjectType } from '@/types'
import { formatDueDate, isDueDateOverdue } from '@/lib/utils'
import Avatar from '@/components/ui/Avatar'

export default function HomePage() {
  const { data: session } = useSession()
  const [tasks, setTasks] = useState<TaskType[]>([])
  const [projects, setProjects] = useState<ProjectType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/tasks?assigneeId=' + session?.user?.id).then(r => r.json()),
      fetch('/api/projects').then(r => r.json()),
    ]).then(([tasksData, projectsData]) => {
      setTasks(Array.isArray(tasksData) ? tasksData : [])
      setProjects(Array.isArray(projectsData) ? projectsData : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [session?.user?.id])

  const completedTasks = tasks.filter(t => t.completed).length
  const overdueTasks = tasks.filter(t => !t.completed && isDueDateOverdue(t.dueDate))
  const upcomingTasks = tasks.filter(t => !t.completed && !isDueDateOverdue(t.dueDate))

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  if (loading) {
    return (
      <div className="p-8">
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
    <div className="p-8 max-w-6xl mx-auto">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-asana-text-primary">
          {greeting()}, {session?.user?.name?.split(' ')[0]}
        </h1>
        <p className="text-asana-text-secondary mt-1">
          Here&apos;s what&apos;s happening with your tasks today.
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
            <p className="text-xs text-asana-text-secondary">Total Tasks</p>
          </div>
        </div>
        <div className="asana-card flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
            <TrendingUp size={20} className="text-asana-success" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-asana-text-primary">{completedTasks}</p>
            <p className="text-xs text-asana-text-secondary">Completed</p>
          </div>
        </div>
        <div className="asana-card flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
            <AlertTriangle size={20} className="text-asana-danger" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-asana-text-primary">{overdueTasks.length}</p>
            <p className="text-xs text-asana-text-secondary">Overdue</p>
          </div>
        </div>
        <div className="asana-card flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
            <FolderOpen size={20} className="text-asana-project-purple" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-asana-text-primary">{projects.length}</p>
            <p className="text-xs text-asana-text-secondary">Projects</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Tasks */}
        <div className="asana-card">
          <h2 className="text-sm font-semibold text-asana-text-primary mb-4 flex items-center gap-2">
            <Clock size={16} />
            Upcoming Tasks
          </h2>
          {upcomingTasks.length === 0 ? (
            <p className="text-sm text-asana-text-secondary py-4 text-center">
              No upcoming tasks. You&apos;re all caught up!
            </p>
          ) : (
            <div className="space-y-2">
              {upcomingTasks.slice(0, 8).map(task => (
                <Link
                  key={task.id}
                  href={`/projects/${task.projectId}/list`}
                  className="flex items-center gap-3 py-2 px-2 rounded-md hover:bg-asana-bg-secondary group"
                >
                  <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0" />
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
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Projects */}
        <div className="asana-card">
          <h2 className="text-sm font-semibold text-asana-text-primary mb-4 flex items-center gap-2">
            <FolderOpen size={16} />
            Your Projects
          </h2>
          {projects.length === 0 ? (
            <p className="text-sm text-asana-text-secondary py-4 text-center">
              No projects yet. Create one to get started!
            </p>
          ) : (
            <div className="space-y-2">
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
                    {project._count?.tasks ?? 0} tasks
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
            Overdue Tasks ({overdueTasks.length})
          </h2>
          <div className="space-y-2">
            {overdueTasks.map(task => (
              <Link
                key={task.id}
                href={`/projects/${task.projectId}/list`}
                className="flex items-center gap-3 py-2 px-2 rounded-md hover:bg-red-50"
              >
                <div className="w-4 h-4 rounded-full border-2 border-asana-danger flex-shrink-0" />
                <span className="text-sm text-asana-text-primary flex-1 truncate">
                  {task.title}
                </span>
                <span className="text-xs text-asana-danger font-medium">
                  {formatDueDate(task.dueDate)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
