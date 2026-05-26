'use client'

import { useEffect, useRef, useState } from 'react'

interface Rect { x: number; y: number; w: number; h: number }

export default function SelectionBox() {
  const [rect, setRect] = useState<Rect | null>(null)
  const start = useRef<{ x: number; y: number } | null>(null)
  const dragging = useRef(false)

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (e.button !== 0) return
      const el = e.target as HTMLElement
      if (el.closest('button, a, [role="button"], .draggable, .transform-handle')) return
      const tag = el.tagName.toLowerCase()
      if (['input', 'textarea', 'select', 'img'].includes(tag)) return

      start.current = { x: e.clientX, y: e.clientY }
      dragging.current = false
    }

    const onMove = (e: MouseEvent) => {
      if (!start.current) return

      // cancel if a hero element is being dragged
      if (document.querySelector('.is-grabbed')) {
        start.current = null
        dragging.current = false
        setRect(null)
        return
      }

      const dx = e.clientX - start.current.x
      const dy = e.clientY - start.current.y

      // only start drawing after a small threshold
      if (!dragging.current && Math.abs(dx) < 4 && Math.abs(dy) < 4) return
      dragging.current = true

      setRect({
        x: Math.min(start.current.x, e.clientX),
        y: Math.min(start.current.y, e.clientY),
        w: Math.abs(dx),
        h: Math.abs(dy),
      })
    }

    const onUp = () => {
      start.current = null
      dragging.current = false
      setRect(null)
    }

    window.addEventListener('mousedown', onDown)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)

    return () => {
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  if (!rect) return null

  return (
    <div
      className="fixed pointer-events-none z-[9998]"
      style={{
        left: rect.x,
        top: rect.y,
        width: rect.w,
        height: rect.h,
        backgroundColor: 'rgba(92, 255, 133, 0.08)',
        border: '1px solid rgba(92, 255, 133, 0.5)',
      }}
    />
  )
}
