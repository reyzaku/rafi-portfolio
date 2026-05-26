'use client'

import { useEffect, useRef, useState } from 'react'

const LABELS = {
  move:     ['weeeeee', 'zoom zoom', 'vroom vroom', 'woooosh', 'look at me go', 'going places', 'on the move', 'gliding...', 'speedy', 'wheeeee', 'zoom~'],
  idle:     ['zoning out', 'lost tbh', 'just existing', 'thinking...', 'blank stare', 'idk anymore', 'hmm', 'figuring things out'],
  sleep:    ['*zzz*', '*snore*', '💤', 'out cold', 'sleeping fr', 'gone', '*zzzzz*', 'do not disturb'],
  misclick: ['why did i click that', 'nothing here', 'clicking the void', 'that did nothing', '...ok', 'oops', 'just checking'],
  drag:     ['moving things...', 'rearranging', 'this goes here', 'lemme fix this', 'drag drag drag', 'interior design mode'],
  scale:    ['making it bigger', 'size check', 'scaling...', 'bigger? smaller?', 'resize time'],
  rotate:   ['spinning...', 'dizzy yet?', 'rotate rotate', 'round and round', 'wheeling it'],
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
  const sleepTimer  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isClicking  = useRef(false)
  const isSleeping  = useRef(false)
  const isMoving    = useRef(false)
  const moveTimer   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const stillPos    = useRef({ x: -100, y: -100 })

  useEffect(() => {
    const lbl = labelRef.current!

    function setLabel(text: string) {
      if (lbl) lbl.textContent = text
    }

    function goIdle() {
      if (isClicking.current) return
      if (revertTimer.current) { clearTimeout(revertTimer.current); revertTimer.current = null }
      isMoving.current = false
      stillPos.current = { ...pos.current }
      setLabel(pick(LABELS.idle))
      if (sleepTimer.current) clearTimeout(sleepTimer.current)
      sleepTimer.current = setTimeout(() => {
        if (idleTimer.current) { clearTimeout(idleTimer.current); idleTimer.current = null }
        isSleeping.current = true
        setLabel(pick(LABELS.sleep))
        window.dispatchEvent(new CustomEvent('user-idle'))
      }, 3000)
      if (idleTimer.current) clearTimeout(idleTimer.current)
      idleTimer.current = setTimeout(goIdle, 5000)
    }

    function revertToIdle(ms: number) {
      if (revertTimer.current) clearTimeout(revertTimer.current)
      revertTimer.current = setTimeout(() => { revertTimer.current = null; goIdle() }, ms)
    }

    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY }
      if (!visible) setVisible(true)
      if (idleTimer.current)  { clearTimeout(idleTimer.current);  idleTimer.current  = null }
      if (sleepTimer.current) { clearTimeout(sleepTimer.current); sleepTimer.current = null }
      if (isSleeping.current) {
        isSleeping.current = false
        isMoving.current = false
        window.dispatchEvent(new CustomEvent('user-active'))
      }
      // Only trigger move label after moving 20px+ from where cursor went still
      if (!isClicking.current && !isMoving.current) {
        const dx = e.clientX - stillPos.current.x
        const dy = e.clientY - stillPos.current.y
        if (dx * dx + dy * dy > 400) {
          isMoving.current = true
          setLabel(pick(LABELS.move))
        }
      }
      // Short debounce — revert to idle 350ms after movement stops
      if (moveTimer.current) clearTimeout(moveTimer.current)
      moveTimer.current = setTimeout(() => {
        isMoving.current = false
        stillPos.current = { ...pos.current }
        if (!isClicking.current) goIdle()
      }, 350)
      // Restart idle countdown on every move
      idleTimer.current = setTimeout(goIdle, 3000)
    }

    const onDown = (e: MouseEvent) => {
      if (isClicking.current) return
      isClicking.current = true
      const t = e.target as HTMLElement
      if (!t.closest('a, button, [role="button"], [data-cursor]')) {
        if (revertTimer.current) { clearTimeout(revertTimer.current); revertTimer.current = null }
        setLabel(pick(LABELS.misclick))
      }
    }
    const onUp = () => { isClicking.current = false; revertToIdle(600) }

    // Hero interaction reactions
    const onDrag    = () => { isClicking.current = true;  setLabel(pick(LABELS.drag)) }
    const onScale   = () => { isClicking.current = true;  setLabel(pick(LABELS.scale)) }
    const onRotate  = () => { isClicking.current = true;  setLabel(pick(LABELS.rotate)) }

    // Rafi reactions — cancel moveTimer so it can't override the label
    const clearMove = () => {
      if (moveTimer.current) { clearTimeout(moveTimer.current); moveTimer.current = null }
      isMoving.current = false
      stillPos.current = { ...pos.current }
    }
    const onRafiFlee    = () => { clearMove(); setLabel(pick(LABELS.flee));    revertToIdle(2200) }
    const onRafiRecover = () => { clearMove(); setLabel(pick(LABELS.recover)); revertToIdle(2800) }
    const onRafiCorrect = () => { clearMove(); setLabel(pick(LABELS.correct)); revertToIdle(2800) }

    const onLeave = () => setVisible(false)
    const onEnter = () => setVisible(true)

    document.addEventListener('mousemove',  onMove)
    document.addEventListener('mousedown',  onDown)
    document.addEventListener('mouseup',    onUp)
    document.addEventListener('mouseleave', onLeave)
    document.addEventListener('mouseenter', onEnter)
    window.addEventListener('element-drag',    onDrag)
    window.addEventListener('element-scale',   onScale)
    window.addEventListener('element-rotate',  onRotate)
    window.addEventListener('rafi-flee',    onRafiFlee    as EventListener)
    window.addEventListener('rafi-recover', onRafiRecover as EventListener)
    window.addEventListener('rafi-correct', onRafiCorrect as EventListener)

    // Don't show idle immediately — wait for genuine stillness
    idleTimer.current = setTimeout(goIdle, 3000)

    const loop = () => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px)`
      }
      raf.current = requestAnimationFrame(loop)
    }
    raf.current = requestAnimationFrame(loop)

    return () => {
      document.removeEventListener('mousemove',  onMove)
      document.removeEventListener('mousedown',  onDown)
      document.removeEventListener('mouseup',    onUp)
      document.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('mouseenter', onEnter)
      window.removeEventListener('element-drag',   onDrag)
      window.removeEventListener('element-scale',  onScale)
      window.removeEventListener('element-rotate', onRotate)
      window.removeEventListener('rafi-flee',    onRafiFlee    as EventListener)
      window.removeEventListener('rafi-recover', onRafiRecover as EventListener)
      window.removeEventListener('rafi-correct', onRafiCorrect as EventListener)
      cancelAnimationFrame(raf.current)
      if (revertTimer.current) clearTimeout(revertTimer.current)
      if (idleTimer.current)   clearTimeout(idleTimer.current)
      if (sleepTimer.current)  clearTimeout(sleepTimer.current)
      if (moveTimer.current)   clearTimeout(moveTimer.current)
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
          awesome-guest · <span ref={labelRef}></span>
        </span>
      </div>
    </div>
  )
}
