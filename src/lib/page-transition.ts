// Global hook so Nav and ContactButton can trigger transitions
// without importing the React component

let _trigger: ((path: string) => void) | null = null

export function registerTransitionTrigger(fn: (path: string) => void) {
  _trigger = fn
}

export function unregisterTransitionTrigger() {
  _trigger = null
}

export function navigateWithTransition(path: string) {
  if (_trigger) {
    _trigger(path)
  } else {
    window.location.href = path
  }
}
