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

  const subtasks = await prisma.subtask.findMany({
    where: { taskId: params.taskId },
    orderBy: { position: 'asc' },
  })

  return NextResponse.json(subtasks)
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
  const { title } = body

  if (!title) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  }

  const lastSubtask = await prisma.subtask.findFirst({
    where: { taskId: params.taskId },
    orderBy: { position: 'desc' },
  })

  const subtask = await prisma.subtask.create({
    data: {
      title,
      taskId: params.taskId,
      position: (lastSubtask?.position ?? -1) + 1,
    },
  })

  return NextResponse.json(subtask, { status: 201 })
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
  const { id, title, completed } = body

  if (!id) {
    return NextResponse.json({ error: 'Subtask ID is required' }, { status: 400 })
  }

  const subtask = await prisma.subtask.update({
    where: { id },
    data: { title, completed },
  })

  return NextResponse.json(subtask)
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const subtaskId = searchParams.get('id')

  if (!subtaskId) {
    return NextResponse.json({ error: 'Subtask ID is required' }, { status: 400 })
  }

  await prisma.subtask.delete({ where: { id: subtaskId } })
  return NextResponse.json({ success: true })
}
