import type { Metadata } from 'next'
import { Bricolage_Grotesque } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import CustomCursor from '@/components/ui/CustomCursor'
import SelectionBox from '@/components/ui/SelectionBox'
import Ruler from '@/components/ui/Ruler'
import SelectionOverlay from '@/components/ui/SelectionOverlay'
import './globals.css'

const bricolage = Bricolage_Grotesque({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-bricolage',
})

export const metadata: Metadata = {
  title: 'Rafi — Graphic & Motion Designer',
  description: 'Portfolio of Rafi, Graphic & Motion Designer based in Jakarta, Indonesia.',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${bricolage.variable} h-full`}>
      <body className="h-full overflow-hidden antialiased font-sans">
        {children}
        <Ruler />
        <SelectionOverlay />
        <CustomCursor />
        <SelectionBox />
        <Analytics />
      </body>
    </html>
  )
}
