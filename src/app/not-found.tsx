'use client'

import { useEffect, useRef } from 'react'
import Nav from '@/components/layout/Nav'
import Link from 'next/link'
import { selectionStore } from '@/lib/selection-store'

const FLEE_LABELS = [
  'Rafi · nope!', 'Rafi · bye!', 'Rafi · not today', 'Rafi · leave me alone',
  'Rafi · NOPE NOPE NOPE', 'Rafi · i dont know you', 'Rafi · stranger danger',
  'Rafi · im busy rn', 'Rafi · please no', 'Rafi · ✌️ peace out',
  'Rafi · i have a meeting', 'Rafi · aaaaaa', 'Rafi · why are you like this',
]
const IDLE_LABELS = [
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
const WANDER_LABELS = [
  'Rafi · exploring...', 'Rafi · where am i', 'Rafi · just wandering',
  'Rafi · taking a walk', 'Rafi · no destination', 'Rafi · aimless as always',
  'Rafi · looking for something', 'Rafi · this way maybe?', 'Rafi · hm this looks nice',
  'Rafi · i live here now', 'Rafi · not all who wander are lost', 'Rafi · ok maybe i am lost',
]
const CARRY_LABELS = [
  'Rafi · got it!', 'Rafi · careful now...', 'Rafi · this is heavy',
  'Rafi · dont drop it', 'Rafi · handling with care', 'Rafi · almost there...',
  'Rafi · fragile!', 'Rafi · easy does it',
]
const PLACE_LABELS = [
  'Rafi · there!', 'Rafi · fixed ✓', 'Rafi · perfect',
  "Rafi · you're welcome", 'Rafi · nailed it', 'Rafi · like new',
  'Rafi · *dusts hands*', 'Rafi · good as new',
]
const DROP_LABELS = [
  'Rafi · DROPPED IT', 'Rafi · nooo', 'Rafi · my bad!!',
  'Rafi · oops bye', 'Rafi · it slipped!!', 'Rafi · SORRY',
]

function pick(arr: string[]) { return arr[Math.floor(Math.random() * arr.length)] }

type PhysEl = {
  id: string
  el: HTMLElement | null
  x: number; y: number; vx: number; vy: number
  rot: number; vrot: number
  origX: number; origY: number; w: number; h: number
  state: 'placed' | 'falling' | 'fallen' | 'carried' | 'returning'
}

export default function NotFound() {
  const cursorRef   = useRef<HTMLDivElement>(null)
  const labelRef    = useRef<HTMLDivElement>(null)
  const headingRef  = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const btnWrapRef  = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cur = cursorRef.current!
    const lbl = labelRef.current!

    const PAD       = 40           // small so Rafi can reach elements near the floor
    const FLEE_DIST = 160
    const FLEE_SAFE = 260
    const WK = 0.009, WD = 0.85  // Rafi walk — slow and floaty
    const FK = 0.012, FD = 0.80  // Flee
    const GRAVITY   = 0.32
    const BOUNCE    = 0.22
    const FLOOR_PAD = 50

    // ── Physics elements ──────────────────────────────────────────
    const els: PhysEl[] = [
      { id: 'el-404', el: headingRef.current,  x:0,y:0,vx:0,vy:0,rot:0,vrot:0, origX:0,origY:0,w:0,h:0, state:'placed' },
      { id: 'el-sub', el: subtitleRef.current, x:0,y:0,vx:0,vy:0,rot:0,vrot:0, origX:0,origY:0,w:0,h:0, state:'placed' },
      { id: 'el-btn', el: btnWrapRef.current,  x:0,y:0,vx:0,vy:0,rot:0,vrot:0, origX:0,origY:0,w:0,h:0, state:'placed' },
    ]

    function measureAndFall() {
      // Measure ALL rects before touching any styles — prevents reflow mid-loop
      const rects = els.map(p => p.el?.getBoundingClientRect() ?? null)

      els.forEach((p, i) => {
        if (!p.el) return
        const r = rects[i]!
        p.origX = r.left; p.origY = r.top
        p.w = r.width;    p.h = r.height
        p.x = r.left;     p.y = r.top
        p.el.style.position = 'fixed'
        p.el.style.left     = r.left + 'px'
        p.el.style.top      = r.top  + 'px'
        p.el.style.margin   = '0'
        p.el.style.zIndex   = '20'
        p.el.style.opacity  = '1'
      })

      // Staggered fall
      els.forEach((p, i) => {
        setTimeout(() => {
          p.state = 'falling'
          p.vx    = (Math.random() - 0.5) * 5
          p.vy    = -(Math.random() * 1.5)
          p.vrot  = (Math.random() - 0.5) * 3
        }, i * 120 + Math.random() * 60)
      })
    }

    // ── Rafi state ─────────────────────────────────────────────────
    let rafiX = window.innerWidth / 2, rafiY = window.innerHeight / 2
    let rafiVX = 0, rafiVY = 0
    let rafiTX = rafiX, rafiTY = rafiY
    let rafiState: 'wander' | 'idle' | 'approaching' | 'carrying' | 'flee' = 'wander'
    let carrying: PhysEl | null = null
    let mouseX = -999, mouseY = -999
    let canDetect = true
    let idleTimer  = 0
    let restartTimer = 0
    let rafId = 0

    function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)) }
    function bounds() {
      return { minX: PAD, maxX: window.innerWidth - PAD, minY: PAD, maxY: window.innerHeight - PAD }
    }
    function randTarget() {
      const b = bounds()
      return { x: b.minX + Math.random() * (b.maxX - b.minX), y: b.minY + Math.random() * (b.maxY - b.minY) }
    }
    function safeFlee() {
      for (let i = 0; i < 20; i++) {
        const t = randTarget()
        const dx = t.x - mouseX, dy = t.y - mouseY
        if (Math.sqrt(dx*dx + dy*dy) >= FLEE_SAFE) return t
      }
      return randTarget()
    }
    function nearestFallen(): PhysEl | null {
      let best: PhysEl | null = null, bestD = Infinity
      for (const p of els) {
        if (p.state !== 'fallen') continue
        const dx = p.x + p.w / 2 - rafiX, dy = p.y + p.h / 2 - rafiY
        const d = dx*dx + dy*dy
        if (d < bestD) { bestD = d; best = p }
      }
      return best
    }

    function startWander() {
      rafiState = 'wander'
      const t = randTarget()
      rafiTX = t.x; rafiTY = t.y
      lbl.textContent = pick(WANDER_LABELS)
    }
    function startIdle() {
      rafiState = 'idle'
      lbl.textContent = pick(IDLE_LABELS)
      idleTimer = window.setTimeout(() => {
        const f = nearestFallen()
        if (f) startApproach(f); else startWander()
      }, 500 + Math.random() * 800)
    }
    function startApproach(p: PhysEl) {
      rafiState = 'approaching'
      rafiTX = p.x + p.w / 2
      rafiTY = p.y + p.h / 2
      lbl.textContent = pick(WANDER_LABELS)
    }
    function startRecovery() {
      rafiState = 'idle'
      lbl.textContent = pick(RECOVERY_LABELS)
      window.dispatchEvent(new CustomEvent('rafi-recover'))
      idleTimer = window.setTimeout(() => {
        const f = nearestFallen()
        if (f) startApproach(f); else startWander()
      }, 1500 + Math.random() * 1000)
    }
    function startFlee() {
      if (idleTimer)    { clearTimeout(idleTimer);    idleTimer    = 0 }
      if (restartTimer) { clearTimeout(restartTimer); restartTimer = 0 }

      // Drop anything carried or returning
      if (carrying) {
        carrying.state = 'falling'
        carrying.vx    = rafiVX + (Math.random() - 0.5) * 4
        carrying.vy    = Math.max(rafiVY, 0) + 1
        carrying.vrot  = (Math.random() - 0.5) * 5
        carrying = null
        lbl.textContent = pick(DROP_LABELS)
      } else {
        lbl.textContent = pick(FLEE_LABELS)
      }
      // Also un-return any returning elements
      els.forEach(p => {
        if (p.state === 'returning') {
          p.state = 'falling'
          p.vy = 1; p.vrot = (Math.random() - 0.5) * 3
        }
      })
      selectionStore.set(null)

      rafiState = 'flee'
      canDetect = false
      window.dispatchEvent(new CustomEvent('rafi-flee'))
      const t = safeFlee()
      rafiTX = t.x; rafiTY = t.y
    }

    ;(window as any).__rafiPresent = true
    cur.style.opacity = '1'
    startWander()

    // Wait two frames for layout to settle, then measure + fall
    requestAnimationFrame(() => requestAnimationFrame(measureAndFall))

    // ── Main loop ──────────────────────────────────────────────────
    function loop() {
      const floor = window.innerHeight - FLOOR_PAD

      // Element physics
      for (const p of els) {
        if (!p.el) continue

        if (p.state === 'falling') {
          p.vy  += GRAVITY
          p.x   += p.vx
          p.y   += p.vy
          p.rot += p.vrot

          if (p.y + p.h >= floor) {
            p.y    = floor - p.h
            p.vy  *= -BOUNCE
            p.vx  *= 0.70
            p.vrot *= 0.45
            if (Math.abs(p.vy) < 0.5 && Math.abs(p.vx) < 0.2 && Math.abs(p.vrot) < 0.3) {
              p.vx = 0; p.vy = 0; p.vrot = 0
              p.state = 'fallen'
            }
          }

          p.el.style.left      = p.x + 'px'
          p.el.style.top       = p.y + 'px'
          p.el.style.transform = `rotate(${p.rot}deg)`
        }

        else if (p.state === 'carried') {
          // Spring-attach to Rafi
          const tx = rafiX + 12, ty = rafiY + 22
          p.vx = (p.vx + (tx - p.x) * 0.4) * 0.6
          p.vy = (p.vy + (ty - p.y) * 0.4) * 0.6
          p.x += p.vx; p.y += p.vy
          p.rot *= 0.82  // straighten

          p.el.style.left      = p.x + 'px'
          p.el.style.top       = p.y + 'px'
          p.el.style.transform = `rotate(${p.rot}deg)`
          selectionStore.set({ x: p.x, y: p.y, w: p.w, h: p.h, id: p.id })
        }

        else if (p.state === 'returning') {
          // Fast spring back to original position
          p.vx = (p.vx + (p.origX - p.x) * 0.18) * 0.72
          p.vy = (p.vy + (p.origY - p.y) * 0.18) * 0.72
          p.x += p.vx; p.y += p.vy
          p.rot *= 0.80

          p.el.style.left      = p.x + 'px'
          p.el.style.top       = p.y + 'px'
          p.el.style.transform = `rotate(${p.rot}deg)`
          selectionStore.set({ x: p.x, y: p.y, w: p.w, h: p.h, id: p.id })

          if (Math.abs(p.x - p.origX) < 1 && Math.abs(p.y - p.origY) < 1 &&
              Math.abs(p.vx) < 0.1 && Math.abs(p.vy) < 0.1) {
            p.x = p.origX; p.y = p.origY; p.rot = 0
            p.vx = 0; p.vy = 0; p.vrot = 0
            p.state = 'placed'
            p.el.style.left      = p.origX + 'px'
            p.el.style.top       = p.origY + 'px'
            p.el.style.transform = 'none'
            selectionStore.set(null)
          }
        }
      }

      // All placed → restart timer
      if (els.every(p => p.state === 'placed') && !restartTimer && rafiState !== 'flee') {
        restartTimer = window.setTimeout(() => {
          restartTimer = 0
          els.forEach((p, i) => setTimeout(() => {
            p.state = 'falling'
            p.vx    = (Math.random() - 0.5) * 6
            p.vy    = -(Math.random() * 1.5)
            p.vrot  = (Math.random() - 0.5) * 4
          }, i * 110 + Math.random() * 60))
        }, 5000)
      }

      // Flee detection
      if (canDetect && mouseX > -900) {
        const dx = mouseX - rafiX, dy = mouseY - rafiY
        if (Math.sqrt(dx*dx + dy*dy) < FLEE_DIST) startFlee()
      }

      // Rafi spring movement
      const k = rafiState === 'flee' ? FK : WK
      const d = rafiState === 'flee' ? FD : WD
      rafiVX = (rafiVX + (rafiTX - rafiX) * k) * d
      rafiVY = (rafiVY + (rafiTY - rafiY) * k) * d
      rafiX += rafiVX; rafiY += rafiVY

      const b = bounds()
      rafiX = clamp(rafiX, b.minX, b.maxX)
      rafiY = clamp(rafiY, b.minY, b.maxY)
      cur.style.left = rafiX + 'px'
      cur.style.top  = rafiY + 'px'

      const settled = Math.abs(rafiVX) < 0.3 && Math.abs(rafiVY) < 0.3
                   && Math.abs(rafiTX - rafiX) < 6 && Math.abs(rafiTY - rafiY) < 6

      // ── Rafi state machine ──
      if (rafiState === 'wander') {
        const f = nearestFallen()
        if (f) startApproach(f)
        else if (settled) startIdle()
      }

      if (rafiState === 'idle') {
        const f = nearestFallen()
        if (f) { clearTimeout(idleTimer); startApproach(f) }
      }

      if (rafiState === 'approaching') {
        const f = nearestFallen()
        if (!f) { startWander(); return }
        // Track the element as it finishes bouncing
        if (f.state === 'fallen') {
          rafiTX = f.x + f.w / 2
          rafiTY = f.y + f.h / 2
        }
        const dx = f.x + f.w / 2 - rafiX, dy = f.y + f.h / 2 - rafiY
        if (Math.sqrt(dx*dx + dy*dy) < 80 && f.state === 'fallen') {
          f.state  = 'carried'
          carrying = f
          rafiState = 'carrying'
          lbl.textContent = pick(CARRY_LABELS)
          selectionStore.set({ x: f.x, y: f.y, w: f.w, h: f.h, id: f.id })
        }
      }

      if (rafiState === 'carrying' && carrying) {
        rafiTX = carrying.origX
        rafiTY = carrying.origY
        const dx = carrying.origX - rafiX, dy = carrying.origY - rafiY
        if (Math.sqrt(dx*dx + dy*dy) < 25 && settled) {
          // Release to return spring
          carrying.state = 'returning'
          lbl.textContent = pick(PLACE_LABELS)
          window.dispatchEvent(new CustomEvent('rafi-correct'))
          carrying = null
          idleTimer = window.setTimeout(() => {
            const next = nearestFallen()
            if (next) startApproach(next); else startWander()
          }, 500)
        }
      }

      if (rafiState === 'flee' && settled) {
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
      ;(window as any).__rafiPresent = false
      cancelAnimationFrame(rafId)
      clearTimeout(idleTimer)
      if (restartTimer) clearTimeout(restartTimer)
      selectionStore.set(null)
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

      {/* Elements start in flex layout for measurement, then switch to fixed for physics */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 select-none pointer-events-none">
        <h1
          ref={headingRef}
          id="el-404"
          style={{
            fontSize: 'clamp(100px, 22vw, 280px)', fontWeight: 700,
            letterSpacing: '-0.06em', color: '#ffffff', lineHeight: 1,
            textShadow: '0 0 120px rgba(92,255,133,0.15)',
            opacity: 0,
          }}
        >404</h1>

        <p
          ref={subtitleRef}
          id="el-sub"
          style={{
            fontSize: 'clamp(13px, 1.5vw, 16px)', fontWeight: 400,
            color: 'rgba(255,255,255,0.45)', letterSpacing: '-0.02em',
            opacity: 0,
          }}
        >Bro, how did you end up here?</p>

        <div
          ref={btnWrapRef}
          id="el-btn"
          style={{ marginTop: 12, opacity: 0, pointerEvents: 'auto' }}
        >
          <Link href="/">
            <button style={{
              backgroundColor: '#5CFF85', color: '#000',
              fontSize: 'clamp(13px, 1.5vw, 16px)', fontWeight: 700,
              letterSpacing: '-0.04em', padding: '12px 36px',
              borderRadius: '37px', border: 'none',
              fontFamily: 'inherit', cursor: 'pointer',
            }}>Take me home</button>
          </Link>
        </div>
      </div>

      {/* Rafi cursor */}
      <div ref={cursorRef} style={{
        position: 'fixed', pointerEvents: 'none', opacity: 0,
        display: 'flex', alignItems: 'flex-start', gap: 5,
        zIndex: 9999,
      }}>
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
