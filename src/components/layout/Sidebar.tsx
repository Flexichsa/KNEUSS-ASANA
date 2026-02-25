'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  CheckSquare,
  Bell,
  BarChart3,
  Briefcase,
  Target,
  Plus,
  PanelLeftClose,
  Menu,
} from 'lucide-react'
import SidebarProjectList from './SidebarProjectList'
import SidebarTeamList from './SidebarTeamList'

const SIDEBAR_COLLAPSED_KEY = 'asana-sidebar-collapsed'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  badge?: boolean
}

const navItems: NavItem[] = [
  { label: 'Startseite', href: '/home', icon: Home },
  { label: 'Meine Aufgaben', href: '/my-tasks', icon: CheckSquare },
  { label: 'Posteingang', href: '/inbox', icon: Bell, badge: true },
  { label: 'Berichte', href: '/reporting', icon: BarChart3 },
  { label: 'Portfolios', href: '/goals', icon: Briefcase },
  { label: 'Ziele', href: '/goals', icon: Target },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  // Load collapsed state from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY)
    if (stored === 'true') {
      setCollapsed(true)
    }
  }, [])

  function toggleCollapsed() {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next))
  }

  return (
    <>
      {/* Collapsed toggle button (visible when sidebar is collapsed) */}
      {collapsed && (
        <button
          onClick={toggleCollapsed}
          className="fixed top-3 left-3 z-40 flex items-center justify-center w-7 h-7 rounded-md text-asana-text-secondary hover:bg-gray-100 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-4 h-4" />
        </button>
      )}

      <aside
        className={`
          bg-asana-sidebar flex flex-col h-screen sticky top-0 transition-all duration-200 ease-in-out flex-shrink-0 overflow-hidden
          ${collapsed ? 'w-0' : 'w-[240px]'}
        `}
      >
        <div className="flex flex-col h-full min-w-[240px]">
          {/* Top section: Logo / Workspace name + collapse button */}
          <div className="flex items-center justify-between px-4 h-12 flex-shrink-0">
            <Link
              href="/home"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <img src="/kneuss-logo-white.svg" alt="Kneuss" className="h-6" />
            </Link>
            <button
              onClick={toggleCollapsed}
              className="flex items-center justify-center w-6 h-6 rounded text-asana-sidebar-text hover:text-asana-sidebar-active hover:bg-asana-sidebar-hover transition-colors"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation items */}
          <nav className="px-2 space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive =
                pathname === item.href ||
                (item.href !== '/home' && pathname.startsWith(item.href + '/'))

              return (
                <Link
                  key={item.href + item.label}
                  href={item.href}
                  className={`
                    asana-sidebar-item
                    ${isActive ? 'asana-sidebar-item-active' : ''}
                  `}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="w-2 h-2 rounded-full bg-asana-coral flex-shrink-0" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Divider */}
          <div className="mx-4 my-3 border-t border-asana-sidebar-hover" />

          {/* Projects section */}
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            <div className="flex items-center justify-between px-4 mb-1">
              <span className="text-xs font-medium text-asana-sidebar-text uppercase tracking-wider">
                Projekte
              </span>
              <button
                className="flex items-center justify-center w-5 h-5 rounded text-asana-sidebar-text hover:text-asana-sidebar-active hover:bg-asana-sidebar-hover transition-colors"
                aria-label="Add project"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <SidebarProjectList />

            {/* Divider */}
            <div className="mx-4 my-3 border-t border-asana-sidebar-hover" />

            {/* Teams section */}
            <div className="flex items-center justify-between px-4 mb-1">
              <span className="text-xs font-medium text-asana-sidebar-text uppercase tracking-wider">
                Teams
              </span>
            </div>
            <SidebarTeamList />
          </div>
        </div>
      </aside>
    </>
  )
}
