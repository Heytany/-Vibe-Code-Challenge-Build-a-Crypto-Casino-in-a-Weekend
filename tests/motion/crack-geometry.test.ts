/**
 * @agent-context Tests procedural crack paths — jagged, not straight rays.
 */
import { describe, expect, it } from 'vitest'
import { buildCrackWeb, buildJaggedCrack, pointsToSvgPath } from '../../shared/crack-geometry'

describe('crack-geometry', () => {
  it('builds jagged path with multiple segments', () => {
    const pts = buildJaggedCrack({ x: 100, y: 100 }, 0, 400, 12, 0.8)
    expect(pts.length).toBeGreaterThan(10)
    const path = pointsToSvgPath(pts)
    expect(path).toMatch(/^M/)
    expect(path.split('L').length).toBeGreaterThan(8)
  })

  it('builds crack web with branches', () => {
    const web = buildCrackWeb(960, 540, 1920, 1080)
    expect(web.length).toBeGreaterThan(15)
    expect(web.some(s => s.width < 1.5)).toBe(true)
  })
})
