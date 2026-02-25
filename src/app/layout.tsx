import type { Metadata } from 'next'
import './globals.css'
import SessionProvider from '@/components/providers/SessionProvider'

export const metadata: Metadata = {
  title: 'Asana - Manage your team\'s work, projects, & tasks online',
  description: 'Work management platform to organize work, from daily tasks to strategic initiatives.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
