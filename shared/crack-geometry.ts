/** @agent-context Procedural jagged crack paths for ScreenCrackOverlay */

export interface Point {
  x: number
  y: number
}

export interface CrackStroke {
  d: string
  width: number
  opacity: number
  delay: number
  highlight?: boolean
}

export interface GlassShard {
  d: string
  opacity: number
  delay: number
}

export function buildJaggedCrack(
  start: Point,
  directionRad: number,
  length: number,
  segments = 14,
  jitter = 0.7,
): Point[] {
  const points: Point[] = [start]
  let x = start.x
  let y = start.y
  let angle = directionRad
  const baseStep = length / segments

  for (let i = 0; i < segments; i++) {
    const t = i / segments
    const step = baseStep * (0.5 + Math.random() * 0.95) * (1 - t * 0.12)
    angle += (Math.random() - 0.5) * jitter
    x += Math.cos(angle) * step
    y += Math.sin(angle) * step
    points.push({ x, y })
  }

  return points
}

export function pointsToSvgPath(points: Point[]): string {
  if (points.length === 0) return ''
  return points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ')
}

export function buildCrackWeb(
  cx: number,
  cy: number,
  viewportW: number,
  viewportH: number,
): CrackStroke[] {
  const maxDim = Math.max(viewportW, viewportH)
  const mainCount = 9 + Math.floor(Math.random() * 3)
  const strokes: CrackStroke[] = []

  for (let i = 0; i < mainCount; i++) {
    const angle = (i / mainCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.55
    const len = maxDim * (0.38 + Math.random() * 0.32)
    const main = buildJaggedCrack({ x: cx, y: cy }, angle, len, 18, 0.75)

    strokes.push({
      d: pointsToSvgPath(main),
      width: 2.2 + Math.random() * 1.8,
      opacity: 0.9,
      delay: i * 0.028,
      highlight: true,
    })

    strokes.push({
      d: pointsToSvgPath(main),
      width: 0.6 + Math.random() * 0.4,
      opacity: 0.35,
      delay: i * 0.028 + 0.04,
    })

    if (main.length > 7) {
      const branchIdx = 4 + Math.floor(Math.random() * (main.length - 6))
      const branchStart = main[branchIdx]!
      const branchAngle = angle + (Math.random() > 0.5 ? 1 : -1) * (0.35 + Math.random() * 0.75)
      const branchLen = len * (0.18 + Math.random() * 0.28)
      const branch = buildJaggedCrack(branchStart, branchAngle, branchLen, 9, 0.95)
      strokes.push({
        d: pointsToSvgPath(branch),
        width: 1 + Math.random() * 0.8,
        opacity: 0.55 + Math.random() * 0.25,
        delay: i * 0.028 + 0.06,
      })
    }

    if (main.length > 10 && Math.random() > 0.45) {
      const forkIdx = 7 + Math.floor(Math.random() * (main.length - 8))
      const forkStart = main[forkIdx]!
      const forkAngle = angle + (Math.random() - 0.5) * 1.4
      const forkLen = len * (0.12 + Math.random() * 0.18)
      const fork = buildJaggedCrack(forkStart, forkAngle, forkLen, 6, 1.1)
      strokes.push({
        d: pointsToSvgPath(fork),
        width: 0.8 + Math.random() * 0.5,
        opacity: 0.4,
        delay: i * 0.028 + 0.1,
      })
    }
  }

  return strokes
}

export function buildGlassShards(
  cx: number,
  cy: number,
  viewportW: number,
  viewportH: number,
  count = 8,
): GlassShard[] {
  const maxDim = Math.max(viewportW, viewportH)
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.8
    const dist = maxDim * (0.04 + Math.random() * 0.09)
    const size = maxDim * (0.025 + Math.random() * 0.04)
    const origin = {
      x: cx + Math.cos(angle) * dist,
      y: cy + Math.sin(angle) * dist,
    }
    const spread = angle + (Math.random() - 0.5) * 0.9
    const w = size * (0.8 + Math.random())
    const h = size * (0.35 + Math.random() * 0.45)
    const c = Math.cos(spread)
    const s = Math.sin(spread)
    const p2 = { x: origin.x + c * w, y: origin.y + s * w }
    const p3 = { x: p2.x - s * h, y: p2.y + c * h }
    const p4 = { x: origin.x - s * h * 0.35, y: origin.y + c * h * 0.35 }
    return {
      d: `M ${origin.x.toFixed(1)} ${origin.y.toFixed(1)} L ${p2.x.toFixed(1)} ${p2.y.toFixed(1)} L ${p3.x.toFixed(1)} ${p3.y.toFixed(1)} L ${p4.x.toFixed(1)} ${p4.y.toFixed(1)} Z`,
      opacity: 0.08 + Math.random() * 0.14,
      delay: 0.12 + i * 0.025,
    }
  })
}
