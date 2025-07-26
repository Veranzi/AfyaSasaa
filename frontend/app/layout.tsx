import { ThemeProvider } from '@/components/theme-provider'
import { UserProvider } from '@/context/UserContext'
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AfyaSasa',
  description: 'Healthcare Management System',
  generator: 'Next.js',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <UserProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
          >
            {children}
          </ThemeProvider>
        </UserProvider>
      </body>
    </html>
  )
}
