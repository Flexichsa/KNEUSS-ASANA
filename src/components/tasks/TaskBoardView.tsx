'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import type { SectionType, TaskType } from '@/types'
import TaskCard from '@/components/tasks/TaskCard'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { Plus } from 'lucide-react'

interface TaskBoardViewProps {
  sections: SectionType[]
  projectId: string
  onTaskSelect: (taskId: string) => void
  selectedTaskId: string | null
  onRefresh: () => void
}

function BoardColumn({
  section,
  projectId,
  onTaskSelect,
  selectedTaskId,
  onRefresh,
}: {
  section: SectionType
  projectId: string
  onTaskSelect: (taskId: string) => void
  selectedTaskId: string | null
  onRefresh: () => void
}) {
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const { setNodeRef } = useDroppable({
    id: `section-${section.id}`,
    data: {
      type: 'section',
      section,
    },
  })

  const tasks = section.tasks || []
  const taskIds = tasks.map((t) => t.id)

  const handleAddTask = async () => {
    const title = newTaskTitle.trim()
    if (!title) return

    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          projectId,
          sectionId: section.id,
        }),
      })
      setNewTaskTitle('')
      setIsAdding(false)
      onRefresh()
    } catch (error) {
      console.error('Failed to add task:', error)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddTask()
    } else if (e.key === 'Escape') {
      setNewTaskTitle('')
      setIsAdding(false)
    }
  }

  return (
    <div className="flex flex-col w-[300px] flex-shrink-0">
      {/* Column Header */}
      <div className="flex items-center justify-between px-2 py-2 mb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-asana-text-primary">
            {section.name}
          </h3>
          <span className="text-xs text-asana-text-secondary bg-asana-bg-secondary px-1.5 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Droppable Column */}
      <div
        ref={setNodeRef}
        className="flex-1 space-y-2 min-h-[200px] p-1 rounded-lg"
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onSelect={onTaskSelect}
              isSelected={selectedTaskId === task.id}
            />
          ))}
        </SortableContext>

        {/* Add Task */}
        {isAdding ? (
          <div className="bg-white border border-asana-border rounded-lg p-3">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => {
                if (!newTaskTitle.trim()) setIsAdding(false)
              }}
              placeholder="Aufgabenname eingeben..."
              className="w-full text-sm bg-transparent outline-none placeholder:text-asana-text-secondary text-asana-text-primary"
              autoFocus
            />
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 w-full py-2 px-2 text-sm text-asana-text-secondary hover:text-asana-text-primary hover:bg-asana-bg-secondary rounded-lg transition-colors"
          >
            <Plus size={14} />
            <span>Aufgabe hinzufügen</span>
          </button>
        )}
      </div>
    </div>
  )
}

export default function TaskBoardView({
  sections,
  projectId,
  onTaskSelect,
  selectedTaskId,
  onRefresh,
}: TaskBoardViewProps) {
  const [activeTask, setActiveTask] = useState<TaskType | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor)
  )

  const findTaskById = (taskId: string): TaskType | null => {
    for (const section of sections) {
      const task = section.tasks?.find((t) => t.id === taskId)
      if (task) return task
    }
    return null
  }

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const task = findTaskById(active.id as string)
    setActiveTask(task)
  }

  const handleDragOver = (_event: DragOverEvent) => {
    // Visual feedback is handled by dnd-kit
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Determine the target section
    let targetSectionId: string | null = null

    if (overId.startsWith('section-')) {
      targetSectionId = overId.replace('section-', '')
    } else {
      // Dropped over another task - find that task's section
      const overTask = findTaskById(overId)
      if (overTask) {
        targetSectionId = overTask.sectionId
      }
    }

    if (!targetSectionId) return

    const activeTask = findTaskById(activeId)
    if (!activeTask) return

    // Only update if section changed
    if (activeTask.sectionId !== targetSectionId) {
      try {
        await fetch(`/api/tasks/${activeId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sectionId: targetSectionId }),
        })
        onRefresh()
      } catch (error) {
        console.error('Failed to move task:', error)
      }
    }
  }

  return (
    <div className="flex-1 overflow-x-auto">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 p-6 min-h-full">
          {sections.map((section) => (
            <BoardColumn
              key={section.id}
              section={section}
              projectId={projectId}
              onTaskSelect={onTaskSelect}
              selectedTaskId={selectedTaskId}
              onRefresh={onRefresh}
            />
          ))}

          {sections.length === 0 && (
            <div className="flex items-center justify-center w-full py-20 text-asana-text-secondary">
              <p className="text-sm">Noch keine Abschnitte. Erstellen Sie einen Abschnitt, um loszulegen.</p>
            </div>
          )}
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeTask ? (
            <div className="bg-white border border-asana-border rounded-lg p-3 shadow-xl rotate-3 w-[280px]">
              <p className="text-sm text-asana-text-primary">{activeTask.title}</p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
