'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from '@/lib/utils'
import type { TaskType, UserType } from '@/types'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import DatePicker from '@/components/ui/DatePicker'
import Avatar from '@/components/ui/Avatar'
import SubtaskList from '@/components/tasks/SubtaskList'
import CommentSection from '@/components/tasks/CommentSection'
import { X, Check, Link as LinkIcon, Loader2 } from 'lucide-react'

interface TaskDetailPaneProps {
  taskId: string
  onClose: () => void
  onRefresh: () => void
}

export default function TaskDetailPane({ taskId, onClose, onRefresh }: TaskDetailPaneProps) {
  const [task, setTask] = useState<TaskType | null>(null)
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [members, setMembers] = useState<UserType[]>([])

  const fetchTask = useCallback(async () => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`)
      if (!res.ok) throw new Error('Failed to fetch task')
      const data: TaskType = await res.json()
      setTask(data)
      setTitle(data.title)
      setDescription(data.description || '')

      // Fetch project members for assignee dropdown
      if (data.projectId) {
        const projRes = await fetch(`/api/projects/${data.projectId}`)
        if (projRes.ok) {
          const project = await projRes.json()
          if (project.members) {
            setMembers(project.members.map((m: { user: UserType }) => m.user).filter(Boolean))
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch task:', error)
    } finally {
      setLoading(false)
    }
  }, [taskId])

  useEffect(() => {
    fetchTask()
  }, [fetchTask])

  const updateTask = async (updates: Partial<TaskType>) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (res.ok) {
        const updated = await res.json()
        setTask(updated)
        onRefresh()
      }
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }

  const handleTitleBlur = () => {
    const trimmed = title.trim()
    if (trimmed && trimmed !== task?.title) {
      updateTask({ title: trimmed })
    }
  }

  const handleDescriptionBlur = () => {
    if (description !== (task?.description || '')) {
      updateTask({ description: description || null } as Partial<TaskType>)
    }
  }

  const handleComplete = () => {
    if (!task) return
    updateTask({ completed: !task.completed } as Partial<TaskType>)
  }

  const handleRefresh = () => {
    fetchTask()
    onRefresh()
  }

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [onClose])

  if (loading) {
    return (
      <div className="w-[500px] border-l border-asana-border bg-white h-full flex items-center justify-center flex-shrink-0">
        <Loader2 size={24} className="animate-spin text-asana-text-secondary" />
      </div>
    )
  }

  if (!task) {
    return (
      <div className="w-[500px] border-l border-asana-border bg-white h-full flex items-center justify-center flex-shrink-0">
        <p className="text-sm text-asana-text-secondary">Aufgabe nicht gefunden</p>
      </div>
    )
  }

  const memberOptions = members.map((m) => ({
    label: m.name,
    value: m.id,
  }))

  const prioritySelectOptions = PRIORITY_OPTIONS.map((p) => ({
    label: p.label,
    value: p.value,
  }))

  const statusSelectOptions = STATUS_OPTIONS.map((s) => ({
    label: s.label,
    value: s.value,
  }))

  return (
    <div className="w-[500px] border-l border-asana-border bg-white h-full flex flex-col flex-shrink-0 animate-[slideInRight_200ms_ease-out]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-asana-border">
        <Button
          variant={task.completed ? 'secondary' : 'primary'}
          size="sm"
          onClick={handleComplete}
        >
          <Check size={14} />
          {task.completed ? 'Erledigt' : 'Als erledigt markieren'}
        </Button>
        <button
          onClick={onClose}
          className="p-1.5 text-asana-text-secondary hover:text-asana-text-primary hover:bg-gray-100 rounded transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-4">
          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            className={cn(
              'w-full text-xl font-semibold text-asana-text-primary bg-transparent border-none outline-none',
              'focus:ring-0 placeholder:text-asana-text-secondary',
              task.completed && 'line-through text-asana-text-secondary'
            )}
            placeholder="Aufgabenname"
          />

          {/* Fields */}
          <div className="mt-6 space-y-4">
            {/* Assignee */}
            <div className="flex items-center gap-4">
              <label className="w-24 text-sm text-asana-text-secondary flex-shrink-0">
                Zuständig
              </label>
              <div className="flex-1 flex items-center gap-2">
                {task.assignee && (
                  <Avatar
                    src={task.assignee.avatar}
                    name={task.assignee.name}
                    size="xs"
                  />
                )}
                <Select
                  value={task.assigneeId || ''}
                  onChange={(value) => updateTask({ assigneeId: value || null } as Partial<TaskType>)}
                  options={[
                    { label: 'Nicht zugewiesen', value: '' },
                    ...memberOptions,
                  ]}
                  placeholder="Zuweisen an..."
                  className="flex-1"
                />
              </div>
            </div>

            {/* Due Date */}
            <div className="flex items-center gap-4">
              <label className="w-24 text-sm text-asana-text-secondary flex-shrink-0">
                Fällig am
              </label>
              <DatePicker
                value={task.dueDate ? new Date(task.dueDate) : null}
                onChange={(date) =>
                  updateTask({ dueDate: date ? date.toISOString() : null } as Partial<TaskType>)
                }
                placeholder="Kein Fälligkeitsdatum"
                className="flex-1"
              />
            </div>

            {/* Priority */}
            <div className="flex items-center gap-4">
              <label className="w-24 text-sm text-asana-text-secondary flex-shrink-0">
                Priorität
              </label>
              <Select
                value={task.priority}
                onChange={(value) => updateTask({ priority: value } as Partial<TaskType>)}
                options={prioritySelectOptions}
                className="flex-1"
              />
            </div>

            {/* Status */}
            <div className="flex items-center gap-4">
              <label className="w-24 text-sm text-asana-text-secondary flex-shrink-0">
                Status
              </label>
              <Select
                value={task.status}
                onChange={(value) => updateTask({ status: value } as Partial<TaskType>)}
                options={statusSelectOptions}
                className="flex-1"
              />
            </div>

            {/* Project */}
            {task.project && (
              <div className="flex items-center gap-4">
                <label className="w-24 text-sm text-asana-text-secondary flex-shrink-0">
                  Projekt
                </label>
                <a
                  href={`/projects/${task.projectId}/list`}
                  className="flex items-center gap-1.5 text-sm text-asana-link hover:underline"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: task.project.color }}
                  />
                  {task.project.name}
                  <LinkIcon size={12} />
                </a>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-asana-border my-6" />

          {/* Description */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-asana-text-primary mb-2">Beschreibung</h4>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleDescriptionBlur}
              placeholder="Beschreibung hinzufügen..."
              rows={3}
              className={cn(
                'w-full px-3 py-2 text-sm bg-white border border-transparent rounded-lg resize-none',
                'placeholder:text-asana-text-secondary text-asana-text-primary',
                'hover:border-asana-border focus:border-asana-link focus:ring-2 focus:ring-asana-link',
                'outline-none transition-colors'
              )}
            />
          </div>

          {/* Divider */}
          <div className="border-t border-asana-border my-6" />

          {/* Subtasks */}
          <div className="mb-6">
            <SubtaskList
              taskId={task.id}
              subtasks={task.subtasks || []}
              onRefresh={handleRefresh}
            />
          </div>

          {/* Divider */}
          <div className="border-t border-asana-border my-6" />

          {/* Comments */}
          <CommentSection
            taskId={task.id}
            comments={task.comments || []}
            onRefresh={handleRefresh}
          />
        </div>
      </div>

      <style jsx global>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}
