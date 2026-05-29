import type { Metadata } from 'next'
import { Bricolage_Grotesque } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import CustomCursor from '@/components/ui/CustomCursor'
import HomeOnlyLayer from '@/components/ui/HomeOnlyLayer'
import IdleRafi from '@/components/ui/IdleRafi'
import PageTransition from '@/components/ui/PageTransition'
import Ruler from '@/components/ui/Ruler'
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
      <body className="min-h-full antialiased font-sans">
        {children}
        <PageTransition />
        {/* Always-on tools — desktop only */}
        <div className="hidden md:block">
          <Ruler />
          <CustomCursor />
          <IdleRafi />
        </div>
        {/* Figma editing tools — home page only, desktop only */}
        <div className="hidden md:block">
          <HomeOnlyLayer />
        </div>
        <Analytics />
      </body>
    </html>
  )
}
