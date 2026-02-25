'use client'

import React from 'react'
import { cn } from '@/lib/utils'

type BadgeVariant = 'default' | 'priority' | 'status'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
  color?: string
}

const priorityColors: Record<string, { bg: string; text: string }> = {
  low: { bg: 'bg-gray-100', text: 'text-gray-600' },
  medium: { bg: 'bg-blue-50', text: 'text-blue-700' },
  high: { bg: 'bg-orange-50', text: 'text-orange-700' },
  urgent: { bg: 'bg-red-50', text: 'text-red-700' },
}

export default function Badge({
  variant = 'default',
  children,
  className,
  color,
}: BadgeProps) {
  const childText = typeof children === 'string' ? children.toLowerCase() : ''

  const getVariantClasses = () => {
    if (variant === 'priority' && childText in priorityColors) {
      const { bg, text } = priorityColors[childText]
      return `${bg} ${text}`
    }

    if (variant === 'status') {
      return 'bg-asana-bg-secondary text-asana-text-secondary'
    }

    return 'bg-gray-100 text-asana-text-secondary'
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap',
        getVariantClasses(),
        className
      )}
      style={
        color
          ? { backgroundColor: `${color}18`, color }
          : undefined
      }
    >
      {children}
    </span>
  )
}
