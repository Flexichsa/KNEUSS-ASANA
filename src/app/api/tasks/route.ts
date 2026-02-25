import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId')
  const assigneeId = searchParams.get('assigneeId')
  const status = searchParams.get('status')

  const where: Record<string, unknown> = {}
  if (projectId) where.projectId = projectId
  if (assigneeId) where.assigneeId = assigneeId
  if (status) where.status = status

  const tasks = await prisma.task.findMany({
    where,
    include: {
      assignee: true,
      creator: true,
      project: true,
      section: true,
      subtasks: { orderBy: { position: 'asc' } },
      _count: { select: { comments: true, subtasks: true } },
    },
    orderBy: [{ section: { position: 'asc' } }, { position: 'asc' }],
  })

  return NextResponse.json(tasks)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { title, description, status, priority, dueDate, sectionId, projectId, assigneeId } = body

  if (!title || !projectId) {
    return NextResponse.json({ error: 'Titel und Projekt sind erforderlich' }, { status: 400 })
  }

  // Validate project exists
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { members: true },
  })
  if (!project) {
    return NextResponse.json({ error: 'Projekt nicht gefunden' }, { status: 404 })
  }

  // Auto-add creator as project member if not yet a member
  const isMember = project.members.some(m => m.userId === session.user.id)
  if (!isMember) {
    await prisma.projectMember.create({
      data: { userId: session.user.id, projectId, role: 'member' },
    })
  }

  // Get highest position in section
  const lastTask = await prisma.task.findFirst({
    where: { projectId, sectionId: sectionId || null },
    orderBy: { position: 'desc' },
  })

  const task = await prisma.task.create({
    data: {
      title,
      description,
      status: status || 'todo',
      priority: priority || 'medium',
      dueDate: dueDate ? new Date(dueDate) : null,
      position: (lastTask?.position ?? -1) + 1,
      sectionId,
      projectId,
      assigneeId,
      creatorId: session.user.id,
    },
    include: {
      assignee: true,
      creator: true,
      project: true,
      section: true,
      subtasks: true,
    },
  })

  // Auto-add assignee as project member
  if (assigneeId && assigneeId !== session.user.id) {
    const assigneeIsMember = project.members.some(m => m.userId === assigneeId)
    if (!assigneeIsMember) {
      await prisma.projectMember.create({
        data: { userId: assigneeId, projectId, role: 'member' },
      }).catch(() => { /* ignore if already exists */ })
    }

    // Create notification
    await prisma.notification.create({
      data: {
        type: 'task_assigned',
        message: `${session.user.name} hat Ihnen die Aufgabe "${title}" zugewiesen`,
        userId: assigneeId,
        taskId: task.id,
      },
    })
  }

  return NextResponse.json(task, { status: 201 })
}
