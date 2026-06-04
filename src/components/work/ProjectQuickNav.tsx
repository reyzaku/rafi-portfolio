'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { PROJECTS } from '@/lib/work-data'
import { navigateWithTransition } from '@/lib/page-transition'

// Quick navigation between project detail pages.
// Same nav-pill language as the global Nav, but smaller and with numbers
// instead of icons. Desktop: floating bottom-center (horizontal).
// Mobile: floating right-side (vertical).
export default function ProjectQuickNav({ currentId }: { currentId: string }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  function go(id: string) {
    if (id === currentId) return
    navigateWithTransition(`/work/${id}`)
  }

  // Fresh element set per container so the two layouts stay independent.
  const renderButtons = () =>
    PROJECTS.map((p, i) => {
      const isActive  = p.id === currentId
      const isHovered = hoveredId === p.id
      const lit       = isActive || isHovered

      return (
        <motion.button
          key={p.id}
          aria-label={`Go to project ${i + 1}: ${p.title}`}
          title={p.title}
          aria-current={isActive ? 'page' : undefined}
          onClick={() => go(p.id)}
          onMouseEnter={() => setHoveredId(p.id)}
          onMouseLeave={() => setHoveredId(null)}
          onTouchStart={() => setHoveredId(p.id)}
          onTouchEnd={() => setHoveredId(null)}
          className="relative flex size-[40px] items-center justify-center cursor-pointer rounded-full outline-none"
        >
          {/* Background circle */}
          <motion.span
            className="absolute inset-0 rounded-full"
            animate={{ backgroundColor: lit ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0)' }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          />
          {/* Active ring */}
          <motion.span
            className="absolute inset-0 rounded-full"
            animate={{ boxShadow: isActive ? 'inset 0 0 0 1.5px #5CFF85' : 'inset 0 0 0 0px rgba(92,255,133,0)' }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          />
          {/* Number */}
          <motion.span
            className="relative z-10 text-[13px] font-bold leading-none tabular-nums tracking-[0.5px]"
            animate={{ color: lit ? '#5CFF85' : '#ffffff' }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            {String(i + 1).padStart(2, '0')}
          </motion.span>
        </motion.button>
      )
    })

  return (
    <>
      {/* ══ DESKTOP — bottom center, horizontal ══ */}
      <div className="hidden md:flex fixed bottom-[28px] left-1/2 -translate-x-1/2 z-50 flex-row items-center gap-[4px] rounded-[100px] bg-[rgba(255,255,255,0.15)] backdrop-blur-[7.5px] px-[8px] py-[5px]">
        {renderButtons()}
      </div>

      {/* ══ MOBILE — right side, vertical ══ */}
      <div className="md:hidden fixed right-[14px] top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-[4px] rounded-[100px] bg-[rgba(255,255,255,0.15)] backdrop-blur-[7.5px] px-[5px] py-[8px]">
        {renderButtons()}
      </div>
    </>
  )
}
