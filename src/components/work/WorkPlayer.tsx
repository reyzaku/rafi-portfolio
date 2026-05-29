'use client'

import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react'
import { Project, PROJECTS } from '@/lib/work-data'
import ProjectCard, { CARD_W, CARD_H } from './ProjectCard'
import ProjectCanvas from './ProjectCanvas'
import WorkMobile from './WorkMobile'

// Scatter layout — dx/dy offsets from deck center, rotation in degrees
const SCATTER: { dx: number; dy: number; rot: number }[] = [
  { dx: -310, dy:  25, rot: -7  },
  { dx: -160, dy: -30, rot: -3  },
  { dx:  -20, dy:  18, rot:  1  },
  { dx:  110, dy: -22, rot:  4  },
  { dx: -235, dy:  65, rot: -5  },
  { dx:   45, dy: -52, rot:  6  },
  { dx:  210, dy:  28, rot: -2  },
  { dx:  305, dy: -32, rot:  5  },
]

function easeOutBack(t: number): number {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}

export default function WorkPlayer() {
  // ── Detect mobile / touch ──────────────────────────────────────────────
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.matchMedia('(pointer: coarse), (max-width: 767px)').matches)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // ── Main state ────────────────────────────────────────────────────────
  type Mode = 'deck' | 'booting' | 'playing'
  const [mode, setMode]                 = useState<Mode>('deck')
  const [activeProject, setActiveProject] = useState<Project | null>(null)
  const [slotArmed, setSlotArmed]       = useState(false)

  // ── Drag state (all via refs for perf; React state only for render) ───
  const [floatingProject, setFloatingProject] = useState<Project | null>(null)
  const [ghostId, setGhostId]           = useState<string | null>(null)
  const floatingRef  = useRef<HTMLDivElement>(null)
  const slotRef      = useRef<HTMLDivElement>(null)
  const dragData     = useRef<{
    project: Project
    originX: number
    originY: number
    offsetX: number
    offsetY: number
  } | null>(null)
  const isDragging   = useRef(false)

  // ── Card positions (absolute, relative to deck container) ─────────────
  const deckRef = useRef<HTMLDivElement>(null)
  const [cardPositions, setCardPositions] = useState<{ left: number; top: number; rot: number }[]>(
    SCATTER.map(() => ({ left: 0, top: 0, rot: 0 }))
  )

  function computeCardPositions() {
    const deck = deckRef.current
    if (!deck) return
    const r  = deck.getBoundingClientRect()
    const cx = r.width / 2
    const cy = r.height / 2
    setCardPositions(SCATTER.map(s => ({
      left: cx + s.dx - CARD_W / 2,
      top:  cy + s.dy - CARD_H / 2,
      rot:  s.rot,
    })))
  }

  useLayoutEffect(() => {
    computeCardPositions()
    window.addEventListener('resize', computeCardPositions)
    return () => window.removeEventListener('resize', computeCardPositions)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Drag helpers ──────────────────────────────────────────────────────
  function positionFloating(x: number, y: number) {
    if (floatingRef.current) {
      floatingRef.current.style.left = x + 'px'
      floatingRef.current.style.top  = y + 'px'
    }
  }

  function startDrag(project: Project, e: ReactMouseEvent, cardScreenRect: DOMRect) {
    const offsetX = e.clientX - cardScreenRect.left
    const offsetY = e.clientY - cardScreenRect.top

    dragData.current = {
      project,
      originX: cardScreenRect.left,
      originY: cardScreenRect.top,
      offsetX,
      offsetY,
    }
    isDragging.current = true
    setGhostId(project.id)
    setFloatingProject(project)

    if (floatingRef.current) {
      floatingRef.current.style.transition = 'none'
      floatingRef.current.style.opacity    = '1'
      floatingRef.current.style.transform  = 'none'
      positionFloating(cardScreenRect.left, cardScreenRect.top)
    }

    window.dispatchEvent(new CustomEvent('element-drag'))
  }

  function springBack() {
    const d  = dragData.current
    const fl = floatingRef.current
    if (!d || !fl) return

    const startX = parseFloat(fl.style.left) || d.originX
    const startY = parseFloat(fl.style.top)  || d.originY
    const endX   = d.originX
    const endY   = d.originY
    const dur    = 400
    const t0     = performance.now()

    function frame(now: number) {
      const t = Math.min(1, (now - t0) / dur)
      const ease = easeOutBack(t)
      if (fl) {
        fl.style.left = (startX + (endX - startX) * ease) + 'px'
        fl.style.top  = (startY + (endY - startY) * ease) + 'px'
      }
      if (t < 1) { requestAnimationFrame(frame); return }
      // done
      if (fl) fl.style.opacity = '0'
      isDragging.current  = false
      dragData.current    = null
      setFloatingProject(null)
      setGhostId(null)
      setSlotArmed(false)
    }
    requestAnimationFrame(frame)
  }

  function seatAndBoot(project: Project) {
    const fl   = floatingRef.current
    const slot = slotRef.current
    if (fl && slot) {
      const sr = slot.getBoundingClientRect()
      fl.style.transition = 'left 0.2s ease-in, top 0.2s ease-in, transform 0.2s ease-in, opacity 0.15s ease-in 0.1s'
      fl.style.left      = (sr.left + sr.width / 2  - CARD_W / 2) + 'px'
      fl.style.top       = (sr.top  + sr.height / 2 - CARD_H / 2) + 'px'
      fl.style.transform = 'scale(0.25)'
      fl.style.opacity   = '0'
    }

    isDragging.current = false
    dragData.current   = null
    setGhostId(null)
    setSlotArmed(false)

    // No boot overlay — go straight to playing; canvas elements pop in themselves
    setTimeout(() => {
      setFloatingProject(null)
      setActiveProject(project)
      setMode('playing')
      window.dispatchEvent(new CustomEvent('work-boot-start'))
      setTimeout(() => window.dispatchEvent(new CustomEvent('work-boot-done')), 800)
    }, 220)
  }

  function handleEject() {
    setMode('deck')
    setActiveProject(null)
    // Re-measure after deck re-mounts
    requestAnimationFrame(computeCardPositions)
  }

  function handleTrayCardMouseDown(project: Project, e: ReactMouseEvent) {
    const target = e.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()
    startDrag(project, e, rect)
  }

  // ── Global mouse handlers for drag ───────────────────────────────────
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isDragging.current || !dragData.current) return
      const d = dragData.current
      const x = e.clientX - d.offsetX
      const y = e.clientY - d.offsetY
      positionFloating(x, y)

      // Check if over slot → arm it
      const slot = slotRef.current
      if (slot) {
        const sr = slot.getBoundingClientRect()
        const armed = (
          e.clientX >= sr.left - 20 && e.clientX <= sr.right  + 20 &&
          e.clientY >= sr.top  - 20 && e.clientY <= sr.bottom + 20
        )
        setSlotArmed(armed)
      }
    }

    const onUp = (e: MouseEvent) => {
      if (!isDragging.current || !dragData.current) return

      const slot = slotRef.current
      if (slot) {
        const sr = slot.getBoundingClientRect()
        const over = (
          e.clientX >= sr.left && e.clientX <= sr.right &&
          e.clientY >= sr.top  && e.clientY <= sr.bottom
        )
        if (over) { seatAndBoot(dragData.current.project); return }
      }
      springBack()
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Render ────────────────────────────────────────────────────────────
  if (isMobile) return <WorkMobile />

  const remainingProjects = PROJECTS.filter(p => p.id !== activeProject?.id)

  return (
    <>
      {/* ─── State 1: DECK ─────────────────────────────────────── */}
      {mode === 'deck' && (
        <div
          ref={deckRef}
          style={{
            position: 'relative', zIndex: 10,
            width: '100%', height: '100vh',
          }}
        >
          {/* Deck hint */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            marginTop: CARD_H / 2 + 32,
            fontFamily: 'monospace', fontSize: 11,
            color: 'rgba(255,255,255,0.2)', letterSpacing: '3px', textTransform: 'uppercase',
            whiteSpace: 'nowrap', pointerEvents: 'none',
            animation: 'deck-pulse 3s ease-in-out infinite',
          }}>
            drag a card into the player
          </div>

          {PROJECTS.map((project, i) => {
            const pos = cardPositions[i] || { left: 0, top: 0, rot: 0 }
            return (
              <div
                key={project.id}
                style={{
                  position: 'absolute',
                  left: pos.left,
                  top:  pos.top,
                  transform: `rotate(${pos.rot}deg)`,
                  zIndex: ghostId === project.id ? 0 : 10 - i,
                  transition: 'transform 0.2s ease',
                }}
              >
                <ProjectCard
                  project={project}
                  index={i}
                  ghost={ghostId === project.id}
                  onMouseDown={e => {
                    e.preventDefault()
                    const el = e.currentTarget as HTMLElement
                    startDrag(project, e, el.getBoundingClientRect())
                  }}
                />
              </div>
            )
          })}
        </div>
      )}

      {/* ─── State 2: PLAYING ──────────────────────────────────── */}
      {mode === 'playing' && activeProject && (
        <div style={{ position: 'relative', zIndex: 10 }}>
          <ProjectCanvas project={activeProject} />
        </div>
      )}

      {/* ─── Player Slot / Dock — always visible (desktop) ─────── */}
      <PlayerSlot
        mode={mode === 'deck' ? (slotArmed ? 'armed' : 'empty') : 'dock'}
        activeProject={activeProject}
        remainingProjects={remainingProjects}
        slotRef={slotRef}
        onEject={handleEject}
        onTrayCardMouseDown={handleTrayCardMouseDown}
        ghostId={ghostId}
      />

      {/* ─── Floating drag card ─────────────────────────────────── */}
      <div
        ref={floatingRef}
        style={{
          position: 'fixed', zIndex: 99990,
          pointerEvents: 'none',
          opacity: 0,
          transform: 'none',
          willChange: 'left, top',
        }}
      >
        {floatingProject && (
          <ProjectCard
            project={floatingProject}
            index={PROJECTS.findIndex(p => p.id === floatingProject.id)}
            style={{ cursor: 'grabbing', boxShadow: '0 24px 60px rgba(0,0,0,0.7)' }}
          />
        )}
      </div>

      <style>{`
        @keyframes deck-pulse {
          0%,100% { opacity: 0.2 }
          50%      { opacity: 0.5 }
        }
      `}</style>
    </>
  )
}

