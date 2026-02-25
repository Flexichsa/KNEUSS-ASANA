'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Search, Plus, HelpCircle } from 'lucide-react'
import UserMenu from './UserMenu'

function getPageTitle(pathname: string): string {
  if (pathname === '/home') return 'Home'
  if (pathname === '/my-tasks') return 'My Tasks'
  if (pathname === '/inbox') return 'Inbox'
  if (pathname === '/reporting') return 'Reporting'
  if (pathname === '/goals') return 'Goals'
  if (pathname.startsWith('/projects/')) return 'Project'
  return 'Kneuss Asana'
}

export default function TopBar() {
  const pathname = usePathname()
  const [searchFocused, setSearchFocused] = useState(false)
  const pageTitle = getPageTitle(pathname)

  return (
    <header className="h-12 bg-white border-b border-asana-border flex items-center justify-between px-4 sticky top-0 z-30 flex-shrink-0">
      {/* Left: Page title / breadcrumb */}
      <div className="flex items-center min-w-0">
        <h1 className="text-sm font-medium text-asana-text-primary truncate">
          {pageTitle}
        </h1>
      </div>

      {/* Center: Search */}
      <div className="flex-1 max-w-md mx-4">
        <div
          className={`
            flex items-center gap-2 h-8 px-3 rounded-md border transition-colors duration-150
            ${
              searchFocused
                ? 'border-asana-link bg-white shadow-sm'
                : 'border-transparent bg-asana-bg-secondary hover:bg-gray-200'
            }
          `}
        >
          <Search className="w-4 h-4 text-asana-text-secondary flex-shrink-0" />
          <input
            type="text"
            placeholder="Search"
            className="bg-transparent text-sm text-asana-text-primary placeholder:text-asana-text-secondary outline-none w-full"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>
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
  )
}
