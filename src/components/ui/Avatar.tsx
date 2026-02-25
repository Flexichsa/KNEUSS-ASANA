'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { getInitials } from '@/lib/utils'

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface AvatarProps {
  src?: string | null
  name: string
  size?: AvatarSize
  className?: string
}

const sizeMap: Record<AvatarSize, { container: string; text: string }> = {
  xs: { container: 'w-6 h-6', text: 'text-[10px]' },
  sm: { container: 'w-7 h-7', text: 'text-xs' },
  md: { container: 'w-8 h-8', text: 'text-xs' },
  lg: { container: 'w-10 h-10', text: 'text-sm' },
  xl: { container: 'w-16 h-16', text: 'text-xl' },
}

const avatarColors = [
  '#E8384F',
  '#FD9A00',
  '#EEC300',
  '#4ECBC4',
  '#4573D2',
  '#AA62E3',
  '#F06A6A',
  '#36B37E',
  '#7A6FF0',
  '#E362E3',
]

function getColorFromName(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return avatarColors[Math.abs(hash) % avatarColors.length]
}

export default function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const initials = getInitials(name)
  const bgColor = getColorFromName(name)
  const { container, text } = sizeMap[size]

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        title={name}
        className={cn(
          'rounded-full object-cover flex-shrink-0',
          container,
          className
        )}
      />
    )
  }

  return (
    <div
      title={name}
      className={cn(
        'rounded-full flex items-center justify-center flex-shrink-0 text-white font-medium select-none',
        container,
        text,
        className
      )}
      style={{ backgroundColor: bgColor }}
    >
      {initials}
    </div>
  )
}
