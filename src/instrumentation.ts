export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { PrismaClient } = await import('@prisma/client')
    const bcrypt = await import('bcryptjs')

    const prisma = new PrismaClient()

    try {
      const existing = await prisma.user.findUnique({
        where: { email: 'f.biernath@kneuss.com' },
      })

      if (!existing) {
        const hashedPassword = await bcrypt.hash('Kneuss@2026', 12)
        await prisma.user.create({
          data: {
            name: 'F. Biernath',
            email: 'f.biernath@kneuss.com',
            password: hashedPassword,
            role: 'member',
            plan: 'personal',
          },
        })
        console.log('Benutzer f.biernath@kneuss.com erfolgreich angelegt.')
      }
    } catch (err) {
      console.error('Fehler beim Anlegen des Benutzers:', err)
    } finally {
      await prisma.$disconnect()
    }
  }
}
