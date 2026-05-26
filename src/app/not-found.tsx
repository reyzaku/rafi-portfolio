'use client'

import { useEffect, useRef } from 'react'
import Nav from '@/components/layout/Nav'
import Link from 'next/link'

const IDLE_LABELS   = ['Rafi · chilling...', 'Rafi · hmm...', 'Rafi · vibing', 'Rafi · ...']
const WANDER_LABELS = ['Rafi · exploring...', 'Rafi · where am i', 'Rafi · just wandering']

function pick(arr: string[]) { return arr[Math.floor(Math.random() * arr.length)] }

export default function NotFound() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const labelRef  = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cur = cursorRef.current!
    const lbl = labelRef.current!

    const PAD = 120

    // Higher stiffness + lower damping = reaches target before accumulating too much velocity → minimal bounce
    const K = 0.005
    const D = 0.75

    let posX = window.innerWidth  / 2
    let posY = window.innerHeight / 2
    let velX = 0, velY = 0
    let targetX = posX, targetY = posY
    let state: 'wander' | 'idle' = 'wander'
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

    cur.style.opacity = '1'
    startWander()

    function loop() {
      velX = (velX + (targetX - posX) * K) * D
      velY = (velY + (targetY - posY) * K) * D
      posX += velX
      posY += velY

      const b = bounds()
      posX = clamp(posX, b.minX, b.maxX)
      posY = clamp(posY, b.minY, b.maxY)

      cur.style.left = posX + 'px'
      cur.style.top  = posY + 'px'

      if (state === 'wander' && Math.abs(velX) < 0.25 && Math.abs(velY) < 0.25
          && Math.abs(targetX - posX) < 5 && Math.abs(targetY - posY) < 5) {
        startIdle()
      }

      rafId = requestAnimationFrame(loop)
    }
    rafId = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(rafId)
      clearTimeout(idleTimer)
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
