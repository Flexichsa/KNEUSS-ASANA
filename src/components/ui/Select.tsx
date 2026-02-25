'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown, Search, Check } from 'lucide-react'

interface SelectOption {
  label: string
  value: string
  icon?: React.ReactNode
}

interface SelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  label?: string
  className?: string
  searchable?: boolean
}

export default function Select({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  label,
  className,
  searchable,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const selectedOption = options.find((o) => o.value === value)

  // Auto-enable search for long lists
  const showSearch = searchable !== undefined ? searchable : options.length > 7

  const filteredOptions = showSearch
    ? options.filter((o) =>
        o.label.toLowerCase().includes(search.toLowerCase())
      )
    : options

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (
      containerRef.current &&
      !containerRef.current.contains(e.target as Node)
    ) {
      setIsOpen(false)
      setSearch('')
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      if (showSearch) {
        setTimeout(() => searchInputRef.current?.focus(), 0)
      }
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, handleClickOutside, showSearch])

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-asana-text-primary mb-1.5">
          {label}
        </label>
      )}

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full h-9 px-3 flex items-center justify-between gap-2 text-sm bg-white border rounded-md transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-asana-link focus:border-asana-link',
          isOpen ? 'border-asana-link ring-2 ring-asana-link' : 'border-asana-border hover:border-gray-400'
        )}
      >
        <span
          className={cn(
            'flex items-center gap-2 truncate',
            selectedOption ? 'text-asana-text-primary' : 'text-asana-text-secondary'
          )}
        >
          {selectedOption?.icon}
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown
          size={16}
          className={cn(
            'flex-shrink-0 text-asana-text-secondary transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Options dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-asana-border rounded-lg shadow-lg overflow-hidden">
          {showSearch && (
            <div className="p-2 border-b border-asana-border">
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-asana-text-secondary"
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-full h-8 pl-8 pr-3 text-sm bg-gray-50 border border-asana-border rounded focus:outline-none focus:border-asana-link"
                />
              </div>
            </div>
          )}

          <div className="max-h-60 overflow-y-auto py-1">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-asana-text-secondary">
                No options found
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value)
                    setIsOpen(false)
                    setSearch('')
                  }}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors',
                    option.value === value
                      ? 'bg-blue-50 text-asana-link'
                      : 'text-asana-text-primary hover:bg-gray-50'
                  )}
                >
                  {option.icon && (
                    <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
                      {option.icon}
                    </span>
                  )}
                  <span className="flex-1 truncate">{option.label}</span>
                  {option.value === value && (
                    <Check size={14} className="flex-shrink-0 text-asana-link" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
