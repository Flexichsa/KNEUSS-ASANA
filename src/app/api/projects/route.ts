import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const projects = await prisma.project.findMany({
    where: {
      members: { some: { userId: session.user.id } },
    },
    include: {
      team: true,
      sections: { orderBy: { position: 'asc' } },
      members: { include: { user: true } },
      _count: { select: { tasks: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(projects)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { name, description, color, privacy, teamId } = body

  if (!name || !teamId) {
    return NextResponse.json({ error: 'Name and team are required' }, { status: 400 })
  }

  const project = await prisma.project.create({
    data: {
      name,
      description,
      color: color || '#4573D2',
      privacy: privacy || 'public',
      teamId,
      sections: {
        create: [
          { name: 'To Do', position: 0 },
          { name: 'In Progress', position: 1 },
          { name: 'Done', position: 2 },
        ],
      },
      members: {
        create: { userId: session.user.id, role: 'owner' },
      },
    },
    include: {
      team: true,
      sections: { orderBy: { position: 'asc' } },
      members: { include: { user: true } },
    },
  })

  return NextResponse.json(project, { status: 201 })
}
