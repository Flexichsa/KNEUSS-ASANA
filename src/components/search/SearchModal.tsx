'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, FileText, FolderOpen, User, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { TaskType, ProjectType, UserType } from '@/types'
import Avatar from '@/components/ui/Avatar'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<{
    tasks: TaskType[]
    projects: ProjectType[]
    users: UserType[]
  }>({ tasks: [], projects: [], users: [] })
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setResults({ tasks: [], projects: [], users: [] })
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (!isOpen) {
          // parent should handle opening
        } else {
          onClose()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults({ tasks: [], projects: [], users: [] })
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setResults(data)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300)
    return () => clearTimeout(timer)
  }, [query, search])

  const allItems = [
    ...results.tasks.map(t => ({ type: 'task' as const, data: t })),
    ...results.projects.map(p => ({ type: 'project' as const, data: p })),
    ...results.users.map(u => ({ type: 'user' as const, data: u })),
  ]

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(i => Math.min(i + 1, allItems.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && allItems[selectedIndex]) {
      const item = allItems[selectedIndex]
      if (item.type === 'task') {
        router.push(`/projects/${(item.data as TaskType).projectId}/list`)
      } else if (item.type === 'project') {
        router.push(`/projects/${(item.data as ProjectType).id}/list`)
      }
      onClose()
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl animate-fade-in overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-asana-border">
          <Search size={18} className="text-asana-text-secondary flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0) }}
            onKeyDown={handleKeyDown}
            placeholder="Aufgaben, Projekte und Personen suchen..."
            className="flex-1 text-sm outline-none bg-transparent placeholder:text-asana-text-secondary"
          />
          <kbd className="hidden sm:inline text-[10px] text-asana-text-secondary bg-asana-bg-secondary px-1.5 py-0.5 rounded border border-asana-border">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
          {loading && (
            <div className="p-4 text-center text-sm text-asana-text-secondary">Suche läuft...</div>
          )}

          {!loading && query.length >= 2 && allItems.length === 0 && (
            <div className="p-8 text-center text-sm text-asana-text-secondary">
              Keine Ergebnisse für &quot;{query}&quot;
            </div>
          )}

          {!loading && results.tasks.length > 0 && (
            <div className="p-2">
              <div className="px-3 py-1.5 text-xxs uppercase tracking-wider text-asana-text-secondary font-medium">
                Aufgaben
              </div>
              {results.tasks.map((task, i) => (
                <button
                  key={task.id}
                  onClick={() => {
                    router.push(`/projects/${task.projectId}/list`)
                    onClose()
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left ${
                    selectedIndex === i ? 'bg-asana-bg-secondary' : 'hover:bg-asana-bg-secondary'
                  }`}
                >
                  <FileText size={14} className="text-asana-text-secondary flex-shrink-0" />
                  <span className="text-sm text-asana-text-primary flex-1 truncate">{task.title}</span>
                  {task.project && (
                    <span className="text-xs text-asana-text-secondary">{task.project.name}</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {!loading && results.projects.length > 0 && (
            <div className="p-2">
              <div className="px-3 py-1.5 text-xxs uppercase tracking-wider text-asana-text-secondary font-medium">
                Projekte
              </div>
              {results.projects.map((project, i) => (
                <button
                  key={project.id}
                  onClick={() => {
                    router.push(`/projects/${project.id}/list`)
                    onClose()
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left ${
                    selectedIndex === results.tasks.length + i
                      ? 'bg-asana-bg-secondary'
                      : 'hover:bg-asana-bg-secondary'
                  }`}
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: project.color }}
                  />
                  <span className="text-sm text-asana-text-primary flex-1 truncate">{project.name}</span>
                </button>
              ))}
            </div>
          )}

          {!loading && results.users.length > 0 && (
            <div className="p-2">
              <div className="px-3 py-1.5 text-xxs uppercase tracking-wider text-asana-text-secondary font-medium">
                Personen
              </div>
              {results.users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-asana-bg-secondary"
                >
                  <Avatar name={user.name} size="xs" />
                  <span className="text-sm text-asana-text-primary">{user.name}</span>
                  <span className="text-xs text-asana-text-secondary">{user.email}</span>
                </div>
              ))}
            </div>
          )}

          {!loading && query.length < 2 && (
            <div className="p-6 text-center text-sm text-asana-text-secondary">
              Mindestens 2 Zeichen eingeben
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
