'use client'

import { useEffect, useRef, useState } from 'react'

const LABELS = {
  sleep:   ['*zzz*', '*snore*', '💤', 'out cold', 'sleeping fr', 'gone', '*zzzzz*', 'do not disturb'],
  drag:    ['moving things...', 'rearranging', 'this goes here', 'lemme fix this', 'drag drag drag', 'interior design mode'],
  scale:   ['making it bigger', 'size check', 'scaling...', 'bigger? smaller?', 'resize time'],
  rotate:  ['spinning...', 'dizzy yet?', 'rotate rotate', 'round and round', 'wheeling it'],
  flee:    ['come back!', 'wait wait', 'i don\'t bite', 'why run', 'just saying hi', 'hey!!'],
  recover: ['i did nothing', 'ok my bad', 'sorry lol', 'i\'ll behave'],
  correct: ['ok my bad', 'sorry sorry', 'i was playing', 'i\'ll put it back', 'ok i get it', 'rafi pls'],
  boot:    ['loading...', 'booting up', 'just a sec...', 'starting...', 'warming up'],
  loaded:  ['there we go', 'nice choice', 'good pick', 'ready', 'enjoy'],
}

function pick(arr: string[]) { return arr[Math.floor(Math.random() * arr.length)] }

export default function CustomCursor() {
  const cursorRef   = useRef<HTMLDivElement>(null)
  const labelRef    = useRef<HTMLSpanElement>(null)
  const [visible, setVisible] = useState(false)
  const pos         = useRef({ x: -100, y: -100 })
  const raf         = useRef<number>(0)
  const revertTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const sleepTimer  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isClicking  = useRef(false)
  const isSleeping  = useRef(false)

  useEffect(() => {
    document.body.classList.add('custom-cursor')
    return () => document.body.classList.remove('custom-cursor')
  }, [])

  useEffect(() => {
    const lbl = labelRef.current!

    function setLabel(text: string) {
      if (lbl) lbl.textContent = text
    }

    function scheduleSleep() {
      if (sleepTimer.current) clearTimeout(sleepTimer.current)
      sleepTimer.current = setTimeout(() => {
        if (isClicking.current) return
        isSleeping.current = true
        setLabel(pick(LABELS.sleep))
        window.dispatchEvent(new CustomEvent('user-idle'))
      }, 5000)
    }

    function goIdle() {
      if (isClicking.current) return
      if (revertTimer.current) { clearTimeout(revertTimer.current); revertTimer.current = null }
      setLabel('')
      scheduleSleep()
    }

    function revertToIdle(ms: number) {
      if (revertTimer.current) clearTimeout(revertTimer.current)
      revertTimer.current = setTimeout(() => { revertTimer.current = null; goIdle() }, ms)
    }

    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY }
      if (!visible) setVisible(true)
      if (isSleeping.current) {
        isSleeping.current = false
        setLabel('')
        window.dispatchEvent(new CustomEvent('user-active'))
      }
      scheduleSleep()
    }

    const onDown = () => { isClicking.current = true }
    const onUp   = () => { isClicking.current = false; revertToIdle(400) }

    // Hero interaction reactions
    const onDrag   = () => { isClicking.current = true; setLabel(pick(LABELS.drag)) }
    const onScale  = () => { isClicking.current = true; setLabel(pick(LABELS.scale)) }
    const onRotate = () => { isClicking.current = true; setLabel(pick(LABELS.rotate)) }

    // Rafi reactions
    const onRafiFlee    = () => { setLabel(pick(LABELS.flee));    revertToIdle(2200) }
    const onRafiRecover = () => { setLabel(pick(LABELS.recover)); revertToIdle(2800) }
    const onRafiCorrect = () => { setLabel(pick(LABELS.correct)); revertToIdle(2800) }

    // Work page boot reactions
    const onWorkBootStart = () => { setLabel(pick(LABELS.boot)) }
    const onWorkBootDone  = () => { setLabel(pick(LABELS.loaded)); revertToIdle(2000) }

    const onLeave = () => setVisible(false)
    const onEnter = () => setVisible(true)

    document.addEventListener('mousemove',  onMove)
    document.addEventListener('mousedown',  onDown)
    document.addEventListener('mouseup',    onUp)
    document.addEventListener('mouseleave', onLeave)
    document.addEventListener('mouseenter', onEnter)
    window.addEventListener('element-drag',   onDrag)
    window.addEventListener('element-scale',  onScale)
    window.addEventListener('element-rotate', onRotate)
    window.addEventListener('rafi-flee',    onRafiFlee    as EventListener)
    window.addEventListener('rafi-recover', onRafiRecover as EventListener)
    window.addEventListener('rafi-correct', onRafiCorrect as EventListener)
    window.addEventListener('work-boot-start', onWorkBootStart)
    window.addEventListener('work-boot-done',  onWorkBootDone)

    scheduleSleep()

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
      window.removeEventListener('work-boot-start', onWorkBootStart)
      window.removeEventListener('work-boot-done',  onWorkBootDone)
      cancelAnimationFrame(raf.current)
      if (revertTimer.current) clearTimeout(revertTimer.current)
      if (sleepTimer.current)  clearTimeout(sleepTimer.current)
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
      <div style={{
        position: 'absolute', top: 22, left: 16,
        background: '#FFC700', color: '#000',
        fontFamily: 'inherit', fontSize: 11, fontWeight: 600,
        padding: '5px 10px', borderRadius: 3,
        whiteSpace: 'nowrap', letterSpacing: '0.01em',
        boxShadow: '0 4px 12px rgba(0,0,0,0.35)',
      }}>awesome-guest · <span ref={labelRef} /></div>
    </div>
  )
}
