import Nav from '@/components/layout/Nav'
import Hero from '@/components/hero/Hero'

export default function Home() {
  return (
    <main className="relative w-full h-full overflow-hidden">
      {/* Background — pure CSS, zero bytes */}
      <div className="absolute inset-0 z-0" style={{
        background: `
          radial-gradient(ellipse 900px 750px at 38% 0%,   rgba(42,115,60,0.72) 0%, transparent 65%),
          radial-gradient(ellipse 1400px 900px at 72% 88%, rgba(18,72,36,0.48)  0%, transparent 65%),
          #011910
        `,
      }} />

      {/* Noise overlay */}
      <div className="absolute inset-0 z-[1] pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='256' height='256' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '256px 256px',
        opacity: 0.055,
        mixBlendMode: 'overlay',
      }} />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Nav */}
      <Nav />

      {/* Hero */}
      <Hero />
    </main>
  )
}
