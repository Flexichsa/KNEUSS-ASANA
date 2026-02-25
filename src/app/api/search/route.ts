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
  const query = searchParams.get('q')

  if (!query || query.length < 2) {
    return NextResponse.json({ tasks: [], projects: [], users: [] })
  }

  const [tasks, projects, users] = await Promise.all([
    prisma.task.findMany({
      where: {
        title: { contains: query },
        project: {
          members: { some: { userId: session.user.id } },
        },
      },
      include: { project: true, assignee: true },
      take: 10,
    }),
    prisma.project.findMany({
      where: {
        name: { contains: query },
        members: { some: { userId: session.user.id } },
      },
      take: 5,
    }),
    prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { email: { contains: query } },
        ],
      },
      select: { id: true, name: true, email: true, avatar: true },
      take: 5,
    }),
  ])

  return NextResponse.json({ tasks, projects, users })
}
