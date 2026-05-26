import Nav from '@/components/layout/Nav'
import Hero from '@/components/hero/Hero'
import WelcomeScreen from '@/components/WelcomeScreen'

export default function Home() {
  return (
    <main className="relative w-full h-full overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-top"
        style={{ backgroundImage: "url('/bg.webp')" }}
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.008) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.008) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Welcome screen */}
      <WelcomeScreen />

      {/* Nav */}
      <Nav />

      {/* Hero */}
      <Hero />
    </main>
  )
}
