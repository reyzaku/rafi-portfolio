'use client'

import { useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  registerTransitionTrigger,
  unregisterTransitionTrigger,
} from '@/lib/page-transition'

// ── easing ────────────────────────────────────────────────────────────────

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function animateTo(
  duration: number,
  easing: (t: number) => number,
  onUpdate: (p: number) => void,
  onDone?: () => void
): () => void {
  const start = performance.now()
  let raf: number
  function frame(now: number) {
    const t = Math.min((now - start) / duration, 1)
    onUpdate(easing(t))
    if (t < 1) raf = requestAnimationFrame(frame)
    else onDone?.()
  }
  raf = requestAnimationFrame(frame)
  return () => cancelAnimationFrame(raf)
}

// ── constants ─────────────────────────────────────────────────────────────

// How far above the overlay's top edge the cursor floats (looks like it's
// gripping the sheet and pulling it)
const GRIP_OFFSET = 10 // px

// Duration for each phase
const SLIDE_MS = 680  // curtain slide
const WALK_MS  = 500  // cursor walking down to grab the bottom

// ── component ─────────────────────────────────────────────────────────────

export default function PageTransition() {
  const router     = useRouter()
  const pathname   = usePathname()
  const overlayRef = useRef<HTMLDivElement>(null)
  const cursorRef  = useRef<HTMLDivElement>(null)
  const labelRef   = useRef<HTMLSpanElement>(null)
  const loadingRef = useRef<HTMLDivElement>(null)
  const busyRef    = useRef(false)
  const firstRef   = useRef(true)  // skip entry anim on initial load

  // ── Entry animation (fires whenever pathname changes) ──────────────────
  useEffect(() => {
    // Skip on the very first mount — no transition needed on cold load
    if (firstRef.current) {
      firstRef.current = false
      const overlay = overlayRef.current
      if (overlay) overlay.style.transform = 'translateY(-100%)'
      return
    }

    const overlay  = overlayRef.current
    const cursor   = cursorRef.current
    const loading  = loadingRef.current
    if (!overlay || !cursor) return

    // Hide loading indicator as soon as new page is ready
    if (loading) { loading.style.opacity = '0' }
    if (labelRef.current) labelRef.current.textContent = 'dragging...'

    const vh = window.innerHeight
    const cx = window.innerWidth / 2 - 11

    // Curtain is covering the screen. Cursor is just above the top of the
    // viewport (left over from exit phase — it slid off the top edge).
    // Phase 1: cursor walks DOWN organically over the dark curtain to reach
    //          the bottom — like Rafi strolling down to grab it.
    // Phase 2: cursor grabs the bottom edge, both slide UP to reveal new page.
    overlay.style.transform = 'translateY(0)'
    cursor.style.left    = cx + 'px'
    cursor.style.top     = (-GRIP_OFFSET) + 'px'  // just above viewport from exit
    cursor.style.opacity = '1'

    // Brief pause — let new page render underneath before the reveal starts
    const pauseId = setTimeout(() => {
      // Phase 1: walk down to the bottom of the curtain
      animateTo(WALK_MS, easeInOutCubic, (p) => {
        cursor.style.top = (-GRIP_OFFSET + vh * p) + 'px'
      }, () => {
        // Phase 2: grab + drag curtain upward
        setTimeout(() => {
          animateTo(SLIDE_MS, easeInOutCubic, (p) => {
            const shift = vh * p
            overlay.style.transform = `translateY(${-shift}px)`
            cursor.style.top = (vh - GRIP_OFFSET - shift) + 'px'
          }, () => {
            cursor.style.opacity = '0'
            overlay.style.transform = 'translateY(-100%)'
            busyRef.current = false
          })
        }, 100)
      })
    }, 60)

    return () => clearTimeout(pauseId)
  }, [pathname])

  // ── Register exit trigger ──────────────────────────────────────────────
  useEffect(() => {
    registerTransitionTrigger((path: string) => {
      if (busyRef.current) return
      busyRef.current = true

      const overlay = overlayRef.current
      const cursor  = cursorRef.current
      if (!overlay || !cursor) { router.push(path); return }

      const vh = window.innerHeight
      const cx = window.innerWidth / 2 - 11

      // Curtain starts below viewport. Cursor sits at the TOP edge of the
      // curtain — Rafi grips the leading edge and pulls it up to cover.
      overlay.style.transform = `translateY(${vh}px)`
      cursor.style.left    = cx + 'px'
      cursor.style.top     = (vh - GRIP_OFFSET) + 'px'
      cursor.style.opacity = '1'

      // Exit: cursor + curtain both slide up by vh → screen fully covered.
      // Cursor ends just above the top of the viewport (-GRIP_OFFSET).
      // We do NOT hide it — entry phase picks it up from there and walks
      // it back down organically over the dark curtain.
      animateTo(SLIDE_MS, easeInOutCubic, (p) => {
        const shift = vh * p
        overlay.style.transform = `translateY(${vh - shift}px)`
        cursor.style.top = (vh - GRIP_OFFSET - shift) + 'px'
      }, () => {
        // Curtain fully closed — show loading indicator while next page loads
        if (labelRef.current) labelRef.current.textContent = 'loading...'
        const loading = loadingRef.current
        if (loading) { loading.style.opacity = '1' }
        router.push(path)
      })
    })

    return () => unregisterTransitionTrigger()
  }, [router])

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <>
      {/* Dark curtain */}
      <div
        ref={overlayRef}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99998,
          backgroundColor: '#011910',
          pointerEvents: 'none',
          willChange: 'transform',
        }}
      >
        {/* Loading indicator — visible only while next page is fetching */}
        <div
          ref={loadingRef}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            opacity: 0,
            transition: 'opacity 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontFamily: 'monospace',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '3px',
            color: 'rgba(255,255,255,0.35)',
            textTransform: 'uppercase',
          }}
        >
          {/* Pulsing dot */}
          <span style={{
            display: 'inline-block',
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: '#5CFF85',
            animation: 'pt-pulse 1s ease-in-out infinite',
          }} />
          loading
        </div>
      </div>

      <style>{`
        @keyframes pt-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.3; transform: scale(0.7); }
        }
      `}</style>

      {/* Rafi cursor — outside overlay so z-index stacks above */}
      <div
        ref={cursorRef}
        style={{
          position: 'fixed',
          pointerEvents: 'none',
          opacity: 0,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 5,
          zIndex: 99999,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/cursor-rafi.png" alt="" width={22} height={22} draggable={false} />
        <div style={{
          marginTop: 18,
          background: '#5CFF85',
          color: '#000',
          fontFamily: 'inherit',
          fontSize: 11,
          fontWeight: 600,
          padding: '5px 10px',
          borderRadius: 3,
          whiteSpace: 'nowrap',
          letterSpacing: '0.01em',
          boxShadow: '0 4px 12px rgba(0,0,0,0.35)',
        }}>
          Rafi · <span ref={labelRef}>dragging...</span>
        </div>
      </div>
    </>
  )
}
