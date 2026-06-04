'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { PROJECTS, Project } from '@/lib/work-data'
import { navigateWithTransition } from '@/lib/page-transition'
import WorkMobile from './WorkMobile'

export default function WorkList() {
  // ── Mobile detection ───────────────────────────────────────────────────
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.matchMedia('(pointer: coarse), (max-width: 767px)').matches)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // ── State ──────────────────────────────────────────────────────────────
  const [hoveredId,        setHoveredId]        = useState<string | null>(null)
  // Thumbnail visibility is decoupled from hovered row so rapid switching
  // keeps the card alive instead of collapsing → re-expanding between rows
  const [thumbActive,      setThumbActive]      = useState(false)
  const [displayedProject, setDisplayedProject] = useState<Project | null>(null)
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleRowEnter = useCallback((project: Project) => {
    // Cancel any pending collapse
    if (exitTimerRef.current) { clearTimeout(exitTimerRef.current); exitTimerRef.current = null }
    setHoveredId(project.id)
    setDisplayedProject(project)   // swap content instantly (card stays at scale 1)
    setThumbActive(true)
  }, [])

  const handleRowLeave = useCallback(() => {
    setHoveredId(null)
    // Short grace period — if user enters another row within 80ms, cancel collapse
    exitTimerRef.current = setTimeout(() => {
      setThumbActive(false)
      exitTimerRef.current = null
    }, 80)
  }, [])

  // ── Cursor thumbnail — lerp follow for smooth lag effect ──────────────
  const thumbRef  = useRef<HTMLDivElement>(null)
  const rafRef    = useRef<number | null>(null)
  const targetPos = useRef({ x: -400, y: -400 })
  const curPos    = useRef({ x: -400, y: -400 })

  const onMouseMove = useCallback((e: MouseEvent) => {
    targetPos.current = { x: e.clientX, y: e.clientY }
  }, [])

  useEffect(() => {
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t

    function tick() {
      curPos.current.x = lerp(curPos.current.x, targetPos.current.x, 0.1)
      curPos.current.y = lerp(curPos.current.y, targetPos.current.y, 0.1)
      if (thumbRef.current) {
        thumbRef.current.style.left = (curPos.current.x + 28) + 'px'
        thumbRef.current.style.top  = (curPos.current.y - 90) + 'px'
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    window.addEventListener('mousemove', onMouseMove)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [onMouseMove])

  // ── Mobile ─────────────────────────────────────────────────────────────
  if (isMobile) return <WorkMobile />

  // ── List view ──────────────────────────────────────────────────────────
  const H_PAD = 'max(48px, 11vw)'

  return (
    <>
      {/* Outer wrapper — no horizontal padding so rows can go full width */}
      <div style={{ position: 'relative', zIndex: 10, paddingTop: 160, paddingBottom: 160 }}>

        {/* ── Header ── */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 20, paddingLeft: H_PAD, paddingRight: H_PAD,
        }}>
          <span style={{
            fontSize: 11, color: 'rgba(255,255,255,0.35)',
            letterSpacing: '4px', fontFamily: 'monospace', textTransform: 'uppercase',
          }}>
            /MY WORK
          </span>
          <span style={{
            fontSize: 11, color: 'rgba(255,255,255,0.2)',
            letterSpacing: '2.5px', fontFamily: 'monospace',
          }}>
            {PROJECTS.length} PROJECTS
          </span>
        </div>

        {/* ── Top divider ── */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', marginLeft: H_PAD, marginRight: H_PAD }} />

        {/* ── Rows ── */}
        {PROJECTS.map((project, i) => {
          const isHovered = hoveredId === project.id
          return (
            <div key={project.id}>
              {/* Row is full-width; content is padded internally */}
              <div
                onMouseEnter={() => handleRowEnter(project)}
                onMouseLeave={() => handleRowLeave()}
                onClick={() => navigateWithTransition(`/work/${project.id}`)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 24,
                  paddingTop: 24, paddingBottom: 24,
                  paddingLeft: H_PAD, paddingRight: H_PAD,
                  cursor: 'pointer',
                  background: isHovered ? '#fff' : 'transparent',
                  transition: 'background 0.18s ease',
                }}
              >
                {/* Index */}
                <span style={{
                  fontSize: 11, letterSpacing: '2px',
                  color: isHovered ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.2)',
                  fontFamily: 'monospace', minWidth: 28, paddingTop: 7,
                  flexShrink: 0,
                  transition: 'color 0.18s',
                }}>
                  {String(i + 1).padStart(2, '0')}
                </span>

                {/* Title + tags */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 'clamp(26px, 3.5vw, 48px)',
                    fontWeight: 700,
                    letterSpacing: '-0.03em',
                    lineHeight: 1,
                    color: isHovered ? '#000' : 'rgba(255,255,255,0.9)',
                    transition: 'color 0.18s',
                    textTransform: 'uppercase',
                  }}>
                    {project.title}
                  </div>
                  <div style={{
                    display: 'flex', flexWrap: 'wrap', gap: 8,
                    marginTop: 12,
                  }}>
                    {project.tags.map((tag) => (
                      <span key={tag} style={{
                        fontSize: 11, fontWeight: 600, letterSpacing: '0.5px',
                        color: '#0B3D1E',
                        background: '#5CFF85',
                        padding: '4px 12px', borderRadius: 100,
                        textTransform: 'uppercase', whiteSpace: 'nowrap',
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Year */}
                <span style={{
                  fontSize: 12, letterSpacing: '1px',
                  color: isHovered ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.2)',
                  paddingTop: 7, flexShrink: 0,
                  transition: 'color 0.18s',
                }}>
                  {project.year}
                </span>
              </div>

              {/* Row divider — stays within content margins */}
              <div style={{
                height: 1, marginLeft: H_PAD, marginRight: H_PAD,
                background: isHovered ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.08)',
                transition: 'background 0.18s',
              }} />
            </div>
          )
        })}
      </div>

      {/* ── Cursor thumbnail ── */}
      <div
        ref={thumbRef}
        style={{
          position: 'fixed',
          zIndex: 99999,
          pointerEvents: 'none',
          // Spring up on first hover, stay alive during rapid row switching,
          // collapse only when cursor truly leaves all rows
          opacity: thumbActive ? 1 : 0,
          transform: thumbActive ? 'rotate(-3deg) scale(1)' : 'rotate(-3deg) scale(0)',
          transition: thumbActive
            ? 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.15s ease'
            : 'transform 0.22s cubic-bezier(0.4, 0, 1, 1), opacity 0.2s ease',
          transformOrigin: 'left top',
          // Card shape
          width: 220,
          height: 140,
          borderRadius: 10,
          overflow: 'hidden',
          boxShadow: '0 20px 50px rgba(0,0,0,0.55)',
          // Initial off-screen position
          left: -300,
          top: -300,
          willChange: 'left, top',
        }}
      >
        {displayedProject && (
          <div style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 100%)`,
            borderTop: `3px solid ${displayedProject.accent}`,
          }}>
            {/* Accent glow blob */}
            <div style={{
              position: 'absolute', right: -20, top: -20,
              width: 120, height: 120, borderRadius: '50%',
              background: displayedProject.accent,
              opacity: 0.15,
              filter: 'blur(30px)',
            }} />

            {/* Content */}
            <div style={{ position: 'absolute', inset: 0, padding: '14px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{
                  fontSize: 9, letterSpacing: '2px',
                  color: displayedProject.accent, textTransform: 'uppercase',
                  fontFamily: 'monospace', fontWeight: 700,
                }}>
                  {displayedProject.tags[0]}
                </div>
                <div style={{
                  fontSize: 15, fontWeight: 700, color: '#fff',
                  marginTop: 5, letterSpacing: '-0.02em', lineHeight: 1.2,
                  textTransform: 'uppercase',
                }}>
                  {displayedProject.title}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{
                  fontSize: 10, color: 'rgba(255,255,255,0.35)',
                  letterSpacing: '1px', fontFamily: 'monospace',
                }}>
                  {displayedProject.year}
                </span>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: `${displayedProject.accent}22`,
                  border: `1px solid ${displayedProject.accent}55`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: 12, color: displayedProject.accent }}>↗</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
