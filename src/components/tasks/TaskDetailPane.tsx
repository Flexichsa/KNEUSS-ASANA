'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { PRIORITY_OPTIONS, STATUS_OPTIONS, formatDueDate } from '@/lib/utils'
import type { TaskType, UserType } from '@/types'
import Select from '@/components/ui/Select'
import DatePicker from '@/components/ui/DatePicker'
import Avatar from '@/components/ui/Avatar'
import SubtaskList from '@/components/tasks/SubtaskList'
import CommentSection from '@/components/tasks/CommentSection'
import {
  X,
  Check,
  Loader2,
  Trash2,
  ThumbsUp,
  Paperclip,
  Link2,
  ArrowRightToLine,
  MoreHorizontal,
  Calendar,
  Plus,
} from 'lucide-react'

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

  useEffect(() => { fetchTask() }, [fetchTask])

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

  const handleDeleteTask = async () => {
    if (!confirm('Aufgabe wirklich löschen?')) return
    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
      if (res.ok) { onClose(); onRefresh() }
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [onClose])

  if (loading) {
    return (
      <div className="w-[560px] border-l border-asana-border bg-white h-full flex items-center justify-center flex-shrink-0">
        <Loader2 size={24} className="animate-spin text-asana-text-secondary" />
      </div>
    )
  }

  if (!task) {
    return (
      <div className="w-[560px] border-l border-asana-border bg-white h-full flex items-center justify-center flex-shrink-0">
        <p className="text-sm text-asana-text-secondary">Aufgabe nicht gefunden</p>
      </div>
    )
  }

  const memberOptions = members.map((m) => ({ label: m.name, value: m.id }))

  return (
    <div className="w-[560px] border-l border-asana-border bg-white h-full flex flex-col flex-shrink-0 animate-[slideInRight_200ms_ease-out]">
      {/* ===== TOP BAR ===== */}
      <div className="flex items-center justify-between px-5 py-2.5 border-b border-asana-border flex-shrink-0">
        <button
          onClick={handleComplete}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium border transition-colors',
            task.completed
              ? 'bg-green-50 border-green-300 text-green-700'
              : 'bg-white border-asana-border text-asana-text-primary hover:bg-gray-50'
          )}
        >
          <Check size={14} />
          {task.completed ? 'Erledigt' : 'Als erledigt markieren'}
        </button>
        <div className="flex items-center gap-0.5">
          <button className="p-1.5 text-asana-text-secondary hover:bg-gray-100 rounded transition-colors" title="Gefällt mir">
            <ThumbsUp size={16} />
          </button>
          <button className="p-1.5 text-asana-text-secondary hover:bg-gray-100 rounded transition-colors" title="Anhang">
            <Paperclip size={16} />
          </button>
          <button className="p-1.5 text-asana-text-secondary hover:bg-gray-100 rounded transition-colors" title="Link kopieren">
            <Link2 size={16} />
          </button>
          <button
            onClick={handleDeleteTask}
            className="p-1.5 text-asana-text-secondary hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Löschen"
          >
            <Trash2 size={16} />
          </button>
          <button className="p-1.5 text-asana-text-secondary hover:bg-gray-100 rounded transition-colors" title="Mehr">
            <MoreHorizontal size={16} />
          </button>
          <div className="w-px h-4 bg-asana-border mx-1" />
          <button
            onClick={onClose}
            className="p-1.5 text-asana-text-secondary hover:text-asana-text-primary hover:bg-gray-100 rounded transition-colors"
            title="Schliessen"
          >
            <ArrowRightToLine size={16} />
          </button>
        </div>
      </div>

      {/* ===== SCROLLABLE CONTENT ===== */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="px-6 pt-5 pb-4">

          {/* ===== TITLE ===== */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            className={cn(
              'w-full text-[20px] font-semibold text-asana-text-primary bg-transparent border-none outline-none leading-tight',
              'focus:ring-0 placeholder:text-asana-text-secondary',
              task.completed && 'line-through text-asana-text-secondary'
            )}
            placeholder="Aufgabenname"
          />

          {/* ===== TOP FIELDS ===== */}
          <div className="mt-5 space-y-1">
            {/* Verantwortlich */}
            <div className="flex items-center min-h-[36px]">
              <span className="w-[140px] text-[13px] text-asana-text-secondary flex-shrink-0">Verantwortlich</span>
              <div className="flex-1 flex items-center gap-2">
                {task.assignee ? (
                  <div className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-gray-50 -ml-2 group cursor-pointer">
                    <Avatar src={task.assignee.avatar} name={task.assignee.name} size="xs" />
                    <span className="text-[13px] text-asana-text-primary">{task.assignee.name}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); updateTask({ assigneeId: null } as Partial<TaskType>) }}
                      className="text-asana-text-secondary hover:text-asana-text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <Select
                    value=""
                    onChange={(value) => updateTask({ assigneeId: value || null } as Partial<TaskType>)}
                    options={memberOptions}
                    placeholder="Zuweisen..."
                    className="flex-1 max-w-[200px]"
                  />
                )}
              </div>
            </div>

            {/* Fälligkeitsdatum */}
            <div className="flex items-center min-h-[36px]">
              <span className="w-[140px] text-[13px] text-asana-text-secondary flex-shrink-0">Fälligkeitsdatum</span>
              <div className="flex-1">
                {task.dueDate ? (
                  <div className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-gray-50 -ml-2 group cursor-pointer">
                    <Calendar size={14} className="text-asana-text-secondary" />
                    <span className="text-[13px] text-asana-text-primary">{formatDueDate(task.dueDate)}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); updateTask({ dueDate: null } as Partial<TaskType>) }}
                      className="text-asana-text-secondary hover:text-asana-text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <DatePicker
                    value={null}
                    onChange={(date) => updateTask({ dueDate: date ? date.toISOString() : null } as Partial<TaskType>)}
                    placeholder="Fälligkeitsdatum"
                    className="max-w-[200px]"
                  />
                )}
              </div>
            </div>

            {/* Abhängigkeiten */}
            <div className="flex items-center min-h-[36px]">
              <span className="w-[140px] text-[13px] text-asana-text-secondary flex-shrink-0">Abhängigkeiten</span>
              <span className="text-[13px] text-asana-text-secondary cursor-pointer hover:text-asana-link">
                Abhängigkeiten hinzufügen
              </span>
            </div>
          </div>

          {/* ===== PROJEKTE ===== */}
          <div className="mt-3 pt-3 border-t border-asana-border">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[13px] font-medium text-asana-text-primary">Projekte</span>
              {task.project && (
                <span className="text-[11px] text-asana-text-secondary bg-asana-bg-secondary px-1.5 py-0.5 rounded">1</span>
              )}
              <button className="p-0.5 text-asana-text-secondary hover:text-asana-text-primary">
                <Plus size={14} />
              </button>
            </div>
            {task.project && (
              <div className="flex items-center gap-2 ml-4 mb-2">
                <span className="text-[11px] text-asana-text-secondary">▾</span>
                <span
                  className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: task.project.color || '#4573D2' }}
                />
                <a
                  href={`/projects/${task.projectId}/list`}
                  className="text-[13px] font-medium text-asana-text-primary hover:text-asana-link"
                >
                  {task.project.name}
                </a>
                {task.section && (
                  <span className="text-[12px] text-asana-text-secondary">
                    {task.section.name}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* ===== DETAIL FIELDS ===== */}
          <div className="mt-1 border-t border-asana-border pt-3 space-y-1">
            {/* Status */}
            <div className="flex items-center min-h-[36px]">
              <span className="w-[140px] text-[13px] text-asana-text-secondary flex-shrink-0">Status</span>
              <Select
                value={task.status}
                onChange={(value) => updateTask({ status: value } as Partial<TaskType>)}
                options={STATUS_OPTIONS.map(s => ({ label: s.label, value: s.value }))}
                className="max-w-[160px]"
              />
            </div>

            {/* Soll-Ende-Datum */}
            <div className="flex items-center min-h-[36px]">
              <span className="w-[140px] text-[13px] text-asana-text-secondary flex-shrink-0">Soll-Ende-Datum</span>
              <span className="text-[13px] text-asana-text-secondary">—</span>
            </div>

            {/* Liegt bei */}
            <div className="flex items-center min-h-[36px]">
              <span className="w-[140px] text-[13px] text-asana-text-secondary flex-shrink-0">Liegt bei</span>
              {task.project ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[12px] font-medium bg-green-100 text-green-800">
                  {task.project.name}
                </span>
              ) : (
                <span className="text-[13px] text-asana-text-secondary">—</span>
              )}
            </div>

            {/* Prio */}
            <div className="flex items-center min-h-[36px]">
              <span className="w-[140px] text-[13px] text-asana-text-secondary flex-shrink-0">Prio</span>
              <Select
                value={task.priority}
                onChange={(value) => updateTask({ priority: value } as Partial<TaskType>)}
                options={PRIORITY_OPTIONS.map(p => ({ label: p.label, value: p.value }))}
                className="max-w-[160px]"
              />
            </div>
          </div>

          {/* ===== BESCHREIBUNG ===== */}
          <div className="mt-5 pt-4 border-t border-asana-border">
            <h4 className="text-[14px] font-semibold text-asana-text-primary mb-2">Beschreibung</h4>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleDescriptionBlur}
              placeholder="Worum geht es bei dieser Aufgabe?"
              rows={3}
              className={cn(
                'w-full px-3 py-2 text-[13px] bg-white border border-transparent rounded-lg resize-none',
                'placeholder:text-asana-text-secondary text-asana-text-primary',
                'hover:border-asana-border focus:border-asana-link focus:ring-2 focus:ring-asana-link',
                'outline-none transition-colors'
              )}
            />
          </div>

          {/* ===== UNTERAUFGABEN ===== */}
          <div className="mt-4 pt-4 border-t border-asana-border">
            <SubtaskList
              taskId={task.id}
              subtasks={task.subtasks || []}
              onRefresh={handleRefresh}
            />
          </div>

          {/* ===== ANHÄNGE ===== */}
          <div className="mt-4 pt-4 border-t border-asana-border">
            <div className="flex items-center gap-2">
              <h4 className="text-[13px] font-medium text-asana-text-primary">Anhänge</h4>
              <span className="text-[11px] text-asana-text-secondary bg-asana-bg-secondary px-1.5 py-0.5 rounded">0</span>
              <button className="p-0.5 text-asana-text-secondary hover:text-asana-text-primary">
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* ===== KOMMENTARE ===== */}
          <div className="mt-4 pt-4 border-t border-asana-border">
            <CommentSection
              taskId={task.id}
              comments={task.comments || []}
              onRefresh={handleRefresh}
            />
          </div>

          {/* ===== ERSTELLT AM ===== */}
          <p className="text-[11px] text-asana-text-secondary mt-6 pb-4">
            Erstellt am {new Date(task.createdAt).toLocaleDateString('de-CH', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
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
