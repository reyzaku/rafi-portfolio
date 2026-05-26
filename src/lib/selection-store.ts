export const RULER_SIZE = 20

export type SelectionBounds = {
  x: number; y: number; w: number; h: number; id: string
} | null

type Listener = (b: SelectionBounds) => void
const listeners = new Set<Listener>()
let current: SelectionBounds = null

export const selectionStore = {
  get: () => current,
  set: (b: SelectionBounds) => { current = b; listeners.forEach(l => l(b)) },
  subscribe: (l: Listener) => { listeners.add(l); return () => { listeners.delete(l) } },
}
