'use client'

import Nav from '@/components/layout/Nav'
import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="relative w-full h-screen overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0 bg-cover bg-top" style={{ backgroundImage: "url('/bg.webp')" }} />
      <div className="absolute inset-0 z-[1] pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.008) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.008) 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
      }} />

      <Nav />

      {/* Static 404 */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 pointer-events-none select-none">
        <h1 style={{
          fontSize: 'clamp(100px, 22vw, 280px)', fontWeight: 700,
          letterSpacing: '-0.06em', color: '#ffffff', lineHeight: 1,
          textShadow: '0 0 120px rgba(92,255,133,0.15)',
        }}>404</h1>
        <p style={{
          fontSize: 'clamp(13px, 1.5vw, 16px)', fontWeight: 400,
          color: 'rgba(255,255,255,0.45)', letterSpacing: '-0.02em',
        }}>Bro, how did you end up here?</p>
        <Link href="/" style={{ pointerEvents: 'auto' }}>
          <button style={{
            marginTop: 12,
            backgroundColor: '#5CFF85', color: '#000',
            fontSize: 'clamp(13px, 1.5vw, 16px)', fontWeight: 700,
            letterSpacing: '-0.04em', padding: '12px 36px',
            borderRadius: '37px', border: 'none',
            fontFamily: 'inherit', cursor: 'pointer',
          }}>
            Take me home
          </button>
        </Link>
      </div>
    </main>
  )
}
