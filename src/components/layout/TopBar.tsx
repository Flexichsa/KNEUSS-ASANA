'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Search, Plus, HelpCircle } from 'lucide-react'
import UserMenu from './UserMenu'
import { SearchModal } from '@/components/search/SearchModal'

function getPageTitle(pathname: string): string {
  if (pathname === '/home') return 'Startseite'
  if (pathname === '/my-tasks') return 'Meine Aufgaben'
  if (pathname === '/inbox') return 'Posteingang'
  if (pathname === '/reporting') return 'Berichte'
  if (pathname === '/goals') return 'Ziele'
  if (pathname.startsWith('/projects') && !pathname.endsWith('/projects')) return ''
  if (pathname === '/projects') return 'Projekte'
  return 'Kneuss'
}

export default function TopBar() {
  const pathname = usePathname()
  const [searchOpen, setSearchOpen] = useState(false)
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
          <button
            className="flex items-center justify-center w-7 h-7 rounded-full bg-asana-coral text-white hover:bg-asana-coral-hover transition-colors focus:outline-none focus:ring-2 focus:ring-asana-link focus:ring-offset-1"
            aria-label="Quick add task"
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* Help */}
          <button
            className="flex items-center justify-center w-7 h-7 rounded-full text-asana-text-secondary hover:bg-gray-100 transition-colors focus:outline-none"
            aria-label="Help"
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
