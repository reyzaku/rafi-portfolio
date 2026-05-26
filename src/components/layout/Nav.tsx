'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import {
  Squares2X2Icon,
  BriefcaseIcon,
  UserIcon,
  PhoneIcon,
} from '@heroicons/react/24/solid'

// ── Config ────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: 'home',    label: 'Home',     icon: Squares2X2Icon },
  { id: 'work',    label: 'My Work',  icon: BriefcaseIcon  },
  { id: 'about',   label: 'About Me', icon: UserIcon       },
  { id: 'contact', label: 'Contact',  icon: PhoneIcon      },
] as const

type NavId = (typeof NAV_ITEMS)[number]['id']

// ── NavIcon ───────────────────────────────────────────────────────────

function NavIcon({
  item,
  isActive,
  isHovered,
  onHoverIn,
  onHoverOut,
  onClick,
}: {
  item: (typeof NAV_ITEMS)[number]
  isActive: boolean
  isHovered: boolean
  onHoverIn: () => void
  onHoverOut: () => void
  onClick: () => void
}) {
  const Icon = item.icon
  const lit  = isHovered

  return (
    <motion.button
      aria-label={item.label}
      onClick={onClick}
      onMouseEnter={onHoverIn}
      onMouseLeave={onHoverOut}
      onTouchStart={onHoverIn}
      onTouchEnd={onHoverOut}
      // Exact Figma size: 54×54px
      className="relative flex size-[54px] items-center justify-center cursor-pointer rounded-full outline-none"
    >
      {/* Background circle */}
      <motion.span
        className="absolute inset-0 rounded-full"
        animate={{ backgroundColor: lit ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0)' }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
      />
      {/* Icon: color transitions to green on hover */}
      <motion.span
        className="relative z-10 size-[18px] flex items-center justify-center"
        animate={{ color: lit ? '#5CFF85' : '#ffffff' }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
      >
        <Icon className="size-full" />
      </motion.span>
    </motion.button>
  )
}

// ── NavPill ───────────────────────────────────────────────────────────

function NavPill({
  hoveredId,
  activeId,
  onHoverIn,
  onHoverOut,
  onClick,
}: {
  hoveredId: NavId | null
  activeId: NavId
  onHoverIn: (id: NavId) => void
  onHoverOut: () => void
  onClick: (id: NavId) => void
}) {
  return (
    // Exact Figma: w-299px h-66px rounded-100px bg-white/15 backdrop-blur-7.5px
    <div className="flex w-[299px] h-[66px] items-center justify-center gap-[4px] rounded-[100px] bg-[rgba(255,255,255,0.15)] backdrop-blur-[7.5px]">
      {NAV_ITEMS.map(item => (
        <NavIcon
          key={item.id}
          item={item}
          isActive={activeId === item.id}
          isHovered={hoveredId === item.id}
          onHoverIn={() => onHoverIn(item.id)}
          onHoverOut={onHoverOut}
          onClick={() => onClick(item.id)}
        />
      ))}
    </div>
  )
}

// ── Tooltip ───────────────────────────────────────────────────────────

function Tooltip({ label, fromTop = true }: { label: string; fromTop?: boolean }) {
  return (
    <div className="h-[20px] flex items-center justify-center">
      <AnimatePresence mode="wait">
        {label && (
          <motion.p
            key={label}
            initial={{ opacity: 0, y: fromTop ? -6 : 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: fromTop ? -4 : 4 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            // Exact Figma: font-bold text-[14px] tracking-[4.06px]
            className="text-[14px] font-bold text-white tracking-[4px] whitespace-nowrap select-none"
          >
            {label.toUpperCase()}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── ContactButton ─────────────────────────────────────────────────────

function ContactButton() {
  return (
    <motion.a
      href="#contact"
      // Exact Figma: w-159px h-48px rounded-100px bg-white/15 backdrop-blur-7.5px
      className="relative flex w-[159px] h-[66px] rounded-[100px] bg-[rgba(255,255,255,0.15)] backdrop-blur-[7.5px] overflow-hidden cursor-pointer"
      initial="rest"
      whileHover="hover"
      animate="rest"
    >
      {/* Green arrow circle — 48px circle with 9px margin inside 66px container */}
      <motion.div
        className="absolute left-[9px] top-[9px] size-[48px]"
        variants={{
          rest:  { x: 0 },
          hover: { x: 93 },
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/nav-arrow.svg" alt="" className="size-full" />
      </motion.div>

      {/* "Let's Talk" text — vertically centered, slides left on hover */}
      <motion.span
        className="absolute left-[70px] top-[25px] text-white text-[16px] font-normal leading-none tracking-[-0.04em] whitespace-nowrap"
        variants={{
          rest:  { x: 0 },
          hover: { x: -34 },
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        Let&apos;s Talk
      </motion.span>
    </motion.a>
  )
}

// ── Nav ───────────────────────────────────────────────────────────────

export default function Nav() {
  const [hoveredId, setHoveredId] = useState<NavId | null>(null)
  const [activeId, setActiveId]   = useState<NavId>('home')

  const tooltipLabel = hoveredId
    ? (NAV_ITEMS.find(i => i.id === hoveredId)?.label ?? '')
    : ''

  return (
    <>
      {/* ══ DESKTOP ═══════════════════════════════════════════════════ */}
      <div className="hidden md:block">
        {/* Logo — exact Figma: left:50px top:46.5px size:47px */}
        <div className="fixed left-[50px] top-[66px] z-50 size-[47px]">
          <Image src="/logo-green.png" alt="Rafi" fill className="object-contain" priority />
        </div>

        {/* Pill centered + tooltip below */}
        <div className="fixed top-[57px] left-1/2 -translate-x-1/2 z-50 flex flex-col items-center">
          <NavPill
            hoveredId={hoveredId}
            activeId={activeId}
            onHoverIn={id => setHoveredId(id)}
            onHoverOut={() => setHoveredId(null)}
            onClick={id => setActiveId(id)}
          />
          {/* Tooltip slot — desktop: top-[115px] in Figma = 37+66+12 */}
          <div style={{ marginTop: '32px' }}>
            <Tooltip label={tooltipLabel} fromTop={true} />
          </div>
        </div>

        {/* Let's Talk — exact Figma: top:47px, ~50px from right */}
        <div className="fixed top-[67px] right-[50px] z-50">
          <ContactButton />
        </div>
      </div>

      {/* ══ MOBILE ════════════════════════════════════════════════════ */}
      <div className="md:hidden">
        {/* Top bar: logo left, contact right — exact Figma: px-25px pt-47px */}
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-[25px] pt-[67px]">
          <div className="relative size-[47px]">
            <Image src="/logo-green.png" alt="Rafi" fill className="object-contain" priority />
          </div>
          <ContactButton />
        </div>

        {/* Bottom: tooltip above pill, pill at bottom-24px */}
        <div className="fixed bottom-[24px] left-1/2 -translate-x-1/2 z-50 flex flex-col items-center" style={{ gap: '16px' }}>
          <Tooltip label={tooltipLabel} fromTop={false} />
          <NavPill
            hoveredId={hoveredId}
            activeId={activeId}
            onHoverIn={id => setHoveredId(id)}
            onHoverOut={() => setHoveredId(null)}
            onClick={id => setActiveId(id)}
          />
        </div>
      </div>
    </>
  )
}
