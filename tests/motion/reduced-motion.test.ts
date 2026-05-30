/**
 * @agent-context Tests shouldSkipHeroMotion — reduced motion skips matrix overlay.
 * @run pnpm test:motion
 */
import { describe, expect, it } from 'vitest'
import { shouldSkipHeroMotion } from '../../shared/motion'

describe('shouldSkipHeroMotion', () => {
  it('skips when prefers-reduced-motion', () => {
    expect(shouldSkipHeroMotion(true, 'matrix')).toBe(true)
  })

  it('skips instant variant even without reduced motion', () => {
    expect(shouldSkipHeroMotion(false, 'instant')).toBe(true)
  })

  it('runs matrix when motion allowed', () => {
    expect(shouldSkipHeroMotion(false, 'matrix')).toBe(false)
  })
})
