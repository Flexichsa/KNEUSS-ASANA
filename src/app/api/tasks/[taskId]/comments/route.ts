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

  const comments = await prisma.comment.findMany({
    where: { taskId: params.taskId },
    include: { user: true },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(comments)
}

export async function POST(
  request: Request,
  { params }: { params: { taskId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { content } = body

  if (!content) {
    return NextResponse.json({ error: 'Content is required' }, { status: 400 })
  }

  const comment = await prisma.comment.create({
    data: {
      content,
      taskId: params.taskId,
      userId: session.user.id,
    },
    include: { user: true },
  })

  // Create notification for task assignee
  const task = await prisma.task.findUnique({
    where: { id: params.taskId },
    select: { assigneeId: true, title: true },
  })

  if (task?.assigneeId && task.assigneeId !== session.user.id) {
    await prisma.notification.create({
      data: {
        type: 'comment',
        message: `${session.user.name} commented on "${task.title}"`,
        userId: task.assigneeId,
        taskId: params.taskId,
      },
    })
  }

  return NextResponse.json(comment, { status: 201 })
}
