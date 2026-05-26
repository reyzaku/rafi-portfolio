'use client'

import { useEffect, useRef, useState } from 'react'
import { selectionStore, SelectionBounds } from '@/lib/selection-store'
import { transformStore, correctionBus } from '@/lib/transform-store'

const HANDLE   = 7
const GREEN    = 'rgba(92,255,133,0.95)'
const GREEN_DIM = 'rgba(92,255,133,0.2)'
const ROT_OFFSET = 32   // px above selection top

const CORNER_CURSORS = ['nwse-resize', 'nesw-resize', 'nesw-resize', 'nwse-resize']

export default function SelectionOverlay() {
  const [sel, setSel] = useState<SelectionBounds>(null)
  const selRef  = useRef<SelectionBounds>(null)
  const dragRef = useRef<{
    mode: 'scale' | 'rotate'
    origScale: number
    origRotation: number
    origDist: number
    initAngle: number
    center: { x: number; y: number }
  } | null>(null)

  // Keep selRef in sync with sel state
  useEffect(() => { selRef.current = sel }, [sel])

  useEffect(() => {
    setSel(selectionStore.get())
    return selectionStore.subscribe(setSel)
  }, [])

  // Window-level drag handlers (registered once)
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const d = dragRef.current
      const s = selRef.current
      if (!d || !s) return
      const el = document.getElementById(s.id) as HTMLElement | null
      if (!el) return

      if (d.mode === 'scale') {
        const dist = Math.hypot(e.clientX - d.center.x, e.clientY - d.center.y)
        const newScale = Math.max(0.3, Math.min(3, (d.origScale * dist) / Math.max(d.origDist, 1)))
        transformStore.set(s.id, { scale: newScale, rotation: d.origRotation })
        el.style.transform = `scale(${newScale}) rotate(${d.origRotation}deg)`
      } else {
        const angle = Math.atan2(e.clientY - d.center.y, e.clientX - d.center.x)
        const newRot = d.origRotation + (angle - d.initAngle) * (180 / Math.PI)
        transformStore.set(s.id, { scale: d.origScale, rotation: newRot })
        el.style.transform = `scale(${d.origScale}) rotate(${newRot}deg)`
      }

      // Update selection overlay bounds
      const r = el.getBoundingClientRect()
      selectionStore.set({ x: r.left, y: r.top, w: r.width, h: r.height, id: s.id })
    }

    const onUp = () => {
      const d = dragRef.current
      const s = selRef.current
      if (!d || !s) return
      dragRef.current = null

      const { scale, rotation } = transformStore.get(s.id)
      const scaleDiff = Math.abs(scale - 1)
      const rotNorm   = ((rotation % 360) + 360) % 360
      const rotDiff   = Math.min(rotNorm, 360 - rotNorm)

      if (scaleDiff > 0.2 || rotDiff > 12) {
        correctionBus.request(s.id, d.mode === 'scale' ? 'scale' : 'rotation')
      }
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  if (!sel) return null

  const { x, y, w, h } = sel
  const half   = HANDLE / 2
  const center = { x: x + w / 2, y: y + h / 2 }

  const corners = [
    { top: y - half,     left: x - half     },   // TL
    { top: y - half,     left: x + w - half },   // TR
    { top: y + h - half, left: x - half     },   // BL
    { top: y + h - half, left: x + w - half },   // BR
  ]

  const onCornerDown = (i: number) => (e: React.MouseEvent) => {
    e.stopPropagation()
    const dist = Math.hypot(e.clientX - center.x, e.clientY - center.y)
    const t = transformStore.get(sel.id)
    dragRef.current = {
      mode: 'scale',
      origScale: t.scale,
      origRotation: t.rotation,
      origDist: dist,
      initAngle: 0,
      center,
    }
  }

  const onRotateDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    const angle = Math.atan2(e.clientY - center.y, e.clientX - center.x)
    const t = transformStore.get(sel.id)
    dragRef.current = {
      mode: 'rotate',
      origScale: t.scale,
      origRotation: t.rotation,
      origDist: 0,
      initAngle: angle,
      center,
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9990 }}>
      {/* Dashed crosshair lines */}
      <div style={{ position:'absolute', left:x,   top:0, bottom:0, width:1, borderLeft:`1px dashed ${GREEN_DIM}` }} />
      <div style={{ position:'absolute', left:x+w, top:0, bottom:0, width:1, borderLeft:`1px dashed ${GREEN_DIM}` }} />
      <div style={{ position:'absolute', top:y,   left:0, right:0, height:1, borderTop:`1px dashed ${GREEN_DIM}` }} />
      <div style={{ position:'absolute', top:y+h, left:0, right:0, height:1, borderTop:`1px dashed ${GREEN_DIM}` }} />

      {/* Selection border */}
      <div style={{ position:'absolute', left:x, top:y, width:w, height:h, outline:`1.5px solid ${GREEN}`, outlineOffset:0 }} />

      {/* Rotation line */}
      <div style={{
        position: 'absolute',
        left: center.x,
        top: y - ROT_OFFSET,
        height: ROT_OFFSET,
        width: 1,
        borderLeft: `1px dashed ${GREEN_DIM}`,
      }} />

      {/* Rotation handle */}
      <div
        className="transform-handle"
        onMouseDown={onRotateDown}
        style={{
          position: 'absolute',
          top:  y - ROT_OFFSET - 5,
          left: center.x - 5,
          width: 10, height: 10,
          background: GREEN,
          borderRadius: '50%',
          pointerEvents: 'auto',
          cursor: 'crosshair',
        }}
      />

      {/* Corner handles (scale) */}
      {corners.map((pos, i) => (
        <div
          key={i}
          className="transform-handle"
          onMouseDown={onCornerDown(i)}
          style={{
            position: 'absolute',
            top: pos.top, left: pos.left,
            width: HANDLE, height: HANDLE,
            background: '#fff',
            border: `1.5px solid ${GREEN}`,
            borderRadius: 1,
            pointerEvents: 'auto',
            cursor: CORNER_CURSORS[i],
          }}
        />
      ))}

      {/* Size label */}
      <div style={{
        position: 'absolute',
        top: y + h + 8,
        left: x + w / 2,
        transform: 'translateX(-50%)',
        background: GREEN,
        color: '#000',
        fontSize: 11,
        fontWeight: 600,
        padding: '2px 7px',
        borderRadius: 3,
        whiteSpace: 'nowrap',
        fontFamily: 'monospace',
        letterSpacing: '0.02em',
        pointerEvents: 'none',
      }}>
        {Math.round(w)} × {Math.round(h)}
      </div>
    </div>
  )
}
