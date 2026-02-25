'use client'

import { useEffect, useState, useCallback } from 'react'
import { NotificationType } from '@/types'
import { formatDate } from '@/lib/utils'
import Avatar from '@/components/ui/Avatar'
import { Bell, CheckCheck, MessageSquare, UserPlus, Clock, Archive } from 'lucide-react'
import Link from 'next/link'

const notificationIcons: Record<string, typeof Bell> = {
  task_assigned: UserPlus,
  comment: MessageSquare,
  due_date: Clock,
  default: Bell,
}

export default function InboxPage() {
  const [notifications, setNotifications] = useState<NotificationType[]>([])
  const [loading, setLoading] = useState(true)

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications')
      const data = await res.json()
      setNotifications(Array.isArray(data) ? data : [])
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchNotifications() }, [fetchNotifications])

  const markAsRead = async (id: string) => {
    await fetch('/api/notifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, read: true }),
    })
    fetchNotifications()
  }

  const markAllRead = async () => {
    await fetch('/api/notifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAllRead: true }),
    })
    fetchNotifications()
  }

  const unreadCount = notifications.filter(n => !n.read).length

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-24" />
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-16 bg-gray-100 rounded" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-medium text-asana-text-primary">Inbox</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-asana-text-secondary mt-0.5">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 text-sm text-asana-link hover:text-asana-coral-hover"
          >
            <CheckCheck size={14} />
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-asana-bg-secondary flex items-center justify-center mx-auto mb-4">
            <Archive size={28} className="text-asana-text-secondary" />
          </div>
          <p className="text-asana-text-secondary font-medium">You&apos;re all caught up!</p>
          <p className="text-sm text-asana-text-secondary mt-1">
            Notifications about your tasks will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {notifications.map(notification => {
            const Icon = notificationIcons[notification.type] || notificationIcons.default
            return (
              <div
                key={notification.id}
                onClick={() => !notification.read && markAsRead(notification.id)}
                className={`flex items-start gap-3 py-3 px-3 rounded-lg cursor-pointer transition-colors ${
                  notification.read
                    ? 'hover:bg-asana-bg-secondary'
                    : 'bg-blue-50/50 hover:bg-blue-50'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    notification.read ? 'bg-gray-100' : 'bg-asana-link/10'
                  }`}
                >
                  <Icon
                    size={14}
                    className={notification.read ? 'text-asana-text-secondary' : 'text-asana-link'}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm ${
                      notification.read
                        ? 'text-asana-text-secondary'
                        : 'text-asana-text-primary font-medium'
                    }`}
                  >
                    {notification.message}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-asana-text-secondary">
                      {formatDate(notification.createdAt)}
                    </span>
                    {notification.task?.project && (
                      <Link
                        href={`/projects/${notification.task.project.id}/list`}
                        className="text-xs text-asana-link hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {notification.task.project.name}
                      </Link>
                    )}
                  </div>
                </div>
                {!notification.read && (
                  <div className="w-2 h-2 rounded-full bg-asana-link flex-shrink-0 mt-2" />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
