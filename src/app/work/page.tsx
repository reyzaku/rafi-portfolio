'use client'

import Nav from '@/components/layout/Nav'
import WorkPlayer from '@/components/work/WorkPlayer'

export default function Work() {
  return (
    <main className="relative w-full min-h-screen">
      {/* Background — fixed so it stays full screen */}
      <div className="fixed inset-0 z-0 bg-cover bg-top" style={{ backgroundImage: "url('/bg.webp')" }} />
      {/* Grid overlay */}
      <div className="fixed inset-0 z-[1] pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.008) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.008) 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
      }} />

      <Nav />
      <WorkPlayer />
    </main>
  )
}
