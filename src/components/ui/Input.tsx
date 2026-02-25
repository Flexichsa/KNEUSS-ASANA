'use client'

import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-asana-text-primary mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full h-9 px-3 text-sm text-asana-text-primary bg-white border rounded-md',
            'placeholder:text-asana-text-secondary',
            'transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-asana-link focus:border-asana-link',
            error
              ? 'border-asana-danger focus:ring-asana-danger focus:border-asana-danger'
              : 'border-asana-border hover:border-gray-400',
            props.disabled && 'bg-gray-50 text-asana-text-secondary cursor-not-allowed',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs text-asana-danger">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
