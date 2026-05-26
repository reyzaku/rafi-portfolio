'use client'

import { useEffect, useRef } from 'react'
import Nav from '@/components/layout/Nav'
import Link from 'next/link'

const RAFI_LABELS = ['Rafi · found it!', 'Rafi · got you...', 'Rafi · almost...']

export default function NotFound() {
  const textRef   = useRef<HTMLDivElement>(null)
  const cursorRef = useRef<HTMLDivElement>(null)
  const labelRef  = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el  = textRef.current!
    const cur = cursorRef.current!
    const lbl = labelRef.current!
    if (!el || !cur || !lbl) return

    // 404 physics
    let posX = window.innerWidth  / 2
    let posY = window.innerHeight / 2
    let velX = 0, velY = 0
    let mouseX = -999, mouseY = -999
    let rafiX  = -999, rafiY  = -999
    let rafId  = 0

    const REPEL_R  = 220
    const REPEL_F  = 18
    const DAMPING  = 0.88
    const RESTORE  = 0.0015

    function clamp(v: number, min: number, max: number) { return Math.max(min, Math.min(max, v)) }

    function applyRepel(cx: number, cy: number, force: number) {
      const dx   = posX - cx
      const dy   = posY - cy
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < REPEL_R && dist > 0) {
        const f = ((REPEL_R - dist) / REPEL_R) * force
        velX += (dx / dist) * f
        velY += (dy / dist) * f
      }
    }

    function loop() {
      // Drift back to center
      velX += (window.innerWidth  / 2 - posX) * RESTORE
      velY += (window.innerHeight / 2 - posY) * RESTORE

      applyRepel(mouseX, mouseY, REPEL_F)
      applyRepel(rafiX,  rafiY,  REPEL_F * 1.4)

      velX *= DAMPING
      velY *= DAMPING
      posX  = clamp(posX + velX, 160, window.innerWidth  - 160)
      posY  = clamp(posY + velY, 120, window.innerHeight - 120)

      el.style.left = posX + 'px'
      el.style.top  = posY + 'px'

      rafId = requestAnimationFrame(loop)
    }
    rafId = requestAnimationFrame(loop)

    const onMove = (e: MouseEvent) => { mouseX = e.clientX; mouseY = e.clientY }
    window.addEventListener('mousemove', onMove)

    // Rafi cursor chase sequence
    let rafiTimer: ReturnType<typeof setTimeout>

    function runRafiChase() {
      const label = RAFI_LABELS[Math.floor(Math.random() * RAFI_LABELS.length)]
      lbl.textContent = label

      // Spawn from a random edge
      const edge = Math.floor(Math.random() * 4)
      let sx = 0, sy = 0
      if (edge === 0) { sx = Math.random() * window.innerWidth; sy = -40 }
      if (edge === 1) { sx = window.innerWidth + 40; sy = Math.random() * window.innerHeight }
      if (edge === 2) { sx = Math.random() * window.innerWidth; sy = window.innerHeight + 40 }
      if (edge === 3) { sx = -40; sy = Math.random() * window.innerHeight }

      cur.style.left    = sx + 'px'
      cur.style.top     = sy + 'px'
      cur.style.opacity = '1'
      rafiX = sx; rafiY = sy

      let cx = sx, cy = sy
      let gave_up = false

      function chaseLoop() {
        if (gave_up) return

        const tx = posX - 11
        const ty = posY - 10
        const dx = tx - cx
        const dy = ty - cy
        const dist = Math.sqrt(dx * dx + dy * dy)

        // Spring toward 404
        cx += dx * 0.045
        cy += dy * 0.045
        rafiX = cx; rafiY = cy

        cur.style.left = cx + 'px'
        cur.style.top  = cy + 'px'

        if (dist < 60) {
          // Almost got it — 404 dodges hard, Rafi gives up
          velX += (Math.random() - 0.5) * 40
          velY += (Math.random() - 0.5) * 40
          gave_up = true
          lbl.textContent = 'Rafi · bro...'
          rafiX = -999; rafiY = -999

          // Rafi slinks off screen
          setTimeout(() => {
            const exitX = cx < window.innerWidth / 2 ? -80 : window.innerWidth + 80
            const exitY = cy

            let ex = cx, ey = cy
            function exit() {
              ex += (exitX - ex) * 0.06
              ey += (exitY - ey) * 0.06
              cur.style.left = ex + 'px'
              cur.style.top  = ey + 'px'
              if (Math.abs(exitX - ex) > 2) requestAnimationFrame(exit)
              else { cur.style.opacity = '0'; scheduleNextChase() }
            }
            requestAnimationFrame(exit)
          }, 300)
          return
        }

        requestAnimationFrame(chaseLoop)
      }
      requestAnimationFrame(chaseLoop)
    }

    function scheduleNextChase() {
      rafiTimer = setTimeout(runRafiChase, 5000 + Math.random() * 3000)
    }

    // First chase after 3s
    rafiTimer = setTimeout(runRafiChase, 3000)

    return () => {
      cancelAnimationFrame(rafId)
      clearTimeout(rafiTimer)
      window.removeEventListener('mousemove', onMove)
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

      {/* 404 text — floats and runs away */}
      <div
        ref={textRef}
        style={{
          position: 'absolute', transform: 'translate(-50%, -50%)',
          zIndex: 10, pointerEvents: 'none', userSelect: 'none',
          textAlign: 'center',
        }}
      >
        <h1 style={{
          fontSize: 'clamp(100px, 20vw, 260px)', fontWeight: 700,
          letterSpacing: '-0.06em', color: '#ffffff', lineHeight: 1,
          textShadow: '0 0 80px rgba(92,255,133,0.2)',
        }}>404</h1>
      </div>

      {/* Static text + button — bottom center */}
      <div className="absolute bottom-[12%] left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-5 select-none">
        <p style={{
          fontSize: 'clamp(13px, 1.5vw, 16px)', fontWeight: 400,
          color: 'rgba(255,255,255,0.5)', letterSpacing: '-0.02em',
          textAlign: 'center', whiteSpace: 'nowrap',
        }}>Bro, how did you end up here?</p>
        <Link href="/">
          <button style={{
            backgroundColor: '#5CFF85', color: '#000',
            fontSize: 'clamp(13px, 1.5vw, 16px)', fontWeight: 700,
            letterSpacing: '-0.04em', padding: '12px 36px',
            borderRadius: '37px', border: 'none',
            fontFamily: 'inherit', cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}>
            Take me home
          </button>
        </Link>
      </div>

      {/* Rafi chase cursor */}
      <div
        ref={cursorRef}
        style={{
          position: 'fixed', pointerEvents: 'none', opacity: 0,
          display: 'flex', alignItems: 'flex-start', gap: 5,
          zIndex: 9999, transition: 'opacity 0.2s',
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
        }}>Rafi · found it!</div>
      </div>
    </main>
  )
}
