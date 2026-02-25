'use client'

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react'
import { cn } from '@/lib/utils'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  type: ToastType
  message: string
}

interface ToastContextValue {
  toast: (type: ToastType, message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const typeConfig: Record<
  ToastType,
  { icon: React.ElementType; bg: string; border: string; text: string }
> = {
  success: {
    icon: CheckCircle,
    bg: 'bg-white',
    border: 'border-l-4 border-l-asana-success',
    text: 'text-asana-success',
  },
  error: {
    icon: AlertCircle,
    bg: 'bg-white',
    border: 'border-l-4 border-l-asana-danger',
    text: 'text-asana-danger',
  },
  info: {
    icon: Info,
    bg: 'bg-white',
    border: 'border-l-4 border-l-asana-link',
    text: 'text-asana-link',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-white',
    border: 'border-l-4 border-l-yellow-500',
    text: 'text-yellow-600',
  },
}

function ToastItem({
  toast: t,
  onDismiss,
}: {
  toast: Toast
  onDismiss: (id: string) => void
}) {
  const [exiting, setExiting] = useState(false)
  const config = typeConfig[t.type]
  const Icon = config.icon

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true)
      setTimeout(() => onDismiss(t.id), 200)
    }, 3000)
    return () => clearTimeout(timer)
  }, [t.id, onDismiss])

  return (
    <div
      className={cn(
        'flex items-start gap-3 w-80 px-4 py-3 rounded-lg shadow-lg border border-asana-border',
        config.bg,
        config.border,
        exiting ? 'animate-[slideOut_200ms_ease-in_forwards]' : 'animate-[slideIn_200ms_ease-out]'
      )}
    >
      <Icon size={18} className={cn('flex-shrink-0 mt-0.5', config.text)} />
      <p className="flex-1 text-sm text-asana-text-primary">{t.message}</p>
      <button
        onClick={() => {
          setExiting(true)
          setTimeout(() => onDismiss(t.id), 200)
        }}
        className="flex-shrink-0 p-0.5 text-asana-text-secondary hover:text-asana-text-primary rounded transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  )
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    setToasts((prev) => [...prev, { id, type, message }])
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}

      {/* Toast container */}
      {toasts.length > 0 && (
        <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={dismissToast} />
          ))}
        </div>
      )}

      <style jsx global>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideOut {
          from { opacity: 1; transform: translateX(0); }
          to { opacity: 0; transform: translateX(100%); }
        }
      `}</style>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
