'use client'

import { useEffect, useRef } from 'react'
import { selectionStore, SelectionBounds, RULER_SIZE } from '@/lib/selection-store'

const R = RULER_SIZE

function drawH(canvas: HTMLCanvasElement, cx: number, sel: SelectionBounds) {
  const ctx = canvas.getContext('2d')!
  const dpr = window.devicePixelRatio || 1
  const W = canvas.width / dpr, H = canvas.height / dpr
  ctx.save()
  ctx.scale(dpr, dpr)
  ctx.clearRect(0, 0, W, H)

  ctx.fillStyle = 'rgba(0,0,0,0.38)'
  ctx.fillRect(0, 0, W, H)

  // Selection range highlight
  if (sel) {
    const sx = sel.x - R, sw = sel.w
    ctx.fillStyle = 'rgba(92,255,133,0.13)'
    ctx.fillRect(sx, 0, sw, H)
    ctx.strokeStyle = 'rgba(92,255,133,0.75)'
    ctx.lineWidth = 1
    for (const px of [sx, sx + sw]) {
      ctx.beginPath(); ctx.moveTo(px + 0.5, 0); ctx.lineTo(px + 0.5, H); ctx.stroke()
    }
    ctx.fillStyle = 'rgba(92,255,133,1)'
    ctx.font = '7px monospace'
    ctx.textAlign = 'left'
    ctx.fillText(String(Math.round(sel.x)), sx + 2, H - 3)
    ctx.fillText(String(Math.round(sel.x + sel.w)), sx + sw + 2, H - 3)
  }

  // Ticks + labels
  for (let x = 0; x <= W; x += 10) {
    const maj = x % 100 === 0
    const mid = x % 50 === 0 && !maj
    if (!maj && !mid) continue

    const th = maj ? 7 : 4
    ctx.strokeStyle = maj ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.1)'
    ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(x + 0.5, H - th); ctx.lineTo(x + 0.5, H); ctx.stroke()

    if (maj && x >= 100) {
      ctx.fillStyle = 'rgba(255,255,255,0.28)'
      ctx.font = '7px monospace'
      ctx.textAlign = 'left'
      ctx.fillText(String(x), x + 2, H - th - 1)
    }
  }

  // Bottom border
  ctx.strokeStyle = 'rgba(255,255,255,0.1)'
  ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(0, H - 0.5); ctx.lineTo(W, H - 0.5); ctx.stroke()

  // Cursor indicator
  if (cx >= 0 && cx <= W) {
    ctx.strokeStyle = 'rgba(92,255,133,0.55)'
    ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(cx + 0.5, 0); ctx.lineTo(cx + 0.5, H); ctx.stroke()

    const label = String(Math.round(cx + R))
    ctx.font = '7px monospace'
    ctx.textAlign = 'center'
    const tw = ctx.measureText(label).width
    const bx = Math.max(tw / 2 + 3, Math.min(W - tw / 2 - 3, cx))
    ctx.fillStyle = 'rgba(92,255,133,0.9)'
    ctx.fillRect(bx - tw / 2 - 2, 2, tw + 4, 10)
    ctx.fillStyle = '#000'
    ctx.fillText(label, bx, 11)
  }
  ctx.restore()
}

