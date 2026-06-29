import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, DM_Sans, Inter } from 'next/font/google'
import './globals.css'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-plus-jakarta-sans',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Compass — Registered Agent & Filing',
  description: 'Florida LLC formation and annual report filing.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Oooh+Baby&display=swap" rel="stylesheet" />
      </head>
      <body className={`${plusJakartaSans.variable} ${dmSans.variable} ${inter.variable} antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
