'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import type { SubtaskType } from '@/types'
import Checkbox from '@/components/ui/Checkbox'
import { Plus, X } from 'lucide-react'

interface SubtaskListProps {
  taskId: string
  subtasks: SubtaskType[]
  onRefresh: () => void
}

export default function SubtaskList({ taskId, subtasks, onRefresh }: SubtaskListProps) {
  const [newTitle, setNewTitle] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const handleToggle = async (subtask: SubtaskType) => {
    try {
      await fetch(`/api/tasks/${taskId}/subtasks`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: subtask.id,
          completed: !subtask.completed,
        }),
      })
      onRefresh()
    } catch (error) {
      console.error('Failed to toggle subtask:', error)
    }
  }

  const handleAdd = async () => {
    const title = newTitle.trim()
    if (!title) return

    try {
      await fetch(`/api/tasks/${taskId}/subtasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      })
      setNewTitle('')
      onRefresh()
    } catch (error) {
      console.error('Failed to add subtask:', error)
    }
  }

  const handleDelete = async (subtaskId: string) => {
    try {
      await fetch(`/api/tasks/${taskId}/subtasks?id=${subtaskId}`, {
        method: 'DELETE',
      })
      onRefresh()
    } catch (error) {
      console.error('Failed to delete subtask:', error)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAdd()
    } else if (e.key === 'Escape') {
      setNewTitle('')
      setIsAdding(false)
    }
  }

  const completedCount = subtasks.filter((s) => s.completed).length

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-asana-text-primary">Unteraufgaben</h4>
        {subtasks.length > 0 && (
          <span className="text-xs text-asana-text-secondary">
            {completedCount}/{subtasks.length}
          </span>
        )}
      </div>

      {/* Progress Bar */}
      {subtasks.length > 0 && (
        <div className="w-full h-1.5 bg-gray-100 rounded-full mb-3 overflow-hidden">
          <div
            className="h-full bg-asana-success rounded-full transition-all duration-300"
            style={{ width: `${(completedCount / subtasks.length) * 100}%` }}
          />
        </div>
      )}

      {/* Subtask List */}
      <div className="space-y-0.5">
        {subtasks.map((subtask) => (
          <div
            key={subtask.id}
            className="flex items-center gap-2 py-1.5 px-2 -mx-2 rounded group hover:bg-asana-bg-secondary transition-colors"
          >
            <Checkbox
              checked={subtask.completed}
              onChange={() => handleToggle(subtask)}
              size="sm"
            />
            <span
              className={cn(
                'flex-1 text-sm',
                subtask.completed
                  ? 'line-through text-asana-text-secondary'
                  : 'text-asana-text-primary'
              )}
            >
              {subtask.title}
            </span>
            <button
              onClick={() => handleDelete(subtask.id)}
              className="p-0.5 text-asana-text-secondary hover:text-asana-danger opacity-0 group-hover:opacity-100 transition-all rounded"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Add Subtask */}
      {isAdding ? (
        <div className="flex items-center gap-2 mt-1 py-1.5">
          <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0" />
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              if (!newTitle.trim()) {
                setIsAdding(false)
              }
            }}
            placeholder="Unteraufgabe hinzufügen..."
            className="flex-1 text-sm bg-transparent outline-none placeholder:text-asana-text-secondary text-asana-text-primary"
            autoFocus
          />
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1.5 mt-1 py-1.5 text-sm text-asana-text-secondary hover:text-asana-text-primary transition-colors"
        >
          <Plus size={14} />
          <span>Unteraufgabe hinzufügen</span>
        </button>
      )}
    </div>
  )
}
