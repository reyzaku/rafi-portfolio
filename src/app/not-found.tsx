'use client'

import { useEffect, useRef } from 'react'
import Nav from '@/components/layout/Nav'
import Link from 'next/link'

const FLEE_LABELS   = ['Rafi · nope!', 'Rafi · bye!', 'Rafi · not today', 'Rafi · leave me alone']
const IDLE_LABELS   = ['Rafi · chilling...', 'Rafi · hmm...', 'Rafi · vibing', 'Rafi · ...']
const WANDER_LABELS = ['Rafi · exploring...', 'Rafi · where am i', 'Rafi · just wandering']

function pick(arr: string[]) { return arr[Math.floor(Math.random() * arr.length)] }

export default function NotFound() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const labelRef  = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cur = cursorRef.current!
    const lbl = labelRef.current!

    const PAD       = 100
    const FLEE_DIST = 180

    // Spring constants — (stiffness, damping)
    const WANDER_K = 0.003,  WANDER_D = 0.95
    const FLEE_K   = 0.032,  FLEE_D   = 0.78

    let posX = window.innerWidth  / 2
    let posY = window.innerHeight / 2
    let velX = 0, velY = 0
    let targetX = posX, targetY = posY
    let mouseX = -999, mouseY = -999
    let state: 'wander' | 'idle' | 'flee' = 'wander'
    let idleTimer = 0
    let rafId = 0

    function bounds() {
      return {
        minX: PAD, maxX: window.innerWidth  - PAD,
        minY: PAD, maxY: window.innerHeight - PAD,
      }
    }

    function clamp(v: number, min: number, max: number) { return Math.max(min, Math.min(max, v)) }

    function randomTarget() {
      const b = bounds()
      return {
        x: b.minX + Math.random() * (b.maxX - b.minX),
        y: b.minY + Math.random() * (b.maxY - b.minY),
      }
    }

    function startWander() {
      state = 'wander'
      const t = randomTarget()
      targetX = t.x; targetY = t.y
      lbl.textContent = pick(WANDER_LABELS)
    }

    function startIdle() {
      state = 'idle'
      lbl.textContent = pick(IDLE_LABELS)
      idleTimer = window.setTimeout(startWander, 800 + Math.random() * 2200)
    }

    function startFlee(mx: number, my: number) {
      if (idleTimer) { clearTimeout(idleTimer); idleTimer = 0 }
      state = 'flee'
      lbl.textContent = pick(FLEE_LABELS)
      // Set flee target far away from mouse
      const dx  = posX - mx
      const dy  = posY - my
      const len = Math.sqrt(dx * dx + dy * dy) || 1
      const b   = bounds()
      targetX = clamp(posX + (dx / len) * 350, b.minX, b.maxX)
      targetY = clamp(posY + (dy / len) * 350, b.minY, b.maxY)
    }

    cur.style.opacity = '1'
    startWander()

    function loop() {
      const dx   = mouseX - posX
      const dy   = mouseY - posY
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < FLEE_DIST && mouseX > -900) {
        if (state !== 'flee') startFlee(mouseX, mouseY)
        // Keep updating flee target while mouse is close
        const b   = bounds()
        const len = Math.sqrt(dx * dx + dy * dy) || 1
        targetX = clamp(posX + (-dx / len) * 300, b.minX, b.maxX)
        targetY = clamp(posY + (-dy / len) * 300, b.minY, b.maxY)
      } else if (state === 'flee') {
        startWander()
      }

      const k = state === 'flee' ? FLEE_K : WANDER_K
      const d = state === 'flee' ? FLEE_D : WANDER_D
      velX = (velX + (targetX - posX) * k) * d
      velY = (velY + (targetY - posY) * k) * d
      posX += velX
      posY += velY

      cur.style.left = posX + 'px'
      cur.style.top  = posY + 'px'

      // Arrived at wander target → idle (check both position and velocity settled)
      if (state === 'wander' && Math.abs(velX) < 0.15 && Math.abs(velY) < 0.15
          && Math.abs(targetX - posX) < 10 && Math.abs(targetY - posY) < 10) {
        startIdle()
      }

      rafId = requestAnimationFrame(loop)
    }
    rafId = requestAnimationFrame(loop)

    const onMove = (e: MouseEvent) => { mouseX = e.clientX; mouseY = e.clientY }
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
