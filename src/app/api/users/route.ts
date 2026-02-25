import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password } = body

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, E-Mail und Passwort sind erforderlich' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Passwort muss mindestens 6 Zeichen lang sein' },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Ein Konto mit dieser E-Mail-Adresse existiert bereits' },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    // Find or create default workspace and team
    let workspace = await prisma.workspace.findFirst({ orderBy: { createdAt: 'asc' } })
    if (!workspace) {
      workspace = await prisma.workspace.create({
        data: { name: 'Kneuss' },
      })
    }

    let defaultTeam = await prisma.team.findFirst({
      where: { workspaceId: workspace.id },
      orderBy: { createdAt: 'asc' },
    })
    if (!defaultTeam) {
      defaultTeam = await prisma.team.create({
        data: { name: 'Allgemein', workspaceId: workspace.id },
      })
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        teamMembers: {
          create: { teamId: defaultTeam.id, role: 'member' },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        createdAt: true,
      },
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.' },
      { status: 500 }
    )
  }
}
