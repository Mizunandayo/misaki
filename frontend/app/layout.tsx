import type { Metadata, Viewport } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
  preload: true,
})

export const metadata: Metadata = {
  title: 'Misaki — Seeing the regulation before it becomes law',
  description:
    'AI-powered legislative intelligence platform monitoring every legislature in the US, EU, and UK Parliament — powered by Bright Data MCP and Gemini.',
  metadataBase: new URL('https://misaki.vercel.app'),
  openGraph: {
    title: 'Misaki — Legislative Intelligence',
    description: 'The compliance threat feed that watches for you, and acts before you ask.',
    type: 'website',
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: '#0a0e1a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={poppins.variable}>
      <body>{children}</body>
    </html>
  )
}
