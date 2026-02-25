'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'

interface DatePickerProps {
  value: Date | null
  onChange: (date: Date | null) => void
  placeholder?: string
  className?: string
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
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

export default function DatePicker({
  value,
  onChange,
  placeholder = 'Select date...',
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
  const firstDayOfWeek = new Date(year, month, 1).getDay()

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

  const formatDisplayDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
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
      </button>

      {/* Calendar popup */}
      {isOpen && (
        <div className="absolute z-50 mt-1 left-0 w-[280px] p-3 bg-white border border-asana-border rounded-lg shadow-lg">
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
            {/* Empty cells for days before month starts */}
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

          {/* Today button */}
          <div className="mt-2 pt-2 border-t border-asana-border">
            <button
              type="button"
              onClick={() => handleSelectDate(new Date())}
              className="w-full text-xs text-asana-link hover:text-blue-700 py-1 transition-colors"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
