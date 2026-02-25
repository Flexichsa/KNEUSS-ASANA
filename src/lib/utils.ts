import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`

  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })
}

export function formatDueDate(date: Date | string | null): string {
  if (!date) return ''
  const d = new Date(date)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const target = new Date(d)
  target.setHours(0, 0, 0, 0)
  const diff = Math.floor((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (diff < 0) return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function isDueDateOverdue(date: Date | string | null): boolean {
  if (!date) return false
  const d = new Date(date)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return d < now
}

export const PROJECT_COLORS = [
  { name: 'Red', value: '#E8384F' },
  { name: 'Orange', value: '#FD9A00' },
  { name: 'Yellow', value: '#EEC300' },
  { name: 'Green', value: '#4ECBC4' },
  { name: 'Blue', value: '#4573D2' },
  { name: 'Purple', value: '#AA62E3' },
  { name: 'Pink', value: '#F06A6A' },
]

export const PRIORITY_OPTIONS = [
  { label: 'Low', value: 'low', color: '#6D6E6F' },
  { label: 'Medium', value: 'medium', color: '#4573D2' },
  { label: 'High', value: 'high', color: '#FD9A00' },
  { label: 'Urgent', value: 'urgent', color: '#E8384F' },
]

export const STATUS_OPTIONS = [
  { label: 'To Do', value: 'todo' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Review', value: 'review' },
  { label: 'Done', value: 'done' },
]
