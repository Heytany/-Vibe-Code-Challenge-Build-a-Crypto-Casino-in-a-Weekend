/**
 * @agent-context Shared matrix rain canvas — route transition + access denied screen.
 */
import { MATRIX_GLYPHS } from '~/shared/motion'

const FONT_SIZE = 16
const COL_MIN_STEP = 14

export function useMatrixRain(canvasRef: Ref<HTMLCanvasElement | null>) {
  let rafId = 0
  let running = false
  let ctx: CanvasRenderingContext2D | null = null
  let columns: { y: number; speed: number; chars: string[] }[] = []
  let colWidth = COL_MIN_STEP
  let logicalW = 0
  let logicalH = 0

  function resize() {
    const canvas = canvasRef.value
    if (!canvas) return

    const dpr = window.devicePixelRatio || 1
    logicalW = window.innerWidth
    logicalH = window.innerHeight

    canvas.width = Math.floor(logicalW * dpr)
    canvas.height = Math.floor(logicalH * dpr)
    canvas.style.width = `${logicalW}px`
    canvas.style.height = `${logicalH}px`

    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.font = `600 ${FONT_SIZE}px "IBM Plex Mono", monospace`
    }

    const colCount = Math.max(1, Math.ceil(logicalW / COL_MIN_STEP))
    colWidth = logicalW / colCount

    columns = Array.from({ length: colCount }, () => ({
      y: Math.random() * logicalH,
      speed: 3 + Math.random() * 6,
      chars: Array.from({ length: 28 }, () => MATRIX_GLYPHS[Math.floor(Math.random() * MATRIX_GLYPHS.length)]!),
    }))
  }

  function draw() {
    if (!running || !ctx) return

    ctx.fillStyle = 'rgba(10, 10, 10, 0.18)'
    ctx.fillRect(0, 0, logicalW, logicalH)

    columns.forEach((col, i) => {
      const x = (i + 0.5) * colWidth
      col.chars.forEach((char, j) => {
        const y = col.y - j * FONT_SIZE
        if (y < -FONT_SIZE || y > logicalH) return
        ctx!.fillStyle = j === 0 ? '#39ff14' : `rgba(57, 255, 20, ${0.25 + (1 - j / col.chars.length) * 0.55})`
        ctx!.fillText(char, x, y)
      })
      col.y += col.speed
      if (col.y > logicalH + col.chars.length * FONT_SIZE) {
        col.y = -col.chars.length * FONT_SIZE
        col.chars = col.chars.map(() => MATRIX_GLYPHS[Math.floor(Math.random() * MATRIX_GLYPHS.length)]!)
      }
    })

    rafId = requestAnimationFrame(draw)
  }

  function start() {
    const canvas = canvasRef.value
    if (!canvas || running) return
    ctx = canvas.getContext('2d')
    running = true
    resize()
    draw()
  }

  function stop() {
    running = false
    cancelAnimationFrame(rafId)
  }

  function onResize() {
    if (running) resize()
  }

  return { start, stop, onResize }
}
