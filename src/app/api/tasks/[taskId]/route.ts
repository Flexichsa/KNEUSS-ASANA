import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { taskId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const task = await prisma.task.findUnique({
    where: { id: params.taskId },
    include: {
      assignee: true,
      creator: true,
      project: true,
      section: true,
      subtasks: { orderBy: { position: 'asc' } },
      comments: {
        include: { user: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  }

  return NextResponse.json(task)
}

export async function PUT(
  request: Request,
  { params }: { params: { taskId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { title, description, status, priority, dueDate, sectionId, assigneeId, completed, position } = body

  const updateData: Record<string, unknown> = {}
  if (title !== undefined) updateData.title = title
  if (description !== undefined) updateData.description = description
  if (status !== undefined) updateData.status = status
  if (priority !== undefined) updateData.priority = priority
  if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null
  if (sectionId !== undefined) updateData.sectionId = sectionId
  if (assigneeId !== undefined) updateData.assigneeId = assigneeId
  if (position !== undefined) updateData.position = position
  if (completed !== undefined) {
    updateData.completed = completed
    updateData.completedAt = completed ? new Date() : null
    if (completed) updateData.status = 'done'
  }

  const task = await prisma.task.update({
    where: { id: params.taskId },
    data: updateData,
    include: {
      assignee: true,
      creator: true,
      project: true,
      section: true,
      subtasks: { orderBy: { position: 'asc' } },
      comments: {
        include: { user: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  return NextResponse.json(task)
}

export async function DELETE(
  request: Request,
  { params }: { params: { taskId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await prisma.task.delete({ where: { id: params.taskId } })
  return NextResponse.json({ success: true })
}
