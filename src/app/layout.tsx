import type { Metadata } from 'next'
import { Bricolage_Grotesque } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import CustomCursor from '@/components/ui/CustomCursor'
import IdleRafi from '@/components/ui/IdleRafi'
import PageTransition from '@/components/ui/PageTransition'
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
        <PageTransition />
        {/* Desktop-only Figma-style tools */}
        <div className="hidden md:block">
          <Ruler />
          <SelectionOverlay />
          <CustomCursor />
          <IdleRafi />
          <SelectionBox />
        </div>
        <Analytics />
      </body>
    </html>
  )
}
