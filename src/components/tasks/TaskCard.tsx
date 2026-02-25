'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { formatDueDate, isDueDateOverdue, PRIORITY_OPTIONS } from '@/lib/utils'
import type { TaskType } from '@/types'
import Avatar from '@/components/ui/Avatar'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Calendar, GripVertical } from 'lucide-react'

interface TaskCardProps {
  task: TaskType
  onSelect: (taskId: string) => void
  isSelected: boolean
}

export default function TaskCard({ task, onSelect, isSelected }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      task,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const overdue = isDueDateOverdue(task.dueDate)
  const priorityOption = PRIORITY_OPTIONS.find((p) => p.value === task.priority)

  const priorityDotColors: Record<string, string> = {
    low: 'bg-gray-400',
    medium: 'bg-blue-500',
    high: 'bg-orange-500',
    urgent: 'bg-red-500',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onSelect(task.id)}
      className={cn(
        'group bg-white border border-asana-border rounded-lg p-3 cursor-pointer transition-all',
        'hover:border-gray-300 hover:shadow-sm',
        isSelected && 'border-asana-link ring-1 ring-asana-link',
        isDragging && 'opacity-50 shadow-lg rotate-2',
        task.completed && 'opacity-60'
      )}
    >
      <div className="flex items-start gap-2">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="p-0.5 mt-0.5 text-asana-text-secondary opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing transition-opacity flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={14} />
        </button>

        <div className="flex-1 min-w-0">
          {/* Title */}
          <p
            className={cn(
              'text-sm text-asana-text-primary mb-2',
              task.completed && 'line-through text-asana-text-secondary'
            )}
          >
            {task.title}
          </p>

          {/* Bottom row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Priority Dot */}
              {priorityOption && (
                <div
                  className={cn(
                    'w-2 h-2 rounded-full flex-shrink-0',
                    priorityDotColors[task.priority] || 'bg-gray-400'
                  )}
                  title={priorityOption.label}
                />
              )}

              {/* Due Date */}
              {task.dueDate && (
                <div
                  className={cn(
                    'flex items-center gap-1 text-xs',
                    overdue && !task.completed
                      ? 'text-asana-danger'
                      : 'text-asana-text-secondary'
                  )}
                >
                  <Calendar size={11} />
                  <span>{formatDueDate(task.dueDate)}</span>
                </div>
              )}
            </div>

            {/* Assignee */}
            {task.assignee && (
              <Avatar
                src={task.assignee.avatar}
                name={task.assignee.name}
                size="xs"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
