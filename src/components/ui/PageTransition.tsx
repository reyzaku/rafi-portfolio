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

// Duration for each half of the transition
const SLIDE_MS = 680

// ── component ─────────────────────────────────────────────────────────────

export default function PageTransition() {
  const router     = useRouter()
  const pathname   = usePathname()
  const overlayRef = useRef<HTMLDivElement>(null)
  const cursorRef  = useRef<HTMLDivElement>(null)
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

    const overlay = overlayRef.current
    const cursor  = cursorRef.current
    if (!overlay || !cursor) return

    const vh = window.innerHeight
    const cx = window.innerWidth / 2 - 11

    // Overlay is currently covering the screen (translateY 0).
    // Cursor sits just above the overlay's top edge (y = -GRIP_OFFSET).
    overlay.style.transform = 'translateY(0)'
    cursor.style.left    = cx + 'px'
    cursor.style.top     = (-GRIP_OFFSET) + 'px'
    cursor.style.opacity = '1'

    // Brief pause — let new page render underneath before pulling away
    const pauseId = setTimeout(() => {
      animateTo(SLIDE_MS, easeInOutCubic, (p) => {
        const shift = vh * p
        overlay.style.transform = `translateY(${-shift}px)`
        cursor.style.top = (-GRIP_OFFSET - shift) + 'px'
      }, () => {
        cursor.style.opacity = '0'
        overlay.style.transform = 'translateY(-100%)'
        busyRef.current = false
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

      // Overlay starts just below the viewport; cursor sits at its top edge
      overlay.style.transform = `translateY(${vh}px)`
      cursor.style.left    = cx + 'px'
      cursor.style.top     = (vh - GRIP_OFFSET) + 'px'
      cursor.style.opacity = '1'

      // Exit: cursor + overlay both slide up by vh → screen covered
      animateTo(SLIDE_MS, easeInOutCubic, (p) => {
        const shift = vh * p
        overlay.style.transform = `translateY(${vh - shift}px)`
        cursor.style.top = (vh - GRIP_OFFSET - shift) + 'px'
      }, () => {
        // Screen is now fully covered — navigate.
        // Entry useEffect will handle the reveal once pathname updates.
        cursor.style.opacity = '0'
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
      />

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
          Rafi · dragging...
        </div>
      </div>
    </>
  )
}
