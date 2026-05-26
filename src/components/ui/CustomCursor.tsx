'use client'

import { useEffect, useRef, useState } from 'react'

const LABELS = {
  base:    'awesome-guest @guest',
  idle:    ['what am i doing here', 'where do i even go', 'lost tbh', 'just existing rn', '*blank stare*', 'should i scroll?', 'figuring things out', 'hmm...'],
  hover:   ['what\'s this?', 'should i click?', 'curious...', 'maybe...', 'ooh', 'tempted ngl', 'interesting...', 'do i dare'],
  click:   ['let\'s go', 'aight', 'ok ok', 'done', 'yep', 'on it'],
  scroll:  ['looking for something', 'what\'s down here', 'exploring...', 'keep going'],
  // 404 — reacting to Rafi fleeing
  flee:    ['come back!', 'wait wait wait', 'i don\'t bite', 'why does everyone run', 'i just want to say hi', 'hey!!'],
  recover: ['i wasn\'t even doing anything', 'ok my bad', 'sorry lol', 'i\'ll behave'],
  // Landing — reacting to Rafi correcting elements
  correct: ['ok ok my bad', 'sorry sorry', 'i was just playing', 'i\'ll put it back', 'ok i get it', 'rafi pls'],
}

function pick(arr: string[]) { return arr[Math.floor(Math.random() * arr.length)] }

export default function CustomCursor() {
  const cursorRef    = useRef<HTMLDivElement>(null)
  const labelRef     = useRef<HTMLSpanElement>(null)
  const [visible, setVisible] = useState(false)
  const pos          = useRef({ x: -100, y: -100 })
  const raf          = useRef<number>(0)
  const idleTimer    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const revertTimer  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const scrollTimer  = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const lbl = labelRef.current!

    function setLabel(text: string) {
      if (lbl) lbl.textContent = text
    }

    function revertAfter(ms: number) {
      if (revertTimer.current) clearTimeout(revertTimer.current)
      revertTimer.current = setTimeout(() => setLabel(LABELS.base), ms)
    }

    function resetIdle() {
      if (idleTimer.current) clearTimeout(idleTimer.current)
      idleTimer.current = setTimeout(() => setLabel(pick(LABELS.idle)), 3000)
    }

    // Movement
    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY }
      if (!visible) setVisible(true)
      resetIdle()
    }

    // Hover interactive elements
    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      if (t.closest('a, button, [role="button"], [data-cursor]')) setLabel(pick(LABELS.hover))
    }
    const onOut = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      if (t.closest('a, button, [role="button"], [data-cursor]')) setLabel(LABELS.base)
    }

    // Click
    const onDown = () => setLabel(pick(LABELS.click))
    const onUp   = () => revertAfter(400)

    // Scroll
    const onScroll = () => {
      setLabel(pick(LABELS.scroll))
      if (scrollTimer.current) clearTimeout(scrollTimer.current)
      scrollTimer.current = setTimeout(() => setLabel(LABELS.base), 800)
    }

    // Cross-page Rafi reactions
    const onRafiFlee    = () => { setLabel(pick(LABELS.flee));    revertAfter(2000) }
    const onRafiRecover = () => { setLabel(pick(LABELS.recover)); revertAfter(2500) }
    const onRafiCorrect = () => { setLabel(pick(LABELS.correct)); revertAfter(2500) }

    const onLeave = () => setVisible(false)
    const onEnter = () => setVisible(true)

    document.addEventListener('mousemove',   onMove)
    document.addEventListener('mouseover',   onOver)
    document.addEventListener('mouseout',    onOut)
    document.addEventListener('mousedown',   onDown)
    document.addEventListener('mouseup',     onUp)
    document.addEventListener('mouseleave',  onLeave)
    document.addEventListener('mouseenter',  onEnter)
    window.addEventListener('scroll',        onScroll, { passive: true })
    window.addEventListener('rafi-flee',     onRafiFlee    as EventListener)
    window.addEventListener('rafi-recover',  onRafiRecover as EventListener)
    window.addEventListener('rafi-correct',  onRafiCorrect as EventListener)

    resetIdle()

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
        <span
          ref={labelRef}
          className="text-black font-medium text-[13px] leading-none tracking-[-0.04em] font-sans"
        >
          awesome-guest @guest
        </span>
      </div>
    </div>
  )
}