function drawV(canvas: HTMLCanvasElement, cy: number, sel: SelectionBounds) {
  const ctx = canvas.getContext('2d')!
  const dpr = window.devicePixelRatio || 1
  const W = canvas.width / dpr, H = canvas.height / dpr
  ctx.save()
  ctx.scale(dpr, dpr)
  ctx.clearRect(0, 0, W, H)

  ctx.fillStyle = 'rgba(0,0,0,0.38)'
  ctx.fillRect(0, 0, W, H)

  // Selection range highlight
  if (sel) {
    const sy = sel.y - R, sh = sel.h
    ctx.fillStyle = 'rgba(92,255,133,0.13)'
    ctx.fillRect(0, sy, W, sh)
    ctx.strokeStyle = 'rgba(92,255,133,0.75)'
    ctx.lineWidth = 1
    for (const py of [sy, sy + sh]) {
      ctx.beginPath(); ctx.moveTo(0, py + 0.5); ctx.lineTo(W, py + 0.5); ctx.stroke()
    }
    for (const [py, lbl] of [[sy, String(Math.round(sel.y))], [sy + sh, String(Math.round(sel.y + sel.h))]] as [number, string][]) {
      ctx.save()
      ctx.translate(W - 2, py + 2)
      ctx.rotate(-Math.PI / 2)
      ctx.fillStyle = 'rgba(92,255,133,1)'
      ctx.font = '7px monospace'
      ctx.textAlign = 'left'
      ctx.fillText(lbl, 0, 0)
      ctx.restore()
    }
  }

  // Ticks + labels
  for (let y = 0; y <= H; y += 10) {
    const maj = y % 100 === 0
    const mid = y % 50 === 0 && !maj
    if (!maj && !mid) continue

    const th = maj ? 7 : 4
    ctx.strokeStyle = maj ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.1)'
    ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(W - th, y + 0.5); ctx.lineTo(W, y + 0.5); ctx.stroke()

    if (maj && y >= 100) {
      ctx.save()
      ctx.translate(W - th - 1, y)
      ctx.rotate(-Math.PI / 2)
      ctx.fillStyle = 'rgba(255,255,255,0.28)'
      ctx.font = '7px monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(String(y), 0, 0)
      ctx.restore()
    }
  }

  // Right border
  ctx.strokeStyle = 'rgba(255,255,255,0.1)'
  ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(W - 0.5, 0); ctx.lineTo(W - 0.5, H); ctx.stroke()

  // Cursor indicator
  if (cy >= 0 && cy <= H) {
    ctx.strokeStyle = 'rgba(92,255,133,0.55)'
    ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(0, cy + 0.5); ctx.lineTo(W, cy + 0.5); ctx.stroke()

    const label = String(Math.round(cy + R))
    ctx.save()
    ctx.translate(W / 2, cy)
    ctx.rotate(-Math.PI / 2)
    ctx.font = '7px monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const tw = ctx.measureText(label).width
    ctx.fillStyle = 'rgba(92,255,133,0.9)'
    ctx.fillRect(-tw / 2 - 2, -5, tw + 4, 10)
    ctx.fillStyle = '#000'
    ctx.fillText(label, 0, 0)
    ctx.restore()
  }
  ctx.restore()
}

export default function Ruler() {
  const hRef = useRef<HTMLCanvasElement>(null)
  const vRef = useRef<HTMLCanvasElement>(null)
  const cursor = useRef({ x: -R, y: -R })
  const selRef = useRef<SelectionBounds>(null)

  function redraw() {
    if (hRef.current) drawH(hRef.current, cursor.current.x - R, selRef.current)
    if (vRef.current) drawV(vRef.current, cursor.current.y - R, selRef.current)
  }

  useEffect(() => {
    const unsub = selectionStore.subscribe(b => { selRef.current = b; redraw() })

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      if (hRef.current) {
        const lw = window.innerWidth - R, lh = R
        hRef.current.width  = lw * dpr
        hRef.current.height = lh * dpr
        hRef.current.style.width  = lw + 'px'
        hRef.current.style.height = lh + 'px'
      }
      if (vRef.current) {
        const lw = R, lh = window.innerHeight - R
        vRef.current.width  = lw * dpr
        vRef.current.height = lh * dpr
        vRef.current.style.width  = lw + 'px'
        vRef.current.style.height = lh + 'px'
      }
      redraw()
    }

    const onMove = (e: MouseEvent) => { cursor.current = { x: e.clientX, y: e.clientY }; redraw() }

    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', onMove)
    resize()

    return () => {
      unsub()
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      {/* Corner square */}
      <div style={{
        position: 'fixed', top: 0, left: 0,
        width: R, height: R,
        background: 'rgba(0,0,0,0.5)',
        zIndex: 10000,
      }} />
      {/* Horizontal ruler */}
      <canvas ref={hRef} style={{
        position: 'fixed', top: 0, left: R,
        height: R, display: 'block', zIndex: 10000,
      }} />
      {/* Vertical ruler */}
      <canvas ref={vRef} style={{
        position: 'fixed', top: R, left: 0,
        width: R, display: 'block', zIndex: 10000,
      }} />
    </>
  )
}
