'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface DropdownItem {
  label: string
  onClick: () => void
  icon?: React.ReactNode
  separator?: boolean
  destructive?: boolean
}

interface DropdownProps {
  trigger: React.ReactNode
  items: DropdownItem[]
  align?: 'left' | 'right'
  className?: string
}

export default function Dropdown({
  trigger,
  items,
  align = 'left',
  className,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState<'below' | 'above'>('below')
  const containerRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (
      containerRef.current &&
      !containerRef.current.contains(e.target as Node)
    ) {
      setIsOpen(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)

      // Determine if menu should appear above or below
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const spaceBelow = window.innerHeight - rect.bottom
        const menuHeight = 250 // Approximate max menu height
        setPosition(spaceBelow < menuHeight ? 'above' : 'below')
      }
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, handleClickOutside])

  return (
    <div ref={containerRef} className={cn('relative inline-block', className)}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          ref={menuRef}
          className={cn(
            'absolute z-50 min-w-[180px] py-1 bg-white border border-asana-border rounded-lg shadow-lg',
            'animate-[fadeIn_100ms_ease-out]',
            align === 'right' ? 'right-0' : 'left-0',
            position === 'above' ? 'bottom-full mb-1' : 'top-full mt-1'
          )}
        >
          {items.map((item, index) => (
            <React.Fragment key={index}>
              {item.separator && index > 0 && (
                <div className="my-1 border-t border-asana-border" />
              )}
              <button
                onClick={() => {
                  item.onClick()
                  setIsOpen(false)
                }}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors',
                  item.destructive
                    ? 'text-asana-danger hover:bg-red-50'
                    : 'text-asana-text-primary hover:bg-gray-50'
                )}
              >
                {item.icon && (
                  <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center text-asana-text-secondary">
                    {item.icon}
                  </span>
                )}
                {item.label}
              </button>
            </React.Fragment>
          ))}
        </div>
      )}

      {isOpen && (
        <style jsx global>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-4px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      )}
    </div>
  )
}
