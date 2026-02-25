'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { formatDueDate, isDueDateOverdue, PRIORITY_OPTIONS } from '@/lib/utils'
import type { TaskType } from '@/types'
import Checkbox from '@/components/ui/Checkbox'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'

interface TaskRowProps {
  task: TaskType
  onSelect: (taskId: string) => void
  isSelected: boolean
  onRefresh: () => void
}

export default function TaskRow({ task, onSelect, isSelected, onRefresh }: TaskRowProps) {
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
  const priorityOption = PRIORITY_OPTIONS.find((p) => p.value === task.priority)

  return (
    <tr
      onClick={() => onSelect(task.id)}
      className={cn(
        'group cursor-pointer border-b border-asana-border transition-colors',
        isSelected
          ? 'bg-blue-50'
          : 'hover:bg-asana-bg-secondary',
        task.completed && 'opacity-60'
      )}
    >
      {/* Checkbox */}
      <td className="w-10 py-2 pl-4 pr-1">
        <Checkbox
          checked={task.completed}
          onChange={handleComplete}
          size="sm"
        />
      </td>

      {/* Task Name */}
      <td className="py-2 px-3">
        <span
          className={cn(
            'text-sm text-asana-text-primary',
            task.completed && 'line-through text-asana-text-secondary'
          )}
        >
          {task.title}
        </span>
      </td>

      {/* Assignee */}
      <td className="w-[140px] py-2 px-3">
        {task.assignee ? (
          <div className="flex items-center gap-2">
            <Avatar
              src={task.assignee.avatar}
              name={task.assignee.name}
              size="xs"
            />
            <span className="text-xs text-asana-text-secondary truncate">
              {task.assignee.name}
            </span>
          </div>
        ) : (
          <span className="text-xs text-asana-text-secondary opacity-0 group-hover:opacity-100 transition-opacity">
            Assign
          </span>
        )}
      </td>

      {/* Due Date */}
      <td className="w-[120px] py-2 px-3">
        {task.dueDate ? (
          <span
            className={cn(
              'text-xs',
              overdue && !task.completed
                ? 'text-asana-danger font-medium'
                : 'text-asana-text-secondary'
            )}
          >
            {formatDueDate(task.dueDate)}
          </span>
        ) : (
          <span className="text-xs text-asana-text-secondary opacity-0 group-hover:opacity-100 transition-opacity">
            Set date
          </span>
        )}
      </td>

      {/* Priority */}
      <td className="w-[100px] py-2 px-3">
        {priorityOption && (
          <Badge variant="priority" color={priorityOption.color}>
            {priorityOption.label}
          </Badge>
        )}
      </td>
    </tr>
  )
}
