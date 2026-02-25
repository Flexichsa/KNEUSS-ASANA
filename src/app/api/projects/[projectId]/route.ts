import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const project = await prisma.project.findUnique({
    where: { id: params.projectId },
    include: {
      team: true,
      sections: {
        orderBy: { position: 'asc' },
        include: {
          tasks: {
            orderBy: { position: 'asc' },
            include: {
              assignee: true,
              subtasks: { orderBy: { position: 'asc' } },
              _count: { select: { comments: true, subtasks: true } },
            },
          },
        },
      },
      members: { include: { user: true } },
      _count: { select: { tasks: true } },
    },
  })

  if (!project) {
    return NextResponse.json({ error: 'Projekt nicht gefunden' }, { status: 404 })
  }

  return NextResponse.json(project)
}

export async function PUT(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify project exists and user is a member
  const existing = await prisma.project.findUnique({
    where: { id: params.projectId },
    include: { members: true },
  })
  if (!existing) {
    return NextResponse.json({ error: 'Projekt nicht gefunden' }, { status: 404 })
  }
  if (!existing.members.some(m => m.userId === session.user.id)) {
    return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 })
  }

  const body = await request.json()
  const { name, description, color, privacy } = body

  const project = await prisma.project.update({
    where: { id: params.projectId },
    data: { name, description, color, privacy },
    include: {
      team: true,
      sections: { orderBy: { position: 'asc' } },
      members: { include: { user: true } },
    },
  })

  return NextResponse.json(project)
}

export async function DELETE(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify project exists and user is owner/admin
  const existing = await prisma.project.findUnique({
    where: { id: params.projectId },
    include: { members: true },
  })
  if (!existing) {
    return NextResponse.json({ error: 'Projekt nicht gefunden' }, { status: 404 })
  }
  const member = existing.members.find(m => m.userId === session.user.id)
  if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
    return NextResponse.json({ error: 'Nur Projektbesitzer können Projekte löschen' }, { status: 403 })
  }

  await prisma.project.delete({ where: { id: params.projectId } })
  return NextResponse.json({ success: true })
}
