'use client'

import { type CSSProperties, type MouseEvent as ReactMouseEvent } from 'react'
import { Project } from '@/lib/work-data'

export const CARD_W = 180
export const CARD_H = 240

interface Props {
  project: Project
  index: number
  size?: 'full' | 'mini'
  ghost?: boolean
  style?: CSSProperties
  onMouseDown?: (e: ReactMouseEvent<HTMLDivElement>) => void
}

export default function ProjectCard({ project, index, size = 'full', ghost = false, style, onMouseDown }: Props) {
  const isMini = size === 'mini'
  const w = isMini ? 80 : CARD_W
  const h = isMini ? 106 : CARD_H

  return (
    <div
      className="draggable"
      onMouseDown={onMouseDown}
      style={{
        width: w,
        height: h,
        background: 'rgba(10,25,18,0.96)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 8,
        overflow: 'hidden',
        userSelect: 'none',
        cursor: 'grab',
        opacity: ghost ? 0 : 1,
        flexShrink: 0,
        position: 'relative',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        ...style,
      }}
    >
      {/* Accent strip */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: isMini ? 3 : 5,
        background: project.accent,
      }} />

      <div style={{ padding: isMini ? '10px 8px 8px' : '16px 14px', display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* ID */}
        <span style={{
          fontSize: isMini ? 8 : 10, fontWeight: 700,
          letterSpacing: '2px', color: 'rgba(255,255,255,0.25)',
          textTransform: 'uppercase', marginTop: isMini ? 2 : 4,
        }}>
          {String(index + 1).padStart(2, '0')}
        </span>

        {/* Title */}
        <p style={{
          fontSize: isMini ? 10 : 15, fontWeight: 700,
          letterSpacing: '-0.02em', color: '#fff',
          lineHeight: 1.2, marginTop: isMini ? 4 : 10,
          flex: 1,
        }}>
          {project.title}
        </p>

        {/* Year */}
        <span style={{
          fontSize: isMini ? 8 : 11, color: 'rgba(255,255,255,0.3)',
          fontWeight: 500, letterSpacing: '0.03em',
        }}>
          {project.year}
        </span>

        {/* Tags — full size only */}
        {!isMini && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
            {project.tags.map(tag => (
              <span key={tag} style={{
                fontSize: 9, fontWeight: 600, letterSpacing: '0.5px',
                color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase',
                border: '1px solid rgba(255,255,255,0.12)',
                padding: '2px 6px', borderRadius: 100,
              }}>{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
