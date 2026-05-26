'use client'

import { useEffect, useRef, useState } from 'react'

const LABELS = {
  idle:    ['zoning out', 'lost tbh', 'just existing', 'thinking...', 'blank stare', 'idk anymore', 'hmm', 'figuring things out'],
  hover:   ['curious', 'tempted', 'maybe...', 'interested', 'ooh', 'should i?', 'do i dare', 'tell me more'],
  click:   ['let\'s go', 'aight', 'on it', 'done', 'ok ok', 'yep'],
  scroll:  ['exploring', 'looking for something', 'what\'s down here', 'keep going'],
  flee:    ['come back!', 'wait wait', 'i don\'t bite', 'why run', 'just saying hi', 'hey!!'],
  recover: ['i did nothing', 'ok my bad', 'sorry lol', 'i\'ll behave'],
  correct: ['ok my bad', 'sorry sorry', 'i was playing', 'i\'ll put it back', 'ok i get it', 'rafi pls'],
}

function pick(arr: string[]) { return arr[Math.floor(Math.random() * arr.length)] }

export default function CustomCursor() {
  const cursorRef   = useRef<HTMLDivElement>(null)
  const labelRef    = useRef<HTMLSpanElement>(null)
  const [visible, setVisible] = useState(false)
  const pos         = useRef({ x: -100, y: -100 })
  const raf         = useRef<number>(0)
  const idleTimer   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const revertTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const lbl = labelRef.current!

    function setLabel(text: string) {
      if (lbl) lbl.textContent = text
    }

    // Always revert to a fresh idle message — no more "guest"
    function revertToIdle(ms: number) {
      if (revertTimer.current) clearTimeout(revertTimer.current)
      revertTimer.current = setTimeout(() => setLabel(pick(LABELS.idle)), ms)
    }

    // Periodically refresh idle message while nothing is happening
    function resetIdleTimer() {
      if (idleTimer.current) clearTimeout(idleTimer.current)
      idleTimer.current = setTimeout(() => {
        setLabel(pick(LABELS.idle))
        resetIdleTimer()
      }, 4000)
    }

    // Movement
    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY }
      if (!visible) setVisible(true)
      resetIdleTimer()
    }

    // Hover interactive elements
    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      if (t.closest('a, button, [role="button"], [data-cursor]')) setLabel(pick(LABELS.hover))
    }
    const onOut = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      if (t.closest('a, button, [role="button"], [data-cursor]')) revertToIdle(600)
    }

    // Click
    const onDown = () => setLabel(pick(LABELS.click))
    const onUp   = () => revertToIdle(800)

    // Scroll
    const onScroll = () => {
      setLabel(pick(LABELS.scroll))
      if (scrollTimer.current) clearTimeout(scrollTimer.current)
      scrollTimer.current = setTimeout(() => setLabel(pick(LABELS.idle)), 1200)
    }

    // Cross-page Rafi reactions
    const onRafiFlee    = () => { setLabel(pick(LABELS.flee));    revertToIdle(2200) }
    const onRafiRecover = () => { setLabel(pick(LABELS.recover)); revertToIdle(2800) }
    const onRafiCorrect = () => { setLabel(pick(LABELS.correct)); revertToIdle(2800) }

    const onLeave = () => setVisible(false)
    const onEnter = () => setVisible(true)

    document.addEventListener('mousemove',  onMove)
    document.addEventListener('mouseover',  onOver)
    document.addEventListener('mouseout',   onOut)
    document.addEventListener('mousedown',  onDown)
    document.addEventListener('mouseup',    onUp)
    document.addEventListener('mouseleave', onLeave)
    document.addEventListener('mouseenter', onEnter)
    window.addEventListener('scroll',       onScroll, { passive: true })
    window.addEventListener('rafi-flee',    onRafiFlee    as EventListener)
    window.addEventListener('rafi-recover', onRafiRecover as EventListener)
    window.addEventListener('rafi-correct', onRafiCorrect as EventListener)

    // Start with an idle message immediately
    setLabel(pick(LABELS.idle))
    resetIdleTimer()

    const loop = () => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px)`
      }
      raf.current = requestAnimationFrame(loop)
    }
    raf.current = requestAnimationFrame(loop)

    return () => {
      document.removeEventListener('mousemove',  onMove)
      document.removeEventListener('mouseover',  onOver)
      document.removeEventListener('mouseout',   onOut)
      document.removeEventListener('mousedown',  onDown)
      document.removeEventListener('mouseup',    onUp)
      document.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('mouseenter', onEnter)
      window.removeEventListener('scroll',       onScroll)
      window.removeEventListener('rafi-flee',    onRafiFlee    as EventListener)
      window.removeEventListener('rafi-recover', onRafiRecover as EventListener)
      window.removeEventListener('rafi-correct', onRafiCorrect as EventListener)
      cancelAnimationFrame(raf.current)
      if (idleTimer.current)   clearTimeout(idleTimer.current)
      if (revertTimer.current) clearTimeout(revertTimer.current)
      if (scrollTimer.current) clearTimeout(scrollTimer.current)
    }
  }, [visible])

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 z-[999999] pointer-events-none will-change-transform"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <img
        src="/cursor-user.png"
        alt=""
        width={22}
        height={22}
        draggable={false}
        className="block select-none"
        style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))' }}
      />
      <div
        className="absolute whitespace-nowrap"
        style={{
          top: '22px', left: '16px',
          padding: '5px 10px', borderRadius: '4px',
          backgroundColor: '#FFC700',
          boxShadow: '0 4px 12px rgba(0,0,0,0.35)',
        }}
      >
        <span className="text-black font-medium text-[13px] leading-none tracking-[-0.04em] font-sans">
          awesome-guest · <span ref={labelRef}>{pick(LABELS.idle)}</span>
        </span>
      </div>
    </div>
  )
}
