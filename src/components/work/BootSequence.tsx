'use client'

import { useEffect, useRef } from 'react'

interface Props {
  playing: boolean
  onComplete: () => void
}

export default function BootSequence({ playing, onComplete }: Props) {
  const calledRef = useRef(false)

  useEffect(() => {
    if (!playing) { calledRef.current = false; return }
    calledRef.current = false
    const t = setTimeout(() => {
      if (!calledRef.current) { calledRef.current = true; onComplete() }
    }, 900)
    return () => clearTimeout(t)
  }, [playing, onComplete])

  if (!playing) return null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99000,
      background: '#011910',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      pointerEvents: 'none',
      animation: 'boot-fade-in 0.15s ease-out forwards',
    }}>
      {/* Scanline sweep */}
      <div style={{
        position: 'absolute', left: 0, right: 0, height: 2,
        background: 'rgba(92,255,133,0.7)',
        boxShadow: '0 0 18px 4px rgba(92,255,133,0.4)',
        animation: 'boot-scan 0.55s linear 0.15s 1 forwards',
        top: 0,
      }} />

      {/* Loading label */}
      <div style={{
        fontFamily: 'monospace', fontSize: 11, fontWeight: 600,
        letterSpacing: '3px', color: 'rgba(92,255,133,0.6)',
        textTransform: 'uppercase',
        animation: 'boot-text-blink 0.4s step-start 3',
      }}>
        LOADING...
      </div>

      <style>{`
        @keyframes boot-fade-in {
          from { opacity: 0 }
          to   { opacity: 1 }
        }
        @keyframes boot-scan {
          from { top: -2px }
          to   { top: 100% }
        }
        @keyframes boot-text-blink {
          0%,100% { opacity: 1 }
          50%     { opacity: 0 }
        }
      `}</style>
    </div>
  )
}
