'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function animateTo(
  duration: number,
  easing: (t: number) => number,
  onUpdate: (p: number) => void,
  onDone?: () => void
) {
  const start = performance.now()
  function frame(now: number) {
    const t = Math.min((now - start) / duration, 1)
    onUpdate(easing(t))
    if (t < 1) requestAnimationFrame(frame)
    else onDone?.()
  }
  requestAnimationFrame(frame)
}

export default function WelcomeScreen() {
  const screenRef = useRef<HTMLDivElement>(null)
  const cursorRef = useRef<HTMLDivElement>(null)
  const [gone,    setGone]    = useState(false)
  const [clicked, setClicked] = useState(false)

  function startExit() {
    if (clicked) return
    setClicked(true)

    const screen = screenRef.current
    const cursor = cursorRef.current
    if (!screen || !cursor) return

    const cx = window.innerWidth / 2 - 11
    const cy = window.innerHeight / 2

    // Place cursor off-screen top
    cursor.style.left    = cx + 'px'
    cursor.style.top     = '-40px'
    cursor.style.opacity = '1'

    // Phase 1 — cursor drops to center (ease-out, 550ms)
    animateTo(550, easeOutCubic, (p) => {
      cursor.style.top = (-40 + (cy + 40) * p) + 'px'
    }, () => {
      // Brief pause — cursor "grabs" the screen
      setTimeout(() => {
        // Phase 2 — screen + cursor slide up off viewport (ease-in-out, 1050ms)
        const dist = window.innerHeight + 60
        animateTo(1050, easeInOutCubic, (p) => {
          screen.style.transform = `translateY(${-dist * p}px)`
          cursor.style.top       = (cy - dist * p) + 'px'
        }, () => {
          setGone(true)
        })
      }, 180)
    })
  }

  if (gone) return null

  return (
    <div
      ref={screenRef}
      onClick={startExit}
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        backgroundColor: '#011910',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        cursor: 'default', userSelect: 'none',
      }}
    >
      {/* Logo */}
      <div className="ws-logo" style={{ marginBottom: 32 }}>
        <Image src="/logo-green.png" alt="Rafi" width={52} height={52} style={{ objectFit: 'contain' }} priority />
      </div>

      {/* Hello, */}
      <p className="ws-hello" style={{
        fontSize: 'clamp(12px, 1.8vw, 15px)', fontWeight: 600,
        color: 'rgba(255,255,255,0.5)', letterSpacing: '0.18em',
        textTransform: 'uppercase', marginBottom: 10,
      }}>Hello,</p>

      {/* Welcome to my portfolio */}
      <h1 className="ws-title" style={{
        fontSize: 'clamp(26px, 5vw, 52px)', fontWeight: 700,
        color: '#ffffff', letterSpacing: '-0.03em',
        lineHeight: 1.1, textAlign: 'center',
        marginBottom: 52,
      }}>Welcome to my portfolio</h1>

      {/* Pulsing CTA */}
      <p className="ws-pulse" style={{
        fontSize: 'clamp(10px, 1.3vw, 12px)', fontWeight: 500,
        letterSpacing: '0.2em', textTransform: 'uppercase',
      }}>Click anywhere to see my masterpiece</p>

      {/* Rafi cursor */}
      <div
        ref={cursorRef}
        style={{
          position: 'fixed', pointerEvents: 'none', opacity: 0,
          display: 'flex', alignItems: 'flex-start', gap: 5,
          zIndex: 100000,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/cursor-rafi.png" alt="" width={22} height={22} draggable={false} />
        <div style={{
          marginTop: 18, background: '#5CFF85', color: '#000',
          fontFamily: 'inherit', fontSize: 11, fontWeight: 600,
          padding: '5px 10px', borderRadius: 3,
          whiteSpace: 'nowrap', letterSpacing: '0.01em',
          boxShadow: '0 4px 12px rgba(0,0,0,0.35)',
        }}>Rafi · dragging...</div>
      </div>

      <style>{`
        .ws-logo {
          opacity: 0;
          transform: translateY(6px);
          animation: ws-in 0.22s ease-out 0.2s forwards;
        }
        .ws-hello {
          opacity: 0;
          transform: translateY(6px);
          animation: ws-in 0.22s ease-out 0.5s forwards;
        }
        .ws-title {
          opacity: 0;
          transform: translateY(6px);
          animation: ws-in 0.22s ease-out 0.78s forwards;
        }
        .ws-pulse {
          opacity: 0;
          transform: translateY(6px);
          animation: ws-in-pulse 0.22s ease-out 1.15s forwards, ws-pulse 2.8s ease-in-out 1.5s infinite;
        }
        @keyframes ws-in {
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes ws-in-pulse {
          to { opacity: 0.4; transform: translateY(0); }
        }
        @keyframes ws-pulse {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 0.85; }
        }
      `}</style>
    </div>
  )
}
