import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const teams = await prisma.team.findMany({
    where: {
      members: { some: { userId: session.user.id } },
    },
    include: {
      projects: {
        include: { _count: { select: { tasks: true } } },
      },
      members: { include: { user: true } },
    },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json(teams)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { name } = body
  let { workspaceId } = body

  if (!name) {
    return NextResponse.json({ error: 'Team name is required' }, { status: 400 })
  }

  // Auto-detect workspace if not provided
  if (!workspaceId) {
    let workspace = await prisma.workspace.findFirst({ orderBy: { createdAt: 'asc' } })
    if (!workspace) {
      workspace = await prisma.workspace.create({ data: { name: 'Kneuss' } })
    }
    workspaceId = workspace.id
  }

  const team = await prisma.team.create({
    data: {
      name,
      workspaceId,
      members: {
        create: { userId: session.user.id, role: 'admin' },
      },
    },
    include: {
      projects: true,
      members: { include: { user: true } },
    },
  })

  return NextResponse.json(team, { status: 201 })
}
