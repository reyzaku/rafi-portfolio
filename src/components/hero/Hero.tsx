'use client'

import { useEffect, useRef } from 'react'
import { selectionStore } from '@/lib/selection-store'
import { transformStore, correctionBus, CorrectionReason } from '@/lib/transform-store'
import FloatingIcons from './FloatingIcons'
import { HandRaisedIcon } from '@heroicons/react/24/solid'

type Msg = { msg: string; emoji: string }

const DRAG_MESSAGES: Record<string, Msg> = {
  'el-eyebrow':  { msg: "That's literally the page title bro.",   emoji: '😐' },
  'el-headline': { msg: "Bro. That's literally my name.",         emoji: '🙄' },
  'el-subtext':  { msg: "Now no one knows what I do.",            emoji: '😤' },
}

const SCALE_MESSAGES: Record<string, { tooBig: Msg; tooSmall: Msg }> = {
  'el-eyebrow': {
    tooBig:   { msg: "PORTFOLIO is not a billboard.",    emoji: '😑' },
    tooSmall: { msg: "No one can read that.",            emoji: '🔍' },
  },
  'el-headline': {
    tooBig:   { msg: "My name is not a banner.",         emoji: '😤' },
    tooSmall: { msg: "My name isn't invisible.",         emoji: '😶' },
  },
  'el-subtext': {
    tooBig:   { msg: "Nobody reads at that size.",       emoji: '🫠' },
    tooSmall: { msg: "This isn't a poster for ants.",    emoji: '😑' },
  },
}

const ROTATE_MESSAGES: Record<string, { tilted: Msg; sideways: Msg; upsideDown: Msg }> = {
  'el-eyebrow': {
    tilted:     { msg: "Titles go horizontal. Always.",           emoji: '😐' },
    sideways:   { msg: "Did you fall asleep on your keyboard?",   emoji: '😒' },
    upsideDown: { msg: "What are you even doing.",                emoji: '🙃' },
  },
  'el-headline': {
    tilted:     { msg: "My name doesn't lean.",                   emoji: '🙃' },
    sideways:   { msg: "Rotate your monitor, not my name.",       emoji: '😒' },
    upsideDown: { msg: "I'm not Australian.",                     emoji: '🙃' },
  },
  'el-subtext': {
    tilted:     { msg: "No one reads at an angle.",               emoji: '😑' },
    sideways:   { msg: "Turn your phone back. Now.",              emoji: '😒' },
    upsideDown: { msg: "Bro who reads upside down.",               emoji: '🙃' },
  },
}

function getScaleMsg(id: string, scale: number): Msg {
  const entry = SCALE_MESSAGES[id]
  if (!entry) return { msg: "Please don't do that.", emoji: '😐' }
  return scale > 1 ? entry.tooBig : entry.tooSmall
}

function getRotateMsg(id: string, rotation: number): Msg {
  const entry = ROTATE_MESSAGES[id]
  if (!entry) return { msg: "Please don't do that.", emoji: '😐' }
  const norm = ((rotation % 360) + 360) % 360
  if (norm >= 150 && norm <= 210) return entry.upsideDown
  if ((norm >= 60 && norm <= 120) || (norm >= 240 && norm <= 300)) return entry.sideways
  return entry.tilted
}

