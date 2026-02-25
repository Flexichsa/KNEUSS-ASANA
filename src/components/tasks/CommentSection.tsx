'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils'
import type { CommentType } from '@/types'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import { Send } from 'lucide-react'

interface CommentSectionProps {
  taskId: string
  comments: CommentType[]
  onRefresh: () => void
}

export default function CommentSection({ taskId, comments, onRefresh }: CommentSectionProps) {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    const text = content.trim()
    if (!text || isSubmitting) return

    setIsSubmitting(true)
    try {
      await fetch(`/api/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text }),
      })
      setContent('')
      onRefresh()
    } catch (error) {
      console.error('Failed to post comment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div>
      <h4 className="text-sm font-medium text-asana-text-primary mb-3">Comments</h4>

      {/* Comment Input */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write a comment..."
            rows={2}
            className={cn(
              'w-full px-3 py-2 text-sm bg-white border border-asana-border rounded-lg resize-none',
              'placeholder:text-asana-text-secondary text-asana-text-primary',
              'focus:outline-none focus:ring-2 focus:ring-asana-link focus:border-asana-link',
              'hover:border-gray-400 transition-colors'
            )}
          />
          <div className="flex justify-end mt-1.5">
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!content.trim()}
              loading={isSubmitting}
            >
              <Send size={12} />
              Comment
            </Button>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <Avatar
              src={comment.user?.avatar}
              name={comment.user?.name || 'Unknown'}
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 mb-0.5">
                <span className="text-sm font-medium text-asana-text-primary">
                  {comment.user?.name || 'Unknown'}
                </span>
                <span className="text-xs text-asana-text-secondary">
                  {formatDate(comment.createdAt)}
                </span>
              </div>
              <p className="text-sm text-asana-text-primary whitespace-pre-wrap break-words">
                {comment.content}
              </p>
            </div>
          </div>
        ))}

        {comments.length === 0 && (
          <p className="text-sm text-asana-text-secondary text-center py-4">
            No comments yet. Be the first to comment.
          </p>
        )}
      </div>
    </div>
  )
}
