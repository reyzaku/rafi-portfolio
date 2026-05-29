'use client'

import { useState } from 'react'
import { Project, PROJECTS } from '@/lib/work-data'
import ProjectCanvas from './ProjectCanvas'

export default function WorkMobile() {
  const [active, setActive] = useState<Project | null>(null)

  if (active) {
    return (
      <div style={{ position: 'relative', zIndex: 10 }}>
        <button
          onClick={() => setActive(null)}
          style={{
            position: 'fixed', top: 72, left: 16, zIndex: 20,
            background: 'rgba(10,25,18,0.92)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 6, padding: '8px 14px',
            color: '#fff', fontSize: 12, fontWeight: 600,
            letterSpacing: '0.5px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          ← Back
        </button>
        <ProjectCanvas project={active} />
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', zIndex: 10, paddingTop: 100, paddingBottom: 60, paddingLeft: 24, paddingRight: 24 }}>
      <div style={{ marginBottom: 48 }}>
        <p style={{
          fontSize: 11, fontWeight: 700, letterSpacing: '5px',
          color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginBottom: 12,
        }}>Selected Work</p>
        <h1 style={{
          fontSize: 'clamp(40px, 10vw, 64px)', fontWeight: 700,
          letterSpacing: '-0.04em', color: '#fff', lineHeight: 1,
        }}>My Work</h1>
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        {PROJECTS.map((project, i) => (
          <div
            key={project.id}
            role="button"
            onClick={() => setActive(project)}
            style={{
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              padding: '24px 0',
              display: 'flex', alignItems: 'center', gap: 16,
            }}
          >
            {/* Accent dot */}
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: project.accent, flexShrink: 0 }} />

            <span style={{
              fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.25)',
              letterSpacing: '2px', minWidth: 24,
            }}>
              {String(i + 1).padStart(2, '0')}
            </span>

            <p style={{
              flex: 1, fontSize: 17, fontWeight: 600,
              letterSpacing: '-0.02em', color: '#fff',
            }}>
              {project.title}
            </p>

            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>
              {project.year}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
