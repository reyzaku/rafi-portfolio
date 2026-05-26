'use client'

import { useEffect, useRef, useState } from 'react'

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const pos = useRef({ x: -100, y: -100 })
  const raf = useRef<number>(0)

  useEffect(() => {
    const move = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY }
      if (!visible) setVisible(true)
    }

    const leave = () => setVisible(false)
    const enter = () => setVisible(true)

    document.addEventListener('mousemove', move)
    document.addEventListener('mouseleave', leave)
    document.addEventListener('mouseenter', enter)

    const loop = () => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px)`
      }
      raf.current = requestAnimationFrame(loop)
    }
    raf.current = requestAnimationFrame(loop)

    return () => {
      document.removeEventListener('mousemove', move)
      document.removeEventListener('mouseleave', leave)
      document.removeEventListener('mouseenter', enter)
      cancelAnimationFrame(raf.current)
    }
  }, [visible])

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 z-[9999] pointer-events-none will-change-transform"
      style={{ opacity: visible ? 1 : 0 }}
    >
      {/* Arrow */}
      <img
        src="/cursor-user.png"
        alt=""
        width={22}
        height={22}
        draggable={false}
        className="block select-none"
        style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))' }}
      />

      {/* Label badge */}
      <div
        className="absolute whitespace-nowrap"
        style={{
          top: '22px',
          left: '16px',
          padding: '5px 10px',
          borderRadius: '4px',
          backgroundColor: '#FFC700',
          boxShadow: '0 4px 12px rgba(0,0,0,0.35)',
        }}
      >
        <span
          className="text-black font-medium text-[13px] leading-none tracking-[-0.04em] font-sans"
        >
          awesome guest @guest
        </span>
      </div>
    </div>
  )
}
