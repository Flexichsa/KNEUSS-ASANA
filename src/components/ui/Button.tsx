'use client'

import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  children: React.ReactNode
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-asana-coral text-white hover:bg-asana-coral-hover active:bg-[#D04A4A] shadow-sm',
  secondary:
    'bg-white text-asana-text-primary border border-asana-border hover:bg-gray-50 active:bg-gray-100',
  ghost:
    'bg-transparent text-asana-text-secondary hover:bg-gray-100 active:bg-gray-200',
  danger:
    'bg-asana-danger text-white hover:bg-red-600 active:bg-red-700 shadow-sm',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-7 px-3 text-xs rounded',
  md: 'h-9 px-4 text-sm rounded-md',
  lg: 'h-11 px-6 text-base rounded-md',
}

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn('animate-spin h-4 w-4', className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      children,
      className,
      type = 'button',
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-asana-link focus:ring-offset-1',
          variantStyles[variant],
          sizeStyles[size],
          (disabled || loading) && 'opacity-50 cursor-not-allowed pointer-events-none',
          className
        )}
        {...props}
      >
        {loading && <Spinner />}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
