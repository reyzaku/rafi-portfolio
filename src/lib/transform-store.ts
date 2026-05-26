export type ElementTransform = { scale: number; rotation: number }

const transforms: Record<string, ElementTransform> = {}

export const transformStore = {
  get: (id: string): ElementTransform => transforms[id] ?? { scale: 1, rotation: 0 },
  set: (id: string, t: ElementTransform) => { transforms[id] = t },
  applyStyle: (el: HTMLElement) => {
    const { scale, rotation } = transforms[el.id] ?? { scale: 1, rotation: 0 }
    el.style.transform = (scale === 1 && rotation === 0) ? 'none' : `scale(${scale}) rotate(${rotation}deg)`
  },
}

export type CorrectionReason = 'scale' | 'rotation'
type CorrectionListener = (id: string, reason: CorrectionReason) => void
const listeners = new Set<CorrectionListener>()

export const correctionBus = {
  request: (id: string, reason: CorrectionReason) => listeners.forEach(l => l(id, reason)),
  onRequest: (l: CorrectionListener) => { listeners.add(l); return () => { listeners.delete(l) } },
}
