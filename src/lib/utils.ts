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

  if (days === 0) return 'Heute'
  if (days === 1) return 'Gestern'
  if (days < 7) return `Vor ${days} Tagen`

  return d.toLocaleDateString('de-DE', {
    day: 'numeric',
    month: 'short',
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

  if (diff < 0) return d.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })
  if (diff === 0) return 'Heute'
  if (diff === 1) return 'Morgen'
  return d.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })
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
  { label: 'Niedrig', value: 'low', color: '#6D6E6F' },
  { label: 'Mittel', value: 'medium', color: '#4573D2' },
  { label: 'Hoch', value: 'high', color: '#FD9A00' },
  { label: 'Dringend', value: 'urgent', color: '#E8384F' },
]

export const STATUS_OPTIONS = [
  { label: 'Zu erledigen', value: 'todo' },
  { label: 'In Bearbeitung', value: 'in_progress' },
  { label: 'Überprüfung', value: 'review' },
  { label: 'Erledigt', value: 'done' },
]
