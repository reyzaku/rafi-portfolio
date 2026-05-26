'use client'

import { useEffect, useRef } from 'react'
import Nav from '@/components/layout/Nav'
import Link from 'next/link'

const FLEE_LABELS     = [
  'Rafi · nope!', 'Rafi · bye!', 'Rafi · not today', 'Rafi · leave me alone',
  'Rafi · NOPE NOPE NOPE', 'Rafi · i dont know you', 'Rafi · stranger danger',
  'Rafi · im busy rn', 'Rafi · please no', 'Rafi · ✌️ peace out',
  'Rafi · i have a meeting', 'Rafi · aaaaaa', 'Rafi · why are you like this',
]
const IDLE_LABELS     = [
  'Rafi · chilling...', 'Rafi · hmm...', 'Rafi · vibing', 'Rafi · ...',
  'Rafi · la la la', 'Rafi · thinking...', 'Rafi · zoning out',
  'Rafi · just existing', 'Rafi · bored ngl', 'Rafi · *stares into void*',
  'Rafi · waiting for wifi', 'Rafi · do i know you?', 'Rafi · 🫠',
]
const RECOVERY_LABELS = [
  'Rafi · phew...', 'Rafi · that was close', 'Rafi · ok ok...', 'Rafi · 😮‍💨',
  'Rafi · my heart...', 'Rafi · i need a moment', 'Rafi · never again',
  'Rafi · ok im fine', 'Rafi · that person is crazy', 'Rafi · note to self: run faster',
  'Rafi · *deep breath*', 'Rafi · where did they go', 'Rafi · still shaking ngl',
]
const WANDER_LABELS   = [
  'Rafi · exploring...', 'Rafi · where am i', 'Rafi · just wandering',
  'Rafi · taking a walk', 'Rafi · no destination', 'Rafi · aimless as always',
  'Rafi · looking for something', 'Rafi · this way maybe?', 'Rafi · hm this looks nice',
  'Rafi · i live here now', 'Rafi · not all who wander are lost', 'Rafi · ok maybe i am lost',
]

function pick(arr: string[]) { return arr[Math.floor(Math.random() * arr.length)] }

export default function NotFound() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const labelRef  = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cur = cursorRef.current!
    const lbl = labelRef.current!

    const PAD       = 120
    const FLEE_DIST = 160
    const FLEE_SAFE = 260  // flee target must be at least this far from mouse

    // Wander spring
    const WK = 0.005, WD = 0.75
    // Flee spring — faster than wander but not instant
    const FK = 0.014, FD = 0.78

    let posX = window.innerWidth  / 2
    let posY = window.innerHeight / 2
    let velX = 0, velY = 0
    let targetX = posX, targetY = posY
    let mouseX = -999, mouseY = -999
    let state: 'wander' | 'idle' | 'flee' = 'wander'
    let canDetect = true
    let idleTimer = 0
    let rafId = 0

    function bounds() {
      return {
        minX: PAD, maxX: window.innerWidth  - PAD,
        minY: PAD, maxY: window.innerHeight - PAD,
      }
    }

    function clamp(v: number, min: number, max: number) {
      return Math.max(min, Math.min(max, v))
    }

    function randomTarget() {
      const b = bounds()
      return {
        x: b.minX + Math.random() * (b.maxX - b.minX),
        y: b.minY + Math.random() * (b.maxY - b.minY),
      }
    }

    function safeFlee() {
      // Pick a random target that's far enough from the mouse
      for (let i = 0; i < 20; i++) {
        const t = randomTarget()
        const dx = t.x - mouseX
        const dy = t.y - mouseY
        if (Math.sqrt(dx * dx + dy * dy) >= FLEE_SAFE) return t
      }
      // Fallback: just use randomTarget if no safe spot found in 20 tries
      return randomTarget()
    }

    function startWander() {
      state = 'wander'
      const t = randomTarget()
      targetX = t.x
      targetY = t.y
      lbl.textContent = pick(WANDER_LABELS)
    }

    function startIdle() {
      state = 'idle'
      lbl.textContent = pick(IDLE_LABELS)
      idleTimer = window.setTimeout(startWander, 1000 + Math.random() * 2500)
    }

    function startRecovery() {
      state = 'idle'
      lbl.textContent = pick(RECOVERY_LABELS)
      window.dispatchEvent(new CustomEvent('rafi-recover'))
      idleTimer = window.setTimeout(startWander, 1500 + Math.random() * 1500)
    }

    function startFlee() {
      if (idleTimer) { clearTimeout(idleTimer); idleTimer = 0 }
      state = 'flee'
      canDetect = false
      lbl.textContent = pick(FLEE_LABELS)
      window.dispatchEvent(new CustomEvent('rafi-flee'))
      const t = safeFlee()
      targetX = t.x
      targetY = t.y
    }

    cur.style.opacity = '1'
    startWander()

    function loop() {
      // Detection — one-shot, only when canDetect is true
      if (canDetect && mouseX > -900) {
        const dx   = mouseX - posX
        const dy   = mouseY - posY
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < FLEE_DIST) startFlee()
      }

      const k = state === 'flee' ? FK : WK
      const d = state === 'flee' ? FD : WD
      velX = (velX + (targetX - posX) * k) * d
      velY = (velY + (targetY - posY) * k) * d
      posX += velX
      posY += velY

      const b = bounds()
      posX = clamp(posX, b.minX, b.maxX)
      posY = clamp(posY, b.minY, b.maxY)

      cur.style.left = posX + 'px'
      cur.style.top  = posY + 'px'

      // Wander arrived → idle
      if (state === 'wander'
          && Math.abs(velX) < 0.25 && Math.abs(velY) < 0.25
          && Math.abs(targetX - posX) < 5 && Math.abs(targetY - posY) < 5) {
        startIdle()
      }

      // Flee settled → catch breath, then re-arm detection
      if (state === 'flee'
          && Math.abs(velX) < 0.25 && Math.abs(velY) < 0.25
          && Math.abs(targetX - posX) < 5 && Math.abs(targetY - posY) < 5) {
        canDetect = true
        startRecovery()
      }

      rafId = requestAnimationFrame(loop)
    }
    rafId = requestAnimationFrame(loop)

    const onMove  = (e: MouseEvent) => { mouseX = e.clientX; mouseY = e.clientY }
    const onLeave = () => { mouseX = -999; mouseY = -999 }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseleave', onLeave)

    return () => {
      cancelAnimationFrame(rafId)
      clearTimeout(idleTimer)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseleave', onLeave)
    }
  }, [])

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

      {/* Rafi wandering cursor */}
      <div
        ref={cursorRef}
        style={{
          position: 'fixed', pointerEvents: 'none', opacity: 0,
          display: 'flex', alignItems: 'flex-start', gap: 5,
          zIndex: 9999,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/cursor-rafi.png" alt="" width={22} height={22} draggable={false} />
        <div ref={labelRef} style={{
          marginTop: 18, background: '#5CFF85', color: '#000',
          fontFamily: 'inherit', fontSize: 11, fontWeight: 600,
          padding: '5px 10px', borderRadius: 3,
          whiteSpace: 'nowrap', letterSpacing: '0.01em',
          boxShadow: '0 4px 12px rgba(0,0,0,0.35)',
        }}>Rafi · exploring...</div>
      </div>
    </main>
  )
}
