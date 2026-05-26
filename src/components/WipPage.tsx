import Nav from '@/components/layout/Nav'

export default function WipPage({ title }: { title: string }) {
  return (
    <main className="relative w-full h-screen overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0 bg-cover bg-top" style={{ backgroundImage: "url('/bg.webp')" }} />

      {/* Grid overlay */}
      <div className="absolute inset-0 z-[1] pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.008) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.008) 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
      }} />

      <Nav />

      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 select-none">
        <p style={{
          fontSize: 'clamp(10px, 2vw, 13px)', fontWeight: 700,
          letterSpacing: 'clamp(4px, 2vw, 9px)', color: 'rgba(255,255,255,0.4)',
          textTransform: 'uppercase',
        }}>{title}</p>
        <h1 style={{
          fontSize: 'clamp(32px, 8vw, 96px)', fontWeight: 700,
          letterSpacing: '-0.04em', color: '#ffffff', lineHeight: 1,
          textAlign: 'center',
        }}>Work in Progress</h1>
        <p style={{
          fontSize: 'clamp(13px, 1.5vw, 16px)', fontWeight: 400,
          color: 'rgba(255,255,255,0.4)', letterSpacing: '-0.02em',
          marginTop: 8,
        }}>Something awesome is coming. Stay tuned.</p>
      </div>
    </main>
  )
}
