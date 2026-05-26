'use client'

import { useEffect, useRef } from 'react'

const APPROACH_LABELS = ['Rafi · psst', 'Rafi · hey...', 'Rafi · helloooo', 'Rafi · 👋', 'Rafi · yoo hoo', 'Rafi · excuse me...']
const ORBIT_LABELS    = ['Rafi · hey, you there?', 'Rafi · are you sleeping?', 'Rafi · *poke*', 'Rafi · wake up!', 'Rafi · hello??', 'Rafi · anyone home?', 'Rafi · yoooo', 'Rafi · *taps shoulder*', 'Rafi · 🫵', 'Rafi · rise and shine']

function pick(arr: string[]) { return arr[Math.floor(Math.random() * arr.length)] }

export default function IdleRafi() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const labelRef  = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cur = cursorRef.current!
    const lbl = labelRef.current!

    const K = 0.045, D = 0.80   // approach / orbit
    const FK = 0.016, FD = 0.82  // flee — slower, more dramatic exit
    const ORBIT_RADIUS  = 90
    const APPROACH_DIST = 115

    let posX = -200, posY = -200
    let velX = 0, velY = 0
    let targetX = -200, targetY = -200
    let userX = window.innerWidth / 2, userY = window.innerHeight / 2
    let state: 'hidden' | 'entering' | 'orbiting' | 'fleeing' = 'hidden'
    let orbitAngle = 0
    let orbitLabelAngle = 0
    let rafId = 0

    function show() { cur.style.opacity = '1' }
    function hide() {
      cur.style.opacity = '0'
      state = 'hidden'
      posX = -200; posY = -200
      velX = 0; velY = 0
      cur.style.left = '-200px'
      cur.style.top  = '-200px'
    }

    function enterFromEdge() {
      if ((window as any).__rafiPresent) return
      if (state !== 'hidden') return

      const W = window.innerWidth, H = window.innerHeight
      const edge = Math.floor(Math.random() * 4)

      if      (edge === 0) { posX = Math.random() * W; posY = -50 }
      else if (edge === 1) { posX = W + 50; posY = Math.random() * H }
      else if (edge === 2) { posX = Math.random() * W; posY = H + 50 }
      else                 { posX = -50; posY = Math.random() * H }

      velX = 0; velY = 0
      targetX = userX; targetY = userY
      state = 'entering'
      lbl.textContent = pick(APPROACH_LABELS)
      orbitAngle = Math.atan2(posY - userY, posX - userX)
      show()
    }

    function fleeToEdge() {
      if (state === 'hidden') return
      state = 'fleeing'
      lbl.textContent = 'Rafi · bye! 👋'

      const W = window.innerWidth, H = window.innerHeight
      const toTop = posY, toRight = W - posX, toBottom = H - posY, toLeft = posX
      const min   = Math.min(toTop, toRight, toBottom, toLeft)

      if      (min === toTop)    { targetX = posX;    targetY = -80 }
      else if (min === toRight)  { targetX = W + 80;  targetY = posY }
      else if (min === toBottom) { targetX = posX;    targetY = H + 80 }
      else                       { targetX = -80;     targetY = posY }
    }

    function loop() {
      if (state !== 'hidden') {
        if (state === 'entering' || state === 'orbiting') {
          const dx   = userX - posX
          const dy   = userY - posY
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < APPROACH_DIST) {
            // Switch to orbiting on first approach
            if (state === 'entering') {
              state = 'orbiting'
              orbitAngle = Math.atan2(posY - userY, posX - userX)
              orbitLabelAngle = orbitAngle
              lbl.textContent = pick(ORBIT_LABELS)
            }
            // Orbit around user cursor
            orbitAngle += 0.022
            targetX = userX + Math.cos(orbitAngle) * ORBIT_RADIUS
            targetY = userY + Math.sin(orbitAngle) * ORBIT_RADIUS

            // Change label every full orbit
            if (orbitAngle - orbitLabelAngle > Math.PI * 2) {
              orbitLabelAngle = orbitAngle
              lbl.textContent = pick(ORBIT_LABELS)
            }
          } else if (state === 'entering') {
            targetX = userX
            targetY = userY
          }
        }

        // Slow spring for enter/flee, normal for orbit
        const ck = state === 'orbiting' ? K  : FK
        const cd = state === 'orbiting' ? D  : FD
        velX = (velX + (targetX - posX) * ck) * cd
        velY = (velY + (targetY - posY) * ck) * cd
        posX += velX
        posY += velY

        cur.style.left = posX + 'px'
        cur.style.top  = posY + 'px'

        // Hide once fully off-screen after fleeing
        if (state === 'fleeing') {
          const W = window.innerWidth, H = window.innerHeight
          if (posX < -70 || posX > W + 70 || posY < -70 || posY > H + 70) hide()
        }
      }

      rafId = requestAnimationFrame(loop)
    }
    rafId = requestAnimationFrame(loop)

    const onUserIdle   = () => enterFromEdge()
    const onUserActive = () => fleeToEdge()
    const onMove = (e: MouseEvent) => { userX = e.clientX; userY = e.clientY }

    window.addEventListener('user-idle',   onUserIdle)
    window.addEventListener('user-active', onUserActive)
    window.addEventListener('mousemove',   onMove)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('user-idle',   onUserIdle)
      window.removeEventListener('user-active', onUserActive)
      window.removeEventListener('mousemove',   onMove)
    }
  }, [])

  return (
    <div
      ref={cursorRef}
      style={{
        position: 'fixed', pointerEvents: 'none', opacity: 0,
        display: 'flex', alignItems: 'flex-start', gap: 5,
        zIndex: 99998,
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
      }}>Rafi · psst</div>
    </div>
  )
}
