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

  const members = await prisma.projectMember.findMany({
    where: { projectId: params.projectId },
    include: { user: true },
  })

  return NextResponse.json(members)
}

export async function POST(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { userId, role } = body

  const member = await prisma.projectMember.create({
    data: {
      userId,
      projectId: params.projectId,
      role: role || 'member',
    },
    include: { user: true },
  })

  return NextResponse.json(member, { status: 201 })
}
