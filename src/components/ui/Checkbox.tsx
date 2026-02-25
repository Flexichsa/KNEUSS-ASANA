'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

type CheckboxSize = 'sm' | 'md'

interface CheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  size?: CheckboxSize
  className?: string
  disabled?: boolean
}

const sizeStyles: Record<CheckboxSize, { container: string; icon: number }> = {
  sm: { container: 'w-4 h-4', icon: 10 },
  md: { container: 'w-5 h-5', icon: 12 },
}

export default function Checkbox({
  checked,
  onChange,
  size = 'md',
  className,
  disabled = false,
}: CheckboxProps) {
  const { container, icon } = sizeStyles[size]

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation()
        if (!disabled) onChange(!checked)
      }}
      className={cn(
        'rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 focus:outline-none',
        container,
        checked
          ? 'bg-asana-success border-asana-success'
          : 'border-gray-300 hover:border-asana-success',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {checked && <Check size={icon} className="text-white" strokeWidth={3} />}
    </button>
  )
}
