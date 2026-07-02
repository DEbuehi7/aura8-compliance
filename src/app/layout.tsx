import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Aura8 Compliance',
  description: 'CCBill Compliance Review Dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
