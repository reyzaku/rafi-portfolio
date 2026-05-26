'use client'

import { useEffect, useRef } from 'react'
import { SiFigma, SiHtml5 } from 'react-icons/si'

/* ─── icon definitions ───────────────────────────────────────────────────── */
// lx/ly = desktop positions (% of hero)
// mx/my = mobile positions (% of hero)
// Adobe icons use an inline badge (colored bg + abbreviation letters)
// kf: [dx1, dy1, rot1, dx2, dy2, rot2] for the float keyframe
const ICONS: {
  id: string
  label: string
  lx: string; ly: string
  mx: string; my: string
  dur: number; delay: number
  kf: number[]
  render: () => React.ReactNode
}[] = [
  {
    id: 'fi-ai',
    label: 'Illustrator',
    lx: '8%',   ly: '36%',
    mx: '12%',  my: '7%',
    dur: 6.2,   delay: 0,
    kf: [8, -10, 4, -6, 9, -3],
    render: () => (
      <span style={{
        fontFamily: 'inherit', fontWeight: 800, fontSize: 13,
        letterSpacing: '-0.03em', color: '#FF9A00',
      }}>Ai</span>
    ),
  },
  {
    id: 'fi-ps',
    label: 'Photoshop',
    lx: '10%',  ly: '60%',
    mx: '47%',  my: '5%',
    dur: 5.8,   delay: 1.1,
    kf: [-9, -8, -3, 7, 10, 4],
    render: () => (
      <span style={{
        fontFamily: 'inherit', fontWeight: 800, fontSize: 13,
        letterSpacing: '-0.03em', color: '#31A8FF',
      }}>Ps</span>
    ),
  },
  {
    id: 'fi-ae',
    label: 'After Effects',
    lx: '84%',  ly: '32%',
    mx: '80%',  my: '7%',
    dur: 7.1,   delay: 0.5,
    kf: [6, -12, -4, -8, 7, 3],
    render: () => (
      <span style={{
        fontFamily: 'inherit', fontWeight: 800, fontSize: 13,
        letterSpacing: '-0.03em', color: '#9999FF',
      }}>Ae</span>
    ),
  },
  {
    id: 'fi-figma',
    label: 'Figma',
    lx: '87%',  ly: '55%',
    mx: '25%',  my: '87%',
    dur: 6.5,   delay: 2.0,
    kf: [-7, -9, 3, 9, -7, -4],
    render: () => <SiFigma size={24} color="#F24E1E" />,
  },
  {
    id: 'fi-html',
    label: 'HTML5',
    lx: '83%',  ly: '73%',
    mx: '68%',  my: '85%',
    dur: 5.4,   delay: 1.6,
    kf: [10, 8, -3, -7, -10, 4],
    render: () => <SiHtml5 size={24} color="#E34F26" />,
  },
]

export default function FloatingIcons() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Drag logic
    let active: {
      el: HTMLElement
      startElX: number; startElY: number
      startMX: number;  startMY: number
    } | null = null

    function onDown(e: MouseEvent | TouchEvent) {
      const target = (e.target as HTMLElement).closest<HTMLElement>('.floating-icon')
      if (!target) return
      e.preventDefault()

      const pt = 'touches' in e ? e.touches[0] : e
      const elLeft = parseFloat(target.style.left)
      const elTop  = parseFloat(target.style.top)

      // Only valid if already positioned in px (after initPos)
      if (isNaN(elLeft)) return

      active = {
        el: target,
        startElX: elLeft, startElY: elTop,
        startMX: pt.clientX, startMY: pt.clientY,
      }

      target.style.animationPlayState = 'paused'
      target.style.zIndex = '60'
      target.classList.add('fi-grabbed')
    }

    function onMove(e: MouseEvent | TouchEvent) {
      if (!active) return
      const pt = 'touches' in e ? e.touches[0] : e
      const dx = pt.clientX - active.startMX
      const dy = pt.clientY - active.startMY
      active.el.style.left = (active.startElX + dx) + 'px'
      active.el.style.top  = (active.startElY + dy) + 'px'
    }

    function onUp() {
      if (!active) return
      active.el.style.animationPlayState = 'running'
      active.el.style.zIndex = ''
      active.el.classList.remove('fi-grabbed')
      active = null
    }

    // Convert % → px for all icons so drag math works
    function initPositions() {
      const c = containerRef.current
      if (!c) return
      const isMob = window.innerWidth < 768
      const cw = c.offsetWidth
      const ch = c.offsetHeight
      ICONS.forEach(({ id, lx, ly, mx, my }) => {
        const el = c.querySelector<HTMLElement>(`#${id}`)
        if (!el) return
        const xPct = parseFloat(isMob ? mx : lx) / 100
        const yPct = parseFloat(isMob ? my : ly) / 100
        el.style.left = (cw * xPct) + 'px'
        el.style.top  = (ch * yPct) + 'px'
      })
    }

    document.fonts.ready.then(initPositions)
    setTimeout(initPositions, 100)
    window.addEventListener('resize', initPositions)

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup',   onUp)
    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('touchend',  onUp)
    container.addEventListener('mousedown',  onDown)
    container.addEventListener('touchstart', onDown, { passive: false })

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup',   onUp)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend',  onUp)
      window.removeEventListener('resize',    initPositions)
    }
  }, [])

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 5 }}>
      {ICONS.map(({ id, label, dur, delay, render }) => (
        <div
          key={id}
          id={id}
          className="floating-icon"
          title={label}
          style={{
            position: 'absolute',
            width: 56, height: 56,
            borderRadius: 14,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.09)',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'grab',
            userSelect: 'none',
            pointerEvents: 'auto',
            animation: `float-${id} ${dur}s ease-in-out infinite ${delay}s`,
            animationPlayState: 'running',
            willChange: 'transform',
            transition: 'box-shadow 0.2s, border-color 0.2s',
          }}
        >
          {render()}

          {/* Tooltip label */}
          <span style={{
            position: 'absolute',
            bottom: 'calc(100% + 7px)',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(1,25,16,0.92)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.03em',
            padding: '4px 9px',
            borderRadius: 5,
            whiteSpace: 'nowrap',
            opacity: 0,
            pointerEvents: 'none',
            transition: 'opacity 0.15s',
          }}
          className="fi-tooltip"
          >
            {label}
          </span>
        </div>
      ))}

      <style>{`
        .floating-icon:hover .fi-tooltip,
        .fi-grabbed .fi-tooltip { opacity: 1 !important; }

        .fi-grabbed {
          cursor: grabbing !important;
          box-shadow: 0 16px 40px rgba(0,0,0,0.45) !important;
          border-color: rgba(255,255,255,0.18) !important;
        }

        ${ICONS.map(({ id, kf }) => `
          @keyframes float-${id} {
            0%,100% { transform: translate(0px, 0px) rotate(0deg) }
            33%      { transform: translate(${kf[0]}px, ${kf[1]}px) rotate(${kf[2]}deg) }
            66%      { transform: translate(${kf[3]}px, ${kf[4]}px) rotate(${kf[5]}deg) }
          }
        `).join('')}
      `}</style>
    </div>
  )
}
