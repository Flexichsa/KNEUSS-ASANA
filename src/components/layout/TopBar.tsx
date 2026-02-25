'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { Search, Plus, HelpCircle, Loader2 } from 'lucide-react'
import UserMenu from './UserMenu'
import { SearchModal } from '@/components/search/SearchModal'

function getPageTitle(pathname: string): string {
  if (pathname === '/home') return 'Startseite'
  if (pathname === '/my-tasks') return 'Meine Aufgaben'
  if (pathname === '/inbox') return 'Posteingang'
  if (pathname === '/reporting') return 'Berichte'
  if (pathname === '/goals') return 'Ziele'
  if (pathname === '/projects') return 'Projekte'
  if (pathname.startsWith('/projects/')) return ''
  return 'Kneuss'
}

export default function TopBar() {
  const pathname = usePathname()
  const [searchOpen, setSearchOpen] = useState(false)
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const [quickAddTitle, setQuickAddTitle] = useState('')
  const [quickAddSubmitting, setQuickAddSubmitting] = useState(false)
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([])
  const quickAddRef = useRef<HTMLDivElement>(null)
  const quickAddInputRef = useRef<HTMLInputElement>(null)
  const pageTitle = getPageTitle(pathname)

  // Global Cmd+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Fetch projects for quick-add when popover opens
  useEffect(() => {
    if (quickAddOpen) {
      fetch('/api/projects')
        .then(res => res.ok ? res.json() : [])
        .then(data => setProjects(data))
        .catch(() => setProjects([]))

      // Focus the input when opened
      setTimeout(() => quickAddInputRef.current?.focus(), 50)
    }
  }, [quickAddOpen])

  // Close quick-add on click outside
  useEffect(() => {
    if (!quickAddOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (quickAddRef.current && !quickAddRef.current.contains(e.target as Node)) {
        setQuickAddOpen(false)
        setQuickAddTitle('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [quickAddOpen])

  // Close quick-add on Escape
  useEffect(() => {
    if (!quickAddOpen) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setQuickAddOpen(false)
        setQuickAddTitle('')
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [quickAddOpen])

  async function handleQuickAddSubmit() {
    const trimmed = quickAddTitle.trim()
    if (!trimmed || quickAddSubmitting) return

    // Need at least one project to assign the task to
    if (projects.length === 0) {
      alert('Kein Projekt vorhanden. Bitte erstelle zuerst ein Projekt.')
      return
    }

    setQuickAddSubmitting(true)
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: trimmed,
          projectId: projects[0].id,
        }),
      })
      if (res.ok) {
        setQuickAddOpen(false)
        setQuickAddTitle('')
      } else {
        const data = await res.json().catch(() => ({}))
        alert(data.error || 'Fehler beim Erstellen der Aufgabe.')
      }
    } catch {
      alert('Netzwerkfehler. Bitte versuche es erneut.')
    } finally {
      setQuickAddSubmitting(false)
    }
  }

  return (
    <>
      <header className="h-12 bg-white border-b border-asana-border flex items-center justify-between px-4 sticky top-0 z-30 flex-shrink-0">
        {/* Left: Page title / breadcrumb */}
        <div className="flex items-center min-w-0">
          {pageTitle && (
            <h1 className="text-sm font-medium text-asana-text-primary truncate">
              {pageTitle}
            </h1>
          )}
        </div>

        {/* Center: Search */}
        <div className="flex-1 max-w-md mx-4">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 h-8 px-3 rounded-md border border-transparent bg-asana-bg-secondary hover:bg-gray-200 transition-colors w-full text-left"
          >
            <Search className="w-4 h-4 text-asana-text-secondary flex-shrink-0" />
            <span className="text-sm text-asana-text-secondary flex-1">Suchen</span>
            <kbd className="hidden sm:inline text-[10px] text-asana-text-secondary bg-white px-1.5 py-0.5 rounded border border-asana-border">
              {typeof navigator !== 'undefined' && /Mac/.test(navigator.userAgent) ? '\u2318' : 'Ctrl'}+K
            </kbd>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Quick Add button */}
          <div className="relative" ref={quickAddRef}>
            <button
              onClick={() => setQuickAddOpen(prev => !prev)}
              className="flex items-center justify-center w-7 h-7 rounded-full bg-asana-coral text-white hover:bg-asana-coral-hover transition-colors focus:outline-none focus:ring-2 focus:ring-asana-link focus:ring-offset-1"
              aria-label="Aufgabe schnell erstellen"
            >
              <Plus className="w-4 h-4" />
            </button>

            {/* Quick-Add Popover */}
            {quickAddOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-lg shadow-lg border border-asana-border p-3 z-50">
                <p className="text-xs font-medium text-asana-text-secondary mb-2">
                  Neue Aufgabe erstellen
                </p>
                <div className="flex items-center gap-2">
                  <input
                    ref={quickAddInputRef}
                    type="text"
                    value={quickAddTitle}
                    onChange={e => setQuickAddTitle(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleQuickAddSubmit()
                      }
                    }}
                    placeholder="Aufgabenname eingeben..."
                    className="flex-1 text-sm px-2 py-1.5 border border-asana-border rounded-md focus:outline-none focus:ring-2 focus:ring-asana-link focus:border-transparent"
                    disabled={quickAddSubmitting}
                  />
                  {quickAddSubmitting && (
                    <Loader2 className="w-4 h-4 text-asana-text-secondary animate-spin flex-shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-asana-text-secondary mt-1.5">
                  Enter zum Erstellen &middot; Esc zum Schliessen
                </p>
              </div>
            )}
          </div>

          {/* Help */}
          <button
            onClick={() => alert('Hilfe-Center kommt bald')}
            className="flex items-center justify-center w-7 h-7 rounded-full text-asana-text-secondary hover:bg-gray-100 transition-colors focus:outline-none"
            aria-label="Hilfe"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* User menu */}
          <UserMenu />
        </div>
      </header>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
