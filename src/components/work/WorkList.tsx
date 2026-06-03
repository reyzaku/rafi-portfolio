'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { PROJECTS, Project } from '@/lib/work-data'
import ProjectCanvas from './ProjectCanvas'
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
  const [activeProject, setActiveProject]   = useState<Project | null>(null)
  const [hoveredId,     setHoveredId]       = useState<string | null>(null)

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

  // ── Canvas / detail view ───────────────────────────────────────────────
  if (activeProject) {
    return (
      <>
        <button
          onClick={() => setActiveProject(null)}
          style={{
            position: 'fixed', top: 80, left: 20, zIndex: 9999,
            background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.14)',
            borderRadius: 100, padding: '7px 18px',
            color: 'rgba(255,255,255,0.8)', cursor: 'pointer',
            fontSize: 12, fontWeight: 600, letterSpacing: '0.04em',
            fontFamily: 'inherit',
            transition: 'color 0.15s, border-color 0.15s',
          }}
          onMouseEnter={e => { const el = e.currentTarget; el.style.color = '#fff'; el.style.borderColor = 'rgba(255,255,255,0.4)' }}
          onMouseLeave={e => { const el = e.currentTarget; el.style.color = 'rgba(255,255,255,0.8)'; el.style.borderColor = 'rgba(255,255,255,0.14)' }}
        >
          ← Back
        </button>
        <div style={{ position: 'relative', zIndex: 10 }}>
          <ProjectCanvas project={activeProject} />
        </div>
      </>
    )
  }

  // ── List view ──────────────────────────────────────────────────────────
  const hoveredProject = hoveredId ? PROJECTS.find(p => p.id === hoveredId) ?? null : null
  const H_PAD = 'max(48px, 11vw)'

  return (
    <>
      <div style={{
        position: 'relative',
        zIndex: 10,
        paddingTop: 160,
        paddingBottom: 160,
        paddingLeft: H_PAD,
        paddingRight: H_PAD,
      }}>

        {/* ── Header ── */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 20,
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
        <div style={{ height: 1, background: 'rgba(255,255,255,0.1)' }} />

        {/* ── Rows ── */}
        {PROJECTS.map((project, i) => {
          const isHovered = hoveredId === project.id
          return (
            <div key={project.id}>
              <div
                onMouseEnter={() => setHoveredId(project.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => setActiveProject(project)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 24,
                  padding: '24px 0',
                  cursor: 'pointer',
                  background: isHovered ? '#fff' : 'transparent',
                  // Bleed the white bg outside the container padding
                  marginLeft:  isHovered ? `calc(-1 * ${H_PAD})` : 0,
                  marginRight: isHovered ? `calc(-1 * ${H_PAD})` : 0,
                  paddingLeft:  isHovered ? H_PAD : 0,
                  paddingRight: isHovered ? H_PAD : 0,
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
                    fontSize: 11, letterSpacing: '1.5px',
                    color: isHovered ? 'rgba(0,0,0,0.38)' : 'rgba(255,255,255,0.28)',
                    marginTop: 9, textTransform: 'uppercase',
                    transition: 'color 0.18s',
                  }}>
                    {project.tags.join(' · ')}
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

              {/* Row divider */}
              <div style={{
                height: 1,
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
          // Scale up from 0 on hover, spring back to 0 on exit
          opacity: hoveredId ? 1 : 0,
          transform: hoveredId ? 'rotate(-3deg) scale(1)' : 'rotate(-3deg) scale(0)',
          transition: hoveredId
            ? 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.15s ease'
            : 'transform 0.2s cubic-bezier(0.4, 0, 1, 1), opacity 0.15s ease',
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
        {hoveredProject && (
          <div style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 100%)`,
            borderTop: `3px solid ${hoveredProject.accent}`,
          }}>
            {/* Accent glow blob */}
            <div style={{
              position: 'absolute', right: -20, top: -20,
              width: 120, height: 120, borderRadius: '50%',
              background: hoveredProject.accent,
              opacity: 0.15,
              filter: 'blur(30px)',
            }} />

            {/* Content */}
            <div style={{ position: 'absolute', inset: 0, padding: '14px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{
                  fontSize: 9, letterSpacing: '2px',
                  color: hoveredProject.accent, textTransform: 'uppercase',
                  fontFamily: 'monospace', fontWeight: 700,
                }}>
                  {hoveredProject.tags[0]}
                </div>
                <div style={{
                  fontSize: 15, fontWeight: 700, color: '#fff',
                  marginTop: 5, letterSpacing: '-0.02em', lineHeight: 1.2,
                  textTransform: 'uppercase',
                }}>
                  {hoveredProject.title}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{
                  fontSize: 10, color: 'rgba(255,255,255,0.35)',
                  letterSpacing: '1px', fontFamily: 'monospace',
                }}>
                  {hoveredProject.year}
                </span>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: `${hoveredProject.accent}22`,
                  border: `1px solid ${hoveredProject.accent}55`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: 12, color: hoveredProject.accent }}>↗</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
