/** Matrix glyph charset for canvas rain */
export const MATRIX_GLYPHS = 'アイウエオカキクケコ0123456789ABCDEF#$%&'

export const MOTION_DURATIONS = {
  route: 1.4,
  crack: 0.9,
  crackConnectDelay: 0.45,
  gameEnter: 0.2,
} as const

export type RouteTransitionVariant = 'matrix' | 'instant'

export interface CrackModalOptions {
  connect: () => Promise<void>
}

/** Visible-screen rect — on iOS the visual viewport differs from the layout viewport
 * (address bar show/hide, pinch-zoom), so overlays must anchor to this, not innerWidth/Height. */
export interface VisualViewportRect {
  width: number
  height: number
  offsetLeft: number
  offsetTop: number
}

export function getVisualViewport(): VisualViewportRect {
  if (typeof window === 'undefined') {
    return { width: 0, height: 0, offsetLeft: 0, offsetTop: 0 }
  }
  const vv = window.visualViewport
  if (vv) {
    return { width: vv.width, height: vv.height, offsetLeft: vv.offsetLeft, offsetTop: vv.offsetTop }
  }
  return { width: window.innerWidth, height: window.innerHeight, offsetLeft: 0, offsetTop: 0 }
}

/** Pure helper for tests and motion routing decisions */
export function shouldSkipHeroMotion(
  prefersReducedMotion: boolean,
  variant: RouteTransitionVariant = 'matrix',
): boolean {
  return prefersReducedMotion || variant === 'instant'
}