// ── PlayerSlot (co-located — small enough to keep here) ─────────────────

interface SlotProps {
  mode: 'empty' | 'armed' | 'dock'
  activeProject: Project | null
  remainingProjects: Project[]
  slotRef: { current: HTMLDivElement | null }
  onEject: () => void
  onTrayCardMouseDown: (project: Project, e: ReactMouseEvent) => void
  ghostId: string | null
}

function PlayerSlot({ mode, activeProject, remainingProjects, slotRef, onEject, onTrayCardMouseDown, ghostId }: SlotProps) {
  const [playerOpen, setPlayerOpen] = useState(true)
  const [queueOpen,  setQueueOpen]  = useState(true)

  const isArmed = mode === 'armed'
  const isDock  = mode === 'dock'

  // Panel width snugly wraps the card slot (card width + 24px padding each side)
  const PANEL_W = CARD_W + 24

  // Shared panel chrome
  const panel: React.CSSProperties = {
    background: 'rgba(10,25,18,0.92)',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: 10,
    backdropFilter: 'blur(16px)',
    overflow: 'hidden',
    width: PANEL_W,
  }

  // Section header row
  function SectionHeader({ label, open, onToggle }: { label: string; open: boolean; onToggle: () => void }) {
    return (
      <button
        onClick={onToggle}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          background: 'transparent', border: 'none',
          padding: '9px 12px', cursor: 'pointer',
          borderBottom: open ? '1px solid rgba(255,255,255,0.07)' : 'none',
        }}
      >
        <span style={{
          fontSize: 9, fontWeight: 700, letterSpacing: '2px',
          color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase',
          fontFamily: 'monospace',
        }}>{label}</span>
        <span style={{
          fontSize: 9, color: 'rgba(255,255,255,0.2)',
          fontFamily: 'monospace', fontWeight: 700,
        }}>{open ? '▲' : '▼'}</span>
      </button>
    )
  }

  return (
    <div style={{
      position: 'fixed', right: 32, bottom: 32, zIndex: 9000,
      display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8,
    }}>

      {/* ── PLAYER panel (always present) ── */}
      <div style={panel}>
        <SectionHeader
          label={isDock ? `Player — ${activeProject?.title ?? ''}` : 'Player'}
          open={playerOpen}
          onToggle={() => setPlayerOpen(o => !o)}
        />

        {playerOpen && (
          <div style={{ padding: 12 }}>
            {/* ── Slot drop target — exact card dimensions ── */}
            <div
              ref={slotRef}
              style={{
                width: CARD_W,
                height: CARD_H,
                borderRadius: 8,
                border: isDock
                  ? `1.5px solid ${activeProject?.accent ?? 'rgba(92,255,133,0.6)'}44`
                  : isArmed
                    ? '1.5px solid rgba(92,255,133,0.85)'
                    : '1.5px dashed rgba(255,255,255,0.14)',
                background: isDock
                  ? 'transparent'
                  : isArmed
                    ? 'rgba(92,255,133,0.06)'
                    : 'rgba(255,255,255,0.02)',
                boxShadow: isDock
                  ? `0 0 28px ${activeProject?.accent ?? '#5CFF85'}22`
                  : isArmed
                    ? '0 0 22px rgba(92,255,133,0.2)'
                    : 'none',
                transition: 'border-color 0.18s, background 0.18s, box-shadow 0.18s',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {/* Empty / armed state */}
              {!isDock && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                  <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                    <path d="M8 3v7M5 7l3 3 3-3" stroke={isArmed ? 'rgba(92,255,133,0.9)' : 'rgba(255,255,255,0.2)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M3 13h10" stroke={isArmed ? 'rgba(92,255,133,0.9)' : 'rgba(255,255,255,0.2)'} strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <span style={{
                    fontSize: 9, fontWeight: 700, letterSpacing: '2px',
                    color: isArmed ? 'rgba(92,255,133,0.8)' : 'rgba(255,255,255,0.16)',
                    textTransform: 'uppercase', fontFamily: 'monospace',
                    transition: 'color 0.18s', textAlign: 'center',
                  }}>
                    {isArmed ? 'Release\nto load' : 'Drop card\nhere'}
                  </span>
                </div>
              )}

              {/* Dock state — actual card seated in slot */}
              {isDock && activeProject && (
                <div style={{ pointerEvents: 'none', userSelect: 'none' }}>
                  <ProjectCard
                    project={activeProject}
                    index={PROJECTS.findIndex(p => p.id === activeProject.id)}
                  />
                  {/* Swap overlay hint */}
                  {isArmed && (
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'rgba(92,255,133,0.12)',
                      border: '1.5px solid rgba(92,255,133,0.85)',
                      borderRadius: 8,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{
                        fontSize: 9, fontWeight: 700, letterSpacing: '2px',
                        color: 'rgba(92,255,133,0.9)', textTransform: 'uppercase',
                        fontFamily: 'monospace',
                      }}>Release to swap</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Eject row — dock only */}
            {isDock && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                <button
                  onClick={onEject}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.13)',
                    borderRadius: 5, padding: '4px 10px',
                    color: 'rgba(255,255,255,0.4)', fontSize: 10,
                    fontWeight: 600, letterSpacing: '1px',
                    cursor: 'pointer', fontFamily: 'inherit',
                    textTransform: 'uppercase',
                    transition: 'border-color 0.15s, color 0.15s',
                  }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = 'rgba(255,255,255,0.35)'; el.style.color = '#fff' }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = 'rgba(255,255,255,0.13)'; el.style.color = 'rgba(255,255,255,0.4)' }}
                >
                  ⏏ Eject
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── QUEUE panel (dock mode only) ── */}
      {isDock && remainingProjects.length > 0 && (
        <div style={{ ...panel, width: 'max-content' }}>
          <SectionHeader label={`Queue — ${remainingProjects.length} left`} open={queueOpen} onToggle={() => setQueueOpen(o => !o)} />

          {queueOpen && (
            <div style={{
              display: 'flex', gap: 8, padding: 12,
            }}>
              {remainingProjects.map(project => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={PROJECTS.findIndex(p => p.id === project.id)}
                  size="mini"
                  ghost={ghostId === project.id}
                  onMouseDown={e => { e.preventDefault(); onTrayCardMouseDown(project, e) }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes dock-pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
    </div>
  )
}
