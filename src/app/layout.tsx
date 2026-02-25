import type { Metadata } from 'next'
import './globals.css'
import SessionProvider from '@/components/providers/SessionProvider'

export const metadata: Metadata = {
  title: 'Kneuss - Projektmanagement f\u00fcr Ihren Betrieb',
  description: 'Projektmanagement-Plattform f\u00fcr die Organisation von Aufgaben, Projekten und Teams.',
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