function runSpring(
  getPos: () => { x: number; y: number },
  setPos: (x: number, y: number) => void,
  tx: number, ty: number,
  k: number, d: number,
  onDone?: () => void
) {
  let { x, y } = getPos()
  let vx = 0, vy = 0
  function step() {
    vx = (vx + (tx - x) * k) * d
    vy = (vy + (ty - y) * k) * d
    x += vx; y += vy
    setPos(x, y)
    if (Math.abs(tx - x) < 0.5 && Math.abs(ty - y) < 0.5 && Math.abs(vx) < 0.1) {
      setPos(tx, ty); onDone?.(); return
    }
    requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

export default function Hero() {
  const heroRef     = useRef<HTMLDivElement>(null)
  const cursorRef   = useRef<HTMLDivElement>(null)
  const cursorLabel = useRef<HTMLDivElement>(null)
  const toastRef    = useRef<HTMLDivElement>(null)
  const toastEmoji  = useRef<HTMLSpanElement>(null)
  const toastMsg    = useRef<HTMLSpanElement>(null)

  const origPos      = useRef<Record<string, { left: number; top: number }>>({})
  const isCorrecting = useRef(false)
  const activeDrag   = useRef<HTMLElement | null>(null)
  const dOff         = useRef({ x: 0, y: 0 })
  const dragMoved    = useRef(false)
  const cursorPos    = useRef({ x: -300, y: -300 })

  useEffect(() => {
    // Drag interaction is desktop-only — touch devices keep CSS percentage positions
    const isTouch = window.matchMedia('(pointer: coarse)').matches
    if (isTouch) return

    const hero = heroRef.current!
    const draggables = Array.from(hero.querySelectorAll<HTMLElement>('.draggable'))

    function initPos() {
      const hr = hero.getBoundingClientRect()
      draggables.forEach(el => {
        const t = transformStore.get(el.id)
        const hasTransform = t.scale !== 1 || t.rotation !== 0

        if (hasTransform) {
          // Temporarily clear transform to measure true layout position
          el.style.transform = 'none'
          const r = el.getBoundingClientRect()
          origPos.current[el.id] = { left: r.left - hr.left, top: r.top - hr.top }
          el.style.left   = origPos.current[el.id].left + 'px'
          el.style.top    = origPos.current[el.id].top  + 'px'
          el.style.bottom = 'auto'; el.style.right = 'auto'; el.style.margin = '0'
          // Restore scale/rotation
          el.style.transform = `scale(${t.scale}) rotate(${t.rotation}deg)`
        } else {
          // Measure with existing transform (translateX(-50%) on first load)
          const r = el.getBoundingClientRect()
          origPos.current[el.id] = { left: r.left - hr.left, top: r.top - hr.top }
          el.style.left      = origPos.current[el.id].left + 'px'
          el.style.top       = origPos.current[el.id].top  + 'px'
          el.style.transform = 'none'
          el.style.bottom    = 'auto'; el.style.right = 'auto'; el.style.margin = '0'
        }
      })
    }
    document.fonts.ready.then(initPos)
    setTimeout(initPos, 250)
    window.addEventListener('resize', initPos)

    function triggerCorrection(el: HTMLElement) {
      if (isCorrecting.current) return
      isCorrecting.current = true
      selectionStore.set(null)
      el.classList.add('correcting')

      const cfg  = DRAG_MESSAGES[el.id] || { msg: "Please don't do that.", emoji: '😐' }
      const orig = origPos.current[el.id]
      const hr   = hero.getBoundingClientRect()
      const cur  = cursorRef.current!
      const lbl  = cursorLabel.current!
      const tst  = toastRef.current!

      const elVX = hr.left + parseFloat(el.style.left)
      const elVY = hr.top  + parseFloat(el.style.top)

      toastEmoji.current!.textContent = cfg.emoji
      toastMsg.current!.textContent   = cfg.msg
      tst.style.left      = Math.min(Math.max(elVX, 12), window.innerWidth - 290) + 'px'
      tst.style.top       = Math.max(elVY - 58, 90) + 'px'
      tst.style.opacity   = '1'
      tst.style.transform = 'translateY(0)'

      cursorPos.current = { x: window.innerWidth + 60, y: window.innerHeight * 0.4 }
      cur.style.left    = cursorPos.current.x + 'px'
      cur.style.top     = cursorPos.current.y + 'px'
      lbl.textContent   = 'Rafi · fixing this...'

      setTimeout(() => {
        cur.style.opacity = '1'

        runSpring(
          () => cursorPos.current,
          (x, y) => { cursorPos.current = { x, y }; cur.style.left = x + 'px'; cur.style.top = y + 'px' },
          elVX - 14, elVY - 10, 0.014, 0.86,
          () => {
            lbl.textContent = 'Rafi · dragging...'
            const r0 = el.getBoundingClientRect()
            selectionStore.set({ x: r0.left, y: r0.top, w: r0.width, h: r0.height, id: el.id })
            setTimeout(() => {
              const destVX = hr.left + orig.left - 14
              const destVY = hr.top  + orig.top  - 10

              runSpring(
                () => ({ x: parseFloat(el.style.left), y: parseFloat(el.style.top) }),
                (x, y) => {
                  el.style.left = x + 'px'; el.style.top = y + 'px'
                  const r1 = el.getBoundingClientRect()
                  selectionStore.set({ x: r1.left, y: r1.top, w: r1.width, h: r1.height, id: el.id })
                },
                orig.left, orig.top, 0.06, 0.78
              )

              runSpring(
                () => cursorPos.current,
                (x, y) => { cursorPos.current = { x, y }; cur.style.left = x + 'px'; cur.style.top = y + 'px' },
                destVX, destVY, 0.022, 0.84,
                () => {
                  lbl.textContent = 'Rafi · done ✓'
                  const baseX = parseFloat(cur.style.left)
                  const wseq  = [3, -4, 3, -2, 1, 0]
                  let wi = 0
                  function wiggle() {
                    if (wi >= wseq.length) {
                      setTimeout(() => {
                        runSpring(
                          () => cursorPos.current,
                          (x, y) => { cursorPos.current = { x, y }; cur.style.left = x + 'px'; cur.style.top = y + 'px' },
                          window.innerWidth + 90, parseFloat(cur.style.top), 0.042, 0.84,
                          () => { cur.style.opacity = '0' }
                        )
                      }, 400)
                      return
                    }
                    cur.style.left = (baseX + wseq[wi]) + 'px'
                    wi++; setTimeout(wiggle, 65)
                  }
                  wiggle()

                  setTimeout(() => {
                    tst.style.opacity   = '0'
                    tst.style.transform = 'translateY(8px)'
                    el.classList.remove('correcting')
                    selectionStore.set(null)
                    isCorrecting.current = false
                  }, 1200)
                }
              )
            }, 450)
          }
        )
      }, 220)
    }

    function triggerTransformCorrection(el: HTMLElement, reason: CorrectionReason) {
      if (isCorrecting.current) return
      isCorrecting.current = true
      selectionStore.set(null)
      el.classList.add('correcting')

      const { scale, rotation } = transformStore.get(el.id)
      const cfg = reason === 'scale'
        ? getScaleMsg(el.id, scale)
        : getRotateMsg(el.id, rotation)
      const hr   = hero.getBoundingClientRect()
      const cur  = cursorRef.current!
      const lbl  = cursorLabel.current!
      const tst  = toastRef.current!

      const elVX = hr.left + parseFloat(el.style.left)
      const elVY = hr.top  + parseFloat(el.style.top)

      toastEmoji.current!.textContent = cfg.emoji
      toastMsg.current!.textContent   = cfg.msg
      tst.style.left      = Math.min(Math.max(elVX, 12), window.innerWidth - 290) + 'px'
      tst.style.top       = Math.max(elVY - 58, 90) + 'px'
      tst.style.opacity   = '1'
      tst.style.transform = 'translateY(0)'

      cursorPos.current = { x: window.innerWidth + 60, y: window.innerHeight * 0.4 }
      cur.style.left    = cursorPos.current.x + 'px'
      cur.style.top     = cursorPos.current.y + 'px'
      lbl.textContent   = 'Rafi · fixing this...'

      setTimeout(() => {
        cur.style.opacity = '1'

        runSpring(
          () => cursorPos.current,
          (x, y) => { cursorPos.current = { x, y }; cur.style.left = x + 'px'; cur.style.top = y + 'px' },
          elVX - 14, elVY - 10, 0.014, 0.86,
          () => {
            lbl.textContent = 'Rafi · resetting...'
            const r0 = el.getBoundingClientRect()
            selectionStore.set({ x: r0.left, y: r0.top, w: r0.width, h: r0.height, id: el.id })

            let { scale: sv, rotation: rv } = transformStore.get(el.id)
            function tweenTransform() {
              sv += (1 - sv) * 0.06
              rv += (0 - rv) * 0.06
              if (Math.abs(1 - sv) < 0.001 && Math.abs(rv) < 0.1) {
                sv = 1; rv = 0
                el.style.transform = 'none'
                transformStore.set(el.id, { scale: 1, rotation: 0 })
                const r1 = el.getBoundingClientRect()
                selectionStore.set({ x: r1.left, y: r1.top, w: r1.width, h: r1.height, id: el.id })

                lbl.textContent = 'Rafi · done ✓'
                const baseX = parseFloat(cur.style.left)
                const wseq  = [3, -4, 3, -2, 1, 0]
                let wi = 0
                function wiggle() {
                  if (wi >= wseq.length) {
                    setTimeout(() => {
                      runSpring(
                        () => cursorPos.current,
                        (x, y) => { cursorPos.current = { x, y }; cur.style.left = x + 'px'; cur.style.top = y + 'px' },
                        window.innerWidth + 90, parseFloat(cur.style.top), 0.042, 0.84,
                        () => { cur.style.opacity = '0' }
                      )
                    }, 400)
                    return
                  }
                  cur.style.left = (baseX + wseq[wi]) + 'px'
                  wi++; setTimeout(wiggle, 65)
                }
                wiggle()

                setTimeout(() => {
                  tst.style.opacity   = '0'
                  tst.style.transform = 'translateY(8px)'
                  el.classList.remove('correcting')
                  selectionStore.set(null)
                  isCorrecting.current = false
                }, 1200)
                return
              }
              el.style.transform = `scale(${sv}) rotate(${rv}deg)`
              transformStore.set(el.id, { scale: sv, rotation: rv })
              const r2 = el.getBoundingClientRect()
              selectionStore.set({ x: r2.left, y: r2.top, w: r2.width, h: r2.height, id: el.id })
              requestAnimationFrame(tweenTransform)
            }
            tweenTransform()
          }
        )
      }, 180)
    }

    const unsubCorrection = correctionBus.onRequest((id, reason) => {
      const el = hero.querySelector<HTMLElement>(`#${id}`)
      if (el) triggerTransformCorrection(el, reason)
    })

    draggables.forEach(el => {
      el.addEventListener('mousedown', (e) => {
        if (isCorrecting.current) return
        e.preventDefault()

        if (!origPos.current[el.id]) {
          const hr = hero.getBoundingClientRect()
          const r  = el.getBoundingClientRect()
          origPos.current[el.id] = { left: r.left - hr.left, top: r.top - hr.top }
          el.style.left   = origPos.current[el.id].left + 'px'
          el.style.top    = origPos.current[el.id].top  + 'px'
          el.style.bottom = 'auto'
          el.style.right  = 'auto'
        }

        // Preserve scale/rotation, only clear translateX from initial layout
        transformStore.applyStyle(el)

        activeDrag.current = el
        dragMoved.current  = false
        el.classList.add('is-grabbed')
        const r = el.getBoundingClientRect()
        dOff.current = { x: (e as MouseEvent).clientX - r.left, y: (e as MouseEvent).clientY - r.top }

        // Select immediately on mousedown
        selectionStore.set({ x: r.left, y: r.top, w: r.width, h: r.height, id: el.id })
      })
    })

    // Click on empty hero background = deselect
    const heroDown = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.draggable')) {
        selectionStore.set(null)
      }
    }
    hero.addEventListener('mousedown', heroDown)

    const onMove = (e: MouseEvent) => {
      if (!activeDrag.current) return
      const hr = hero.getBoundingClientRect()
      const nx = e.clientX - hr.left - dOff.current.x
      const ny = e.clientY - hr.top  - dOff.current.y
      activeDrag.current.style.left = nx + 'px'
      activeDrag.current.style.top  = ny + 'px'
      const o = origPos.current[activeDrag.current.id]
      if (o && Math.sqrt((nx - o.left) ** 2 + (ny - o.top) ** 2) > 48) dragMoved.current = true

      // Live update selection overlay
      const r = activeDrag.current.getBoundingClientRect()
      selectionStore.set({ x: r.left, y: r.top, w: r.width, h: r.height, id: activeDrag.current.id })
    }

    const onUp = () => {
      if (!activeDrag.current) return
      const el = activeDrag.current
      activeDrag.current = null
      el.classList.remove('is-grabbed')
      if (dragMoved.current) {
        triggerCorrection(el)
      } else {
        // Click without drag — keep selection on element
        const r = el.getBoundingClientRect()
        selectionStore.set({ x: r.left, y: r.top, w: r.width, h: r.height, id: el.id })
      }
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)

    return () => {
      window.removeEventListener('resize', initPos)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      hero.removeEventListener('mousedown', heroDown)
      unsubCorrection()
    }
  }, [])

  return (
    <>
      <section ref={heroRef} className="relative h-screen w-full z-10 overflow-hidden select-none">

        <FloatingIcons />

        <div id="el-eyebrow" className="draggable" style={{
          position: 'absolute', left: '50%', top: 'calc(50% - 148px)',
          transform: 'translateX(-50%)',
        }}>
          <p style={{
            fontSize: 'clamp(10px, 2.5vw, 13px)', fontWeight: 700,
            letterSpacing: 'clamp(4px, 2vw, 9.28px)',
            color: '#ffffff', textAlign: 'center', whiteSpace: 'nowrap',
          }}>PORTFOLIO</p>
        </div>

        <div id="el-headline" className="draggable" style={{
          position: 'absolute', left: '50%', top: 'calc(50% - 120px)',
          transform: 'translateX(-50%)',
        }}>
          <h1 style={{
            fontSize: 'clamp(36px, 10vw, 126px)', fontWeight: 700,
            letterSpacing: '-0.04em', color: '#ffffff',
            lineHeight: 1, textAlign: 'center', whiteSpace: 'nowrap',
          }}>LOREM IPSUM</h1>
        </div>

        <div id="el-subtext" className="draggable" style={{
          position: 'absolute', left: '50%', top: 'calc(50% + 30px)',
          transform: 'translateX(-50%)',
        }}>
          <p style={{
            fontSize: 'clamp(13px, 1.8vw, 16px)', fontWeight: 400, color: '#a8c4ae',
            letterSpacing: '-0.04em', lineHeight: 1.25,
            maxWidth: 'min(550px, 85vw)', textAlign: 'center',
          }}>
            Lorem ipsum dolor sit amet consectetur. Eget id nulla nisi sollicitudin vel. Vulputate augue nunc lobortis a quam dui.
          </p>
        </div>

        <div id="el-cta" style={{
          position: 'absolute', left: '50%', top: 'calc(50% + 110px)',
          transform: 'translateX(-50%)',
        }}>
          <button style={{
            backgroundColor: '#5CFF85', color: '#000000',
            fontSize: 'clamp(15px, 2vw, 20px)', fontWeight: 700, letterSpacing: '-0.04em',
            padding: 'clamp(12px, 1.5vw, 16px) clamp(28px, 4vw, 50px)', borderRadius: '37px',
            border: 'none', fontFamily: 'inherit', whiteSpace: 'nowrap',
          }}>
            See My Work
          </button>
        </div>

        {/* Hint — desktop only */}
        <div className="hidden md:block" style={{
          position: 'absolute', bottom: '3%', left: '50%', transform: 'translateX(-50%)',
          fontSize: '0.66rem', letterSpacing: '0.18em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.55)', zIndex: 10, pointerEvents: 'none',
          whiteSpace: 'nowrap', animation: 'hpulse 3s ease-in-out infinite',
        }}>
          <HandRaisedIcon style={{ width: 11, height: 11, display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
          drag anything &nbsp;·&nbsp; i dare you
        </div>

        {/* Mobile static layout */}
        <div className="md:hidden absolute inset-0 flex flex-col items-center justify-center px-6 gap-4">
          <p style={{
            fontSize: '11px', fontWeight: 700,
            letterSpacing: '7px', color: '#ffffff', textAlign: 'center', whiteSpace: 'nowrap',
          }}>PORTFOLIO</p>
          <h1 style={{
            fontSize: 'clamp(36px, 12vw, 52px)', fontWeight: 700,
            letterSpacing: '-0.04em', color: '#ffffff',
            lineHeight: 1, textAlign: 'center', whiteSpace: 'nowrap',
          }}>LOREM IPSUM</h1>
          <p style={{
            fontSize: '14px', fontWeight: 400, color: '#a8c4ae',
            letterSpacing: '-0.02em', lineHeight: 1.45,
            maxWidth: '320px', textAlign: 'center',
          }}>
            Lorem ipsum dolor sit amet consectetur. Eget id nulla nisi sollicitudin vel. Vulputate augue nunc lobortis a quam dui.
          </p>
          <button style={{
            backgroundColor: '#5CFF85', color: '#000000',
            fontSize: '17px', fontWeight: 700, letterSpacing: '-0.04em',
            padding: '14px 40px', borderRadius: '37px',
            border: 'none', fontFamily: 'inherit', whiteSpace: 'nowrap',
          }}>
            See My Work
          </button>
        </div>
      </section>

      {/* Rafi Correction Cursor */}
      <div ref={cursorRef} style={{
        position: 'fixed', zIndex: 9998, pointerEvents: 'none',
        opacity: 0, transition: 'opacity 0.22s',
        display: 'flex', alignItems: 'flex-start', gap: 5,
        left: '-300px', top: '-300px',
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/cursor-rafi.png" alt="" width={22} height={22} draggable={false} />
        <div ref={cursorLabel} style={{
          marginTop: 18, background: '#5CFF85', color: '#000',
          fontFamily: 'inherit', fontSize: 11, fontWeight: 600,
          padding: '5px 10px', borderRadius: 3,
          whiteSpace: 'nowrap', letterSpacing: '0.01em',
          boxShadow: '0 4px 12px rgba(0,0,0,0.35)',
        }}>Rafi · fixing this...</div>
      </div>

      {/* Toast */}
      <div ref={toastRef} style={{
        position: 'fixed', zIndex: 9997, pointerEvents: 'none',
        background: 'rgba(1,25,16,0.96)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 10, padding: '11px 16px', fontSize: '0.82rem', color: '#fff',
        whiteSpace: 'nowrap', opacity: 0, transform: 'translateY(8px)',
        transition: 'opacity 0.22s, transform 0.22s', backdropFilter: 'blur(16px)',
        left: 0, top: 0,
      }}>
        <span ref={toastEmoji} />&nbsp;<span ref={toastMsg} />
      </div>

      <style>{`
        .draggable { position: absolute; cursor: grab; z-index: 10; user-select: none; will-change: left, top; }
        .draggable.is-grabbed { cursor: grabbing; z-index: 50; filter: drop-shadow(0 14px 30px rgba(0,0,0,0.5)); }
        .draggable.correcting { pointer-events: none; }
        @keyframes hpulse { 0%,100%{opacity:0.55} 50%{opacity:1} }
        @media (max-width: 767px) { .draggable { display: none !important; } #el-cta { display: none !important; } }
      `}</style>
    </>
  )
}
