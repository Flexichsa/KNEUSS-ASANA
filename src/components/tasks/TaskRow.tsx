'use client'

import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { formatDueDate, isDueDateOverdue, STATUS_OPTIONS, PRIORITY_OPTIONS } from '@/lib/utils'
import type { TaskType, UserType } from '@/types'
import Checkbox from '@/components/ui/Checkbox'
import Avatar from '@/components/ui/Avatar'
import DatePicker from '@/components/ui/DatePicker'
import { Flag, MessageSquare, ListChecks, UserPlus, CalendarPlus, Check } from 'lucide-react'

interface TaskRowProps {
  task: TaskType
  onSelect: (taskId: string) => void
  isSelected: boolean
  onRefresh: () => void
  showProject?: boolean
}

const PRIORITY_FLAG_COLORS: Record<string, string> = {
  low: '#6D6E6F',
  medium: '#4573D2',
  high: '#FD9A00',
  urgent: '#E8384F',
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  todo: { bg: 'bg-gray-100', text: 'text-gray-600' },
  in_progress: { bg: 'bg-blue-100', text: 'text-blue-700' },
  review: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  done: { bg: 'bg-green-100', text: 'text-green-700' },
}

// Inline dropdown component
function InlineDropdown({
  isOpen,
  onClose,
  children,
  align = 'left',
}: {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  align?: 'left' | 'right' | 'center'
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={ref}
      className={cn(
        'absolute z-50 mt-1 bg-white border border-asana-border rounded-lg shadow-lg py-1 min-w-[160px] animate-fade-in',
        align === 'right' && 'right-0',
        align === 'center' && 'left-1/2 -translate-x-1/2',
        align === 'left' && 'left-0'
      )}
    >
      {children}
    </div>
  )
}

