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

/** Pure helper for tests and motion routing decisions */
export function shouldSkipHeroMotion(
  prefersReducedMotion: boolean,
  variant: RouteTransitionVariant = 'matrix',
): boolean {
  return prefersReducedMotion || variant === 'instant'
}
