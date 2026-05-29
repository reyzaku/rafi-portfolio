'use client'

import { Project } from '@/lib/work-data'
import CanvasFrame from './CanvasFrame'

interface Props {
  project: Project
}

// Shared pop-in animation: scale 0 → 1 with a spring overshoot
const POP = 'canvas-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both'

export default function ProjectCanvas({ project }: Props) {
  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      paddingTop: 120,
      paddingBottom: 160,
      paddingLeft: 80,
      paddingRight: 80,
    }}>
      {/* Canvas header — each piece pops in sequentially */}
      <div style={{ marginBottom: 80 }}>
        {/* .fig label */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 4, padding: '6px 14px', marginBottom: 20,
          animation: POP, animationDelay: '0ms',
          transformOrigin: 'left center',
        }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
            <path d="M3 2h4l3 3v5a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="rgba(255,255,255,0.35)" strokeWidth="1.2" fill="none"/>
            <path d="M7 2v3h3" stroke="rgba(255,255,255,0.35)" strokeWidth="1.2" fill="none"/>
          </svg>
          <span style={{
            fontSize: 11, fontWeight: 600, letterSpacing: '1px',
            color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase',
            fontFamily: 'monospace',
          }}>
            {project.id}.fig
          </span>
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: 'clamp(32px, 5vw, 64px)', fontWeight: 700,
          letterSpacing: '-0.04em', color: '#fff', lineHeight: 1,
          animation: POP, animationDelay: '60ms',
          transformOrigin: 'left center',
        }}>
          {project.title}
        </h1>

        {/* Meta row */}
        <div style={{
          display: 'flex', gap: 12, marginTop: 16, alignItems: 'center',
          animation: POP, animationDelay: '120ms',
          transformOrigin: 'left center',
        }}>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.02em' }}>
            {project.year}
          </span>
          <span style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.15)' }} />
          {project.tags.map(tag => (
            <span key={tag} style={{
              fontSize: 11, fontWeight: 600, letterSpacing: '1px',
              color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase',
              border: '1px solid rgba(255,255,255,0.12)',
              padding: '3px 10px', borderRadius: 100,
            }}>{tag}</span>
          ))}
        </div>
      </div>

      {/* Frames — each pops in after the header, staggered */}
      <div style={{ position: 'relative' }}>
        {project.frames.map((frame, i) => (
          <CanvasFrame
            key={frame.name}
            frame={frame}
            index={i}
            accentColor={project.accent}
            popDelay={180 + i * 90}
          />
        ))}
      </div>

      {/* Footer */}
      <div style={{
        marginTop: 40, paddingTop: 24,
        borderTop: '1px solid rgba(255,255,255,0.06)',
        fontFamily: 'monospace', fontSize: 11,
        color: 'rgba(255,255,255,0.18)',
        letterSpacing: '0.03em',
        animation: POP,
        animationDelay: `${180 + project.frames.length * 90}ms`,
        transformOrigin: 'left center',
      }}>
        {project.frames.length} frames &nbsp;·&nbsp; {project.title} &nbsp;·&nbsp; {project.year}
      </div>

      <style>{`
        @keyframes canvas-pop {
          0%   { transform: scale(0);    opacity: 0; }
          100% { transform: scale(1);    opacity: 1; }
        }
      `}</style>
    </div>
  )
}
