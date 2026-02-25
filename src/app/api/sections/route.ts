import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { name, projectId } = body

  if (!name || !projectId) {
    return NextResponse.json({ error: 'Name and projectId are required' }, { status: 400 })
  }

  const lastSection = await prisma.section.findFirst({
    where: { projectId },
    orderBy: { position: 'desc' },
  })

  const section = await prisma.section.create({
    data: {
      name,
      projectId,
      position: (lastSection?.position ?? -1) + 1,
    },
    include: { tasks: true },
  })

  return NextResponse.json(section, { status: 201 })
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { id, name, position } = body

  if (!id) {
    return NextResponse.json({ error: 'Section ID is required' }, { status: 400 })
  }

  const updateData: Record<string, unknown> = {}
  if (name !== undefined) updateData.name = name
  if (position !== undefined) updateData.position = position

  const section = await prisma.section.update({
    where: { id },
    data: updateData,
  })

  return NextResponse.json(section)
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const sectionId = searchParams.get('id')

  if (!sectionId) {
    return NextResponse.json({ error: 'Section ID is required' }, { status: 400 })
  }

  await prisma.section.delete({ where: { id: sectionId } })
  return NextResponse.json({ success: true })
}
