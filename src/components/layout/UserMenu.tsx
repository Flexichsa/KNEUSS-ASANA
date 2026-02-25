'use client'

import { useRef, useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { LogOut, Settings, CreditCard } from 'lucide-react'
import { getInitials } from '@/lib/utils'

export default function UserMenu() {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const userName = session?.user?.name || 'User'
  const userEmail = session?.user?.email || ''
  const userAvatar = session?.user?.image
  const initials = getInitials(userName)

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-center w-7 h-7 rounded-full bg-asana-coral text-white text-xs font-medium hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-asana-link focus:ring-offset-1 overflow-hidden"
        aria-label="User menu"
      >
        {userAvatar ? (
          <img
            src={userAvatar}
            alt={userName}
            className="w-full h-full object-cover"
          />
        ) : (
          initials
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-64 bg-white rounded-lg shadow-lg border border-asana-border py-1 z-50 animate-fade-in">
          {/* User info */}
          <div className="px-4 py-3 border-b border-asana-border">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-asana-coral text-white text-sm font-medium flex-shrink-0 overflow-hidden">
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt={userName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-asana-text-primary truncate">
                  {userName}
                </p>
                <p className="text-xs text-asana-text-secondary truncate">
                  {userEmail}
                </p>
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-asana-text-primary hover:bg-gray-50 transition-colors"
            >
              <Settings className="w-4 h-4 text-asana-text-secondary" />
              Einstellungen
            </Link>
            <Link
              href="/pricing"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-asana-text-primary hover:bg-gray-50 transition-colors"
            >
              <CreditCard className="w-4 h-4 text-asana-text-secondary" />
              Upgrade
            </Link>
          </div>

          <div className="border-t border-asana-border" />

          <div className="py-1">
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex items-center gap-3 px-4 py-2 text-sm text-asana-text-primary hover:bg-gray-50 transition-colors w-full text-left"
            >
              <LogOut className="w-4 h-4 text-asana-text-secondary" />
              Abmelden
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
