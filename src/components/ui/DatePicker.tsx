'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react'

interface DatePickerProps {
  value: Date | null
  onChange: (date: Date | null) => void
  placeholder?: string
  className?: string
}

// Monday-first German day abbreviations
const DAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
const MONTHS = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
]

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = []
  const date = new Date(year, month, 1)
  while (date.getMonth() === month) {
    days.push(new Date(date))
    date.setDate(date.getDate() + 1)
  }
  return days
}

/**
 * Returns the next Monday on or after the given date.
 */
function getNextMonday(from: Date): Date {
  const d = new Date(from)
  const day = d.getDay() // 0=Sun, 1=Mon, ...
  const daysUntilMonday = day === 0 ? 1 : (8 - day) % 7 || 7
  d.setDate(d.getDate() + daysUntilMonday)
  return d
}

export default function DatePicker({
  value,
  onChange,
  placeholder = 'Datum wählen...',
  className,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [viewDate, setViewDate] = useState(value || new Date())
  const containerRef = useRef<HTMLDivElement>(null)
  const today = new Date()

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
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, handleClickOutside])

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const daysInMonth = getDaysInMonth(year, month)

  // Compute empty cells for Monday-first grid.
  // JS getDay(): 0=Sunday, 1=Monday, ..., 6=Saturday
  // We want Monday=0, Tuesday=1, ..., Sunday=6
  const jsDay = new Date(year, month, 1).getDay()
  const firstDayOfWeek = (jsDay + 6) % 7

  const prevMonth = () => {
    setViewDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setViewDate(new Date(year, month + 1, 1))
  }

  const handleSelectDate = (date: Date) => {
    onChange(date)
    setIsOpen(false)
  }

  const handleClearDate = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(null)
  }

  const formatDisplayDate = (date: Date): string => {
    return date.toLocaleDateString('de-DE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  // Preset date helpers
  const presetToday = () => {
    handleSelectDate(new Date())
  }

  const presetTomorrow = () => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    handleSelectDate(d)
  }

  const presetNextWeek = () => {
    handleSelectDate(getNextMonday(new Date()))
  }

  const presetIn2Weeks = () => {
    const d = new Date()
    d.setDate(d.getDate() + 14)
    handleSelectDate(d)
  }

  return (
    <div ref={containerRef} className={cn('relative inline-block', className)}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen)
          if (!isOpen && value) setViewDate(value)
        }}
        className={cn(
          'h-9 px-3 flex items-center gap-2 text-sm bg-white border rounded-md transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-asana-link focus:border-asana-link',
          isOpen
            ? 'border-asana-link ring-2 ring-asana-link'
            : 'border-asana-border hover:border-gray-400',
          value ? 'text-asana-text-primary' : 'text-asana-text-secondary'
        )}
      >
        <Calendar size={14} className="flex-shrink-0 text-asana-text-secondary" />
        {value ? formatDisplayDate(value) : placeholder}
        {value && (
          <span
            role="button"
            tabIndex={0}
            onClick={handleClearDate}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleClearDate(e as unknown as React.MouseEvent)
              }
            }}
            className="ml-1 p-0.5 rounded-full hover:bg-gray-200 text-asana-text-secondary hover:text-asana-text-primary transition-colors"
          >
            <X size={12} />
          </span>
        )}
      </button>

      {/* Calendar popup */}
      {isOpen && (
        <div className="absolute z-50 mt-1 left-0 w-[280px] p-3 bg-white border border-asana-border rounded-lg shadow-lg">
          {/* Preset date buttons */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            <button
              type="button"
              onClick={presetToday}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-asana-text-primary rounded transition-colors"
            >
              Heute
            </button>
            <button
              type="button"
              onClick={presetTomorrow}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-asana-text-primary rounded transition-colors"
            >
              Morgen
            </button>
            <button
              type="button"
              onClick={presetNextWeek}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-asana-text-primary rounded transition-colors"
            >
              Nächste Woche
            </button>
            <button
              type="button"
              onClick={presetIn2Weeks}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-asana-text-primary rounded transition-colors"
            >
              In 2 Wochen
            </button>
          </div>

          {/* Month/Year navigation */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1 hover:bg-gray-100 rounded transition-colors text-asana-text-secondary"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-medium text-asana-text-primary">
              {MONTHS[month]} {year}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1 hover:bg-gray-100 rounded transition-colors text-asana-text-secondary"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS.map((day) => (
              <div
                key={day}
                className="h-8 flex items-center justify-center text-xs font-medium text-asana-text-secondary"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7">
            {/* Empty cells for days before month starts (Monday-first) */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="h-8" />
            ))}

            {/* Days of the month */}
            {daysInMonth.map((date) => {
              const isToday = isSameDay(date, today)
              const isSelected = value ? isSameDay(date, value) : false

              return (
                <button
                  key={date.getDate()}
                  type="button"
                  onClick={() => handleSelectDate(date)}
                  className={cn(
                    'h-8 w-8 mx-auto flex items-center justify-center text-sm rounded-full transition-colors',
                    isSelected
                      ? 'bg-asana-coral text-white font-medium'
                      : isToday
                        ? 'bg-blue-50 text-asana-link font-medium hover:bg-blue-100'
                        : 'text-asana-text-primary hover:bg-gray-100'
                  )}
                >
                  {date.getDate()}
                </button>
              )
            })}
          </div>

          {/* Heute (Today) button */}
          <div className="mt-2 pt-2 border-t border-asana-border">
            <button
              type="button"
              onClick={() => handleSelectDate(new Date())}
              className="w-full text-xs text-asana-link hover:text-blue-700 py-1 transition-colors"
            >
              Heute
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
