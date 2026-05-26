'use client'

import { useEffect, useRef, useState } from 'react'

const LABELS = {
  move:     ['weeeeee', 'zoom zoom', 'vroom vroom', 'woooosh', 'look at me go', 'going places', 'on the move', 'gliding...', 'speedy', 'wheeeee', 'zoom~'],
  idle:     ['zoning out', 'lost tbh', 'just existing', 'thinking...', 'blank stare', 'idk anymore', 'hmm', 'figuring things out'],
  hover:    ['curious', 'tempted', 'maybe...', 'interested', 'ooh', 'should i?', 'do i dare', 'tell me more'],
  click:    ['let\'s go', 'aight', 'on it', 'done', 'ok ok', 'yep'],
  misclick: ['why did i click that', 'nothing here', 'clicking the void', 'that did nothing', '...ok', 'oops', 'just checking'],
  scroll:   ['exploring', 'looking for something', 'what\'s down here', 'keep going'],
  flee:     ['come back!', 'wait wait', 'i don\'t bite', 'why run', 'just saying hi', 'hey!!'],
  recover:  ['i did nothing', 'ok my bad', 'sorry lol', 'i\'ll behave'],
  correct:  ['ok my bad', 'sorry sorry', 'i was playing', 'i\'ll put it back', 'ok i get it', 'rafi pls'],
}

function pick(arr: string[]) { return arr[Math.floor(Math.random() * arr.length)] }

export default function CustomCursor() {
  const cursorRef   = useRef<HTMLDivElement>(null)
  const labelRef    = useRef<HTMLSpanElement>(null)
  const [visible, setVisible] = useState(false)
  const pos         = useRef({ x: -100, y: -100 })
  const raf         = useRef<number>(0)
  const revertTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const idleTimer   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const moveTimer   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isMoving    = useRef(false)
  const isHovering  = useRef(false)

  useEffect(() => {
    const lbl = labelRef.current!

    function setLabel(text: string) {
      if (lbl) lbl.textContent = text
    }

    // Single source of truth for going idle — cancels ALL competing timers first
    function goIdle() {
      if (revertTimer.current) { clearTimeout(revertTimer.current); revertTimer.current = null }
      if (scrollTimer.current) { clearTimeout(scrollTimer.current); scrollTimer.current = null }
      setLabel(pick(LABELS.idle))
      // Schedule next idle refresh
      if (idleTimer.current) clearTimeout(idleTimer.current)
      idleTimer.current = setTimeout(goIdle, 5000)
    }

    function revertToIdle(ms: number) {
      if (revertTimer.current) clearTimeout(revertTimer.current)
      revertTimer.current = setTimeout(() => { revertTimer.current = null; goIdle() }, ms)
    }

    // Movement
    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY }
      if (!visible) setVisible(true)

      // Cancel idle refresh while user is active
      if (idleTimer.current) { clearTimeout(idleTimer.current); idleTimer.current = null }

      // Transition from still → moving
      if (!isMoving.current && !isHovering.current) {
        isMoving.current = true
        if (revertTimer.current) { clearTimeout(revertTimer.current); revertTimer.current = null }
        setLabel(pick(LABELS.move))
      }

      // Debounce stop
      if (moveTimer.current) clearTimeout(moveTimer.current)
      moveTimer.current = setTimeout(() => {
        isMoving.current = false
        if (!isHovering.current) goIdle()
      }, 350)
    }

    // Hover
    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      if (t.closest('a, button, [role="button"], [data-cursor]')) {
        isHovering.current = true
        if (revertTimer.current) { clearTimeout(revertTimer.current); revertTimer.current = null }
        setLabel(pick(LABELS.hover))
      }
    }
    const onOut = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      if (t.closest('a, button, [role="button"], [data-cursor]')) {
        isHovering.current = false
        revertToIdle(600)
      }
    }

    // Click
    const onDown = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      const isInteractive = !!t.closest('a, button, [role="button"], [data-cursor]')
      if (revertTimer.current) { clearTimeout(revertTimer.current); revertTimer.current = null }
      setLabel(pick(isInteractive ? LABELS.click : LABELS.misclick))
    }
    const onUp = () => revertToIdle(800)

    // Scroll
    const onScroll = () => {
      if (revertTimer.current) { clearTimeout(revertTimer.current); revertTimer.current = null }
      setLabel(pick(LABELS.scroll))
      if (scrollTimer.current) clearTimeout(scrollTimer.current)
      scrollTimer.current = setTimeout(() => { scrollTimer.current = null; goIdle() }, 1200)
    }

    // Rafi reactions
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

    goIdle()

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
      if (revertTimer.current) clearTimeout(revertTimer.current)
      if (idleTimer.current)   clearTimeout(idleTimer.current)
      if (moveTimer.current)   clearTimeout(moveTimer.current)
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