export default function TaskRow({ task, onSelect, isSelected, onRefresh, showProject = true }: TaskRowProps) {
  const [assigneeOpen, setAssigneeOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)
  const [prioOpen, setPrioOpen] = useState(false)
  const [dateOpen, setDateOpen] = useState(false)
  const [members, setMembers] = useState<UserType[]>([])
  const [membersLoaded, setMembersLoaded] = useState(false)

  const updateTask = async (updates: Record<string, unknown>) => {
    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      onRefresh()
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }

  const handleComplete = async (completed: boolean) => {
    await updateTask({ completed })
  }

  const fetchMembers = async () => {
    if (membersLoaded) return
    try {
      const res = await fetch(`/api/projects/${task.projectId}`)
      if (res.ok) {
        const project = await res.json()
        if (project.members) {
          setMembers(project.members.map((m: { user: UserType }) => m.user).filter(Boolean))
        }
      }
    } catch { /* ignore */ }
    setMembersLoaded(true)
  }

  const closeAll = () => {
    setAssigneeOpen(false)
    setStatusOpen(false)
    setPrioOpen(false)
    setDateOpen(false)
  }

  const overdue = isDueDateOverdue(task.dueDate)
  const priorityColor = PRIORITY_FLAG_COLORS[task.priority] || '#6D6E6F'
  const statusOption = STATUS_OPTIONS.find(s => s.value === task.status)
  const statusColor = STATUS_COLORS[task.status] || STATUS_COLORS.todo
  const subtaskCount = task.subtasks?.length ?? (task as TaskType & { _count?: { subtasks?: number; comments?: number } })._count?.subtasks ?? 0
  const commentCount = task.comments?.length ?? (task as TaskType & { _count?: { subtasks?: number; comments?: number } })._count?.comments ?? 0

  return (
    <tr
      onClick={() => onSelect(task.id)}
      className={cn(
        'group cursor-pointer border-b border-asana-border transition-colors h-9',
        isSelected ? 'bg-blue-50' : 'hover:bg-asana-bg-secondary',
        task.completed && 'opacity-60'
      )}
    >
      {/* Checkbox + Task Name */}
      <td className="py-1.5 pl-4 pr-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <Checkbox checked={task.completed} onChange={handleComplete} size="sm" />
          </div>
          <span className={cn('text-[13px] text-asana-text-primary truncate', task.completed && 'line-through text-asana-text-secondary')}>
            {task.title}
          </span>
          <div className="flex items-center gap-1.5 ml-1 flex-shrink-0">
            {subtaskCount > 0 && (
              <span className="flex items-center gap-0.5 text-[11px] text-asana-text-secondary" title={`${subtaskCount} Unteraufgaben`}>
                <ListChecks size={12} />{subtaskCount}
              </span>
            )}
            {commentCount > 0 && (
              <span className="flex items-center gap-0.5 text-[11px] text-asana-text-secondary" title={`${commentCount} Kommentare`}>
                <MessageSquare size={11} />{commentCount}
              </span>
            )}
          </div>
        </div>
      </td>

      {/* ===== ZUSTÄNDIG (klickbar) ===== */}
      <td className="w-[52px] py-1.5 px-1 text-center relative">
        <div
          onClick={(e) => {
            e.stopPropagation()
            closeAll()
            fetchMembers()
            setAssigneeOpen(true)
          }}
          className="flex items-center justify-center cursor-pointer"
        >
          {task.assignee ? (
            <Avatar src={task.assignee.avatar} name={task.assignee.name} size="xs" />
          ) : (
            <div className="w-6 h-6 rounded-full border border-dashed border-gray-300 flex items-center justify-center hover:border-asana-link opacity-0 group-hover:opacity-100 transition-opacity">
              <UserPlus size={11} className="text-gray-400" />
            </div>
          )}
        </div>

        <InlineDropdown isOpen={assigneeOpen} onClose={() => setAssigneeOpen(false)} align="center">
          <div className="px-2 py-1.5 text-[11px] font-medium text-asana-text-secondary uppercase tracking-wider">
            Zuständig
          </div>
          <button
            className={cn('w-full flex items-center gap-2 px-3 py-1.5 text-[13px] text-left hover:bg-gray-50', !task.assigneeId && 'text-asana-link')}
            onClick={(e) => { e.stopPropagation(); updateTask({ assigneeId: null }); setAssigneeOpen(false) }}
          >
            <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
              <UserPlus size={10} className="text-gray-500" />
            </div>
            <span>Nicht zugewiesen</span>
            {!task.assigneeId && <Check size={14} className="ml-auto text-asana-link" />}
          </button>
          {members.map(m => (
            <button
              key={m.id}
              className={cn('w-full flex items-center gap-2 px-3 py-1.5 text-[13px] text-left hover:bg-gray-50', task.assigneeId === m.id && 'text-asana-link')}
              onClick={(e) => { e.stopPropagation(); updateTask({ assigneeId: m.id }); setAssigneeOpen(false) }}
            >
              <Avatar src={m.avatar} name={m.name} size="xs" />
              <span className="truncate">{m.name}</span>
              {task.assigneeId === m.id && <Check size={14} className="ml-auto text-asana-link flex-shrink-0" />}
            </button>
          ))}
          {!membersLoaded && (
            <div className="px-3 py-2 text-[12px] text-asana-text-secondary">Laden...</div>
          )}
        </InlineDropdown>
      </td>

      {/* ===== FÄLLIGKEITSDATUM (klickbar) ===== */}
      <td className="w-[110px] py-1.5 px-3 relative">
        <div
          onClick={(e) => {
            e.stopPropagation()
            closeAll()
            setDateOpen(true)
          }}
          className="cursor-pointer"
        >
          {task.dueDate ? (
            <span className={cn('text-[12px]', overdue && !task.completed ? 'text-asana-danger font-medium' : 'text-asana-text-secondary')}>
              {formatDueDate(task.dueDate)}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[12px] text-asana-text-secondary opacity-0 group-hover:opacity-100 transition-opacity hover:text-asana-link">
              <CalendarPlus size={12} />
            </span>
          )}
        </div>

        {dateOpen && (
          <div className="absolute z-50 mt-1 left-0" onClick={(e) => e.stopPropagation()}>
            <DatePicker
              value={task.dueDate ? new Date(task.dueDate) : null}
              onChange={(date) => {
                updateTask({ dueDate: date ? date.toISOString() : null })
                setDateOpen(false)
              }}
              placeholder="Datum wählen"
              autoOpen
            />
          </div>
        )}
      </td>

      {/* ===== STATUS (klickbar) ===== */}
      <td className="w-[120px] py-1.5 px-2 relative">
        <div
          onClick={(e) => {
            e.stopPropagation()
            closeAll()
            setStatusOpen(true)
          }}
          className="cursor-pointer"
        >
          <span className={cn(
            'inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium hover:ring-1 hover:ring-gray-300 transition-all',
            statusColor.bg, statusColor.text
          )}>
            {statusOption?.label || task.status}
          </span>
        </div>

        <InlineDropdown isOpen={statusOpen} onClose={() => setStatusOpen(false)} align="left">
          <div className="px-2 py-1.5 text-[11px] font-medium text-asana-text-secondary uppercase tracking-wider">
            Status
          </div>
          {STATUS_OPTIONS.map(opt => {
            const color = STATUS_COLORS[opt.value] || STATUS_COLORS.todo
            return (
              <button
                key={opt.value}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] text-left hover:bg-gray-50 transition-colors"
                onClick={(e) => { e.stopPropagation(); updateTask({ status: opt.value }); setStatusOpen(false) }}
              >
                <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium', color.bg, color.text)}>
                  {opt.label}
                </span>
                {task.status === opt.value && <Check size={14} className="ml-auto text-asana-link" />}
              </button>
            )
          })}
        </InlineDropdown>
      </td>

      {/* Projekt (Liegt bei) */}
      {showProject && (
        <td className="w-[140px] py-1.5 px-3">
          {task.project ? (
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ backgroundColor: task.project.color || '#4573D2' }} />
              <span className="text-[12px] text-asana-text-secondary truncate">{task.project.name}</span>
            </div>
          ) : null}
        </td>
      )}

      {/* ===== PRIORITÄT (klickbar) ===== */}
      <td className="w-[48px] py-1.5 px-2 text-center relative">
        <div
          onClick={(e) => {
            e.stopPropagation()
            closeAll()
            setPrioOpen(true)
          }}
          className="flex items-center justify-center cursor-pointer hover:bg-gray-100 rounded p-0.5 transition-colors"
        >
          <Flag
            size={14}
            style={{ color: priorityColor }}
            fill={task.priority === 'urgent' || task.priority === 'high' ? priorityColor : 'none'}
            strokeWidth={task.priority === 'urgent' ? 0 : 2}
          />
        </div>

        <InlineDropdown isOpen={prioOpen} onClose={() => setPrioOpen(false)} align="right">
          <div className="px-2 py-1.5 text-[11px] font-medium text-asana-text-secondary uppercase tracking-wider">
            Priorität
          </div>
          {PRIORITY_OPTIONS.map(opt => {
            const flagColor = PRIORITY_FLAG_COLORS[opt.value] || '#6D6E6F'
            return (
              <button
                key={opt.value}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] text-left hover:bg-gray-50 transition-colors"
                onClick={(e) => { e.stopPropagation(); updateTask({ priority: opt.value }); setPrioOpen(false) }}
              >
                <Flag
                  size={13}
                  style={{ color: flagColor }}
                  fill={opt.value === 'urgent' || opt.value === 'high' ? flagColor : 'none'}
                  strokeWidth={opt.value === 'urgent' ? 0 : 2}
                />
                <span>{opt.label}</span>
                {task.priority === opt.value && <Check size={14} className="ml-auto text-asana-link" />}
              </button>
            )
          })}
        </InlineDropdown>
      </td>
    </tr>
  )
}
