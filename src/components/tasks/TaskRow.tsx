'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { formatDueDate, isDueDateOverdue, STATUS_OPTIONS } from '@/lib/utils'
import type { TaskType } from '@/types'
import Checkbox from '@/components/ui/Checkbox'
import Avatar from '@/components/ui/Avatar'
import { Flag, MessageSquare, ListChecks, UserPlus, CalendarPlus } from 'lucide-react'

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

export default function TaskRow({ task, onSelect, isSelected, onRefresh, showProject = true }: TaskRowProps) {
  const handleComplete = async (completed: boolean) => {
    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed }),
      })
      onRefresh()
    } catch (error) {
      console.error('Failed to update task:', error)
    }
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
        isSelected
          ? 'bg-blue-50'
          : 'hover:bg-asana-bg-secondary',
        task.completed && 'opacity-60'
      )}
    >
      {/* Checkbox + Task Name */}
      <td className="py-1.5 pl-4 pr-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={task.completed}
              onChange={handleComplete}
              size="sm"
            />
          </div>
          <span
            className={cn(
              'text-[13px] text-asana-text-primary truncate',
              task.completed && 'line-through text-asana-text-secondary'
            )}
          >
            {task.title}
          </span>
          {/* Subtask / Comment indicators */}
          <div className="flex items-center gap-1.5 ml-1 flex-shrink-0">
            {subtaskCount > 0 && (
              <span className="flex items-center gap-0.5 text-[11px] text-asana-text-secondary" title={`${subtaskCount} Unteraufgaben`}>
                <ListChecks size={12} />
                {subtaskCount}
              </span>
            )}
            {commentCount > 0 && (
              <span className="flex items-center gap-0.5 text-[11px] text-asana-text-secondary" title={`${commentCount} Kommentare`}>
                <MessageSquare size={11} />
                {commentCount}
              </span>
            )}
          </div>
        </div>
      </td>

      {/* Zuständig / Assignee - just avatar */}
      <td className="w-[52px] py-1.5 px-1 text-center">
        {task.assignee ? (
          <div className="flex items-center justify-center">
            <Avatar
              src={task.assignee.avatar}
              name={task.assignee.name}
              size="xs"
            />
          </div>
        ) : (
          <div className="flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-6 h-6 rounded-full border border-dashed border-gray-300 flex items-center justify-center hover:border-asana-link cursor-pointer">
              <UserPlus size={11} className="text-gray-400" />
            </div>
          </div>
        )}
      </td>

      {/* Fälligkeitsdatum */}
      <td className="w-[110px] py-1.5 px-3">
        {task.dueDate ? (
          <span
            className={cn(
              'text-[12px]',
              overdue && !task.completed
                ? 'text-asana-danger font-medium'
                : 'text-asana-text-secondary'
            )}
          >
            {formatDueDate(task.dueDate)}
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[12px] text-asana-text-secondary opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:text-asana-link">
            <CalendarPlus size={12} />
          </span>
        )}
      </td>

      {/* Status */}
      <td className="w-[120px] py-1.5 px-2">
        <span className={cn(
          'inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium',
          statusColor.bg, statusColor.text
        )}>
          {statusOption?.label || task.status}
        </span>
      </td>

      {/* Projekt (Liegt bei) */}
      {showProject && (
        <td className="w-[140px] py-1.5 px-3">
          {task.project ? (
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className="w-2 h-2 rounded-sm flex-shrink-0"
                style={{ backgroundColor: task.project.color || '#4573D2' }}
              />
              <span className="text-[12px] text-asana-text-secondary truncate">
                {task.project.name}
              </span>
            </div>
          ) : null}
        </td>
      )}

      {/* Priorität - Flag icon */}
      <td className="w-[48px] py-1.5 px-2 text-center">
        <div className="flex items-center justify-center">
          <Flag
            size={14}
            style={{ color: priorityColor }}
            fill={task.priority === 'urgent' || task.priority === 'high' ? priorityColor : 'none'}
            strokeWidth={task.priority === 'urgent' ? 0 : 2}
          />
        </div>
      </td>
    </tr>
  )
}
