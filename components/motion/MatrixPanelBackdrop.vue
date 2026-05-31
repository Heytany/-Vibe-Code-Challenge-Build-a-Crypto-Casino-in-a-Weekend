<template>
  <div
    ref="rootRef"
    class="bw-matrix-panel-backdrop"
    :class="{ 'is-active': visible }"
    aria-hidden="true"
  >
    <canvas ref="canvasRef" class="bw-matrix-panel-backdrop__canvas" />
    <div class="bw-matrix-panel-backdrop__scan-wrap">
      <div ref="scanlineRef" class="bw-matrix-panel-backdrop__scanline" />
    </div>
    <div v-if="segments > 1" class="bw-mpb__bands">
      <div
        v-for="band in segments"
        :key="band"
        class="bw-mpb__band"
        :class="{ 'is-invert': band % 2 === 0 }"
        :style="{ left: `${((band - 1) / segments) * 100}%`, width: `${100 / segments}%` }"
      >
        <div :ref="(el) => setBandScan(el, band - 1)" class="bw-mpb__band-scan" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * @agent-context Matrix rain scoped to a parent panel — background only, no navigation.
 * Used for dice super-win celebration, and slot wins where playSplit() divides the panel into
 * N vertical bands with alternating normal / inverted code-sweep (2-line → 2 bands, 3-line → 3).
 * @see ai/decisions/017-slot-split-win.md
 */
import gsap from 'gsap'
import { MATRIX_GLYPHS } from '~/shared/motion'

const rootRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const scanlineRef = ref<HTMLElement | null>(null)
const visible = ref(false)
const segments = ref(1)
const bandScans: (HTMLElement | null)[] = []

function setBandScan(el: unknown, i: number) {
  bandScans[i] = el as HTMLElement | null
}

let rafId = 0
let running = false
let columns: { y: number; speed: number; chars: string[] }[] = []
let ctx: CanvasRenderingContext2D | null = null

const FONT_SIZE = 14
const COL_MIN_STEP = 12

let colWidth = COL_MIN_STEP
let logicalW = 0
let logicalH = 0

function resizeCanvas() {
  const canvas = canvasRef.value
  const root = rootRef.value
  if (!canvas || !root) return

  const dpr = window.devicePixelRatio || 1
  logicalW = root.clientWidth
  logicalH = root.clientHeight
  if (logicalW < 1 || logicalH < 1) return

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
    speed: 2 + Math.random() * 5,
    chars: Array.from({ length: 22 }, () => MATRIX_GLYPHS[Math.floor(Math.random() * MATRIX_GLYPHS.length)]),
  }))
}

function drawMatrix() {
  if (!ctx) return
  ctx.fillStyle = 'rgba(10, 10, 10, 0.22)'
  ctx.fillRect(0, 0, logicalW, logicalH)

  const seg = segments.value
  const colCount = columns.length
  columns.forEach((col, i) => {
    const x = (i + 0.5) * colWidth
    // which equal band this column sits in, and its flow direction: down / up / down …
    const band = seg > 1 ? Math.min(seg - 1, Math.floor((i / colCount) * seg)) : 0
    const dir = band % 2 === 1 ? -1 : 1
    col.chars.forEach((char, j) => {
      const y = col.y - j * FONT_SIZE * dir
      if (y < -FONT_SIZE || y > logicalH) return
      ctx!.fillStyle = j === 0 ? '#39ff14' : `rgba(57, 255, 20, ${0.2 + (1 - j / col.chars.length) * 0.5})`
      ctx!.fillText(char, x, y)
    })
    col.y += col.speed * dir
    const span = col.chars.length * FONT_SIZE
    if (dir === 1 && col.y > logicalH + span) {
      col.y = -span
      col.chars = col.chars.map(() => MATRIX_GLYPHS[Math.floor(Math.random() * MATRIX_GLYPHS.length)])
    } else if (dir === -1 && col.y < -span) {
      col.y = logicalH + span
      col.chars = col.chars.map(() => MATRIX_GLYPHS[Math.floor(Math.random() * MATRIX_GLYPHS.length)])
    }
  })
  rafId = requestAnimationFrame(drawMatrix)
}

function stopMatrix() {
  cancelAnimationFrame(rafId)
}

async function play(intense = false): Promise<void> {
  if (running) return
  running = true
  visible.value = true
  await nextTick()

  const canvas = canvasRef.value
  if (!canvas || !rootRef.value) {
    visible.value = false
    running = false
    return
  }

  ctx = canvas.getContext('2d')
  resizeCanvas()
  drawMatrix()

  const scanline = scanlineRef.value
  const root = rootRef.value
  const fadeOutAt = intense ? 1.35 : 0.95
  const fadeDuration = intense ? 0.45 : 0.3

  await new Promise<void>((resolve) => {
    const tl = gsap.timeline({
      onComplete: () => {
        stopMatrix()
        visible.value = false
        running = false
        if (scanline) gsap.set(scanline, { clearProps: 'all' })
        gsap.set(root, { clearProps: 'opacity' })
        resolve()
      },
    })

    tl.fromTo(root, { opacity: 0 }, { opacity: intense ? 1 : 0.82, duration: 0.15 }, 0)

    if (scanline) {
      gsap.set(scanline, {
        left: 0,
        x: 0,
        xPercent: -100,
        scaleX: 0,
        opacity: 0,
        transformOrigin: 'left center',
      })
      tl.fromTo(
        scanline,
        { scaleX: 0, opacity: 0 },
        { scaleX: 1, opacity: intense ? 0.95 : 0.65, duration: 0.3, ease: 'power2.in' },
        0.2,
      )
      tl.fromTo(
        scanline,
        { xPercent: -100 },
        { xPercent: 320, duration: intense ? 0.65 : 0.45, ease: 'power3.inOut' },
        0.35,
      )
      if (intense) {
        tl.fromTo(
          scanline,
          { xPercent: -100 },
          { xPercent: 320, duration: 0.5, ease: 'power3.inOut' },
          0.75,
        )
      }
    }

    tl.to(root, { opacity: 0, duration: fadeDuration, ease: 'power2.in' }, fadeOutAt)
  })
}

/**
 * Slot win celebration: split the backdrop into N EQUAL vertical bands (N = winning lines —
 * pair → 2 bands at 50%, triple → 3 at 33%). Each band is a vertical code stream whose flow
 * direction alternates down / up / down (normal / reverse / normal), with visible dividers.
 * Dice keeps the plain full-panel `play()`.
 */
async function playSplit(seg = 2, intense = false): Promise<void> {
  const n = Math.max(1, Math.min(3, Math.round(seg)))
  if (n <= 1) return play(intense)
  if (running) return
  segments.value = n // drives both the divider bands (template) and per-band rain direction
  running = true
  visible.value = true
  await nextTick()

  const canvas = canvasRef.value
  const root = rootRef.value
  if (!canvas || !root) {
    visible.value = false
    running = false
    segments.value = 1
    return
  }

  ctx = canvas.getContext('2d')
  resizeCanvas()
  drawMatrix()

  const hold = intense ? 1.7 : 1.25

  await new Promise<void>((resolve) => {
    const tl = gsap.timeline({
      onComplete: () => {
        stopMatrix()
        visible.value = false
        running = false
        segments.value = 1
        gsap.set(root, { clearProps: 'opacity' })
        resolve()
      },
    })

    tl.fromTo(root, { opacity: 0 }, { opacity: intense ? 1 : 0.9, duration: 0.18 }, 0)
    tl.to(root, { opacity: 0, duration: intense ? 0.45 : 0.32, ease: 'power2.in' }, hold)
  })
}

defineExpose({ play, playSplit })

onUnmounted(() => {
  stopMatrix()
  running = false
})
</script>

<style scoped>
.bw-matrix-panel-backdrop {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  opacity: 0;
  overflow: hidden;
  background: rgba(10, 10, 10, 0.88);
  border: 3px solid rgba(57, 255, 20, 0.25);
}

.bw-matrix-panel-backdrop__canvas {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
}

.bw-matrix-panel-backdrop__scan-wrap {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.bw-mpb__bands {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 2;
}

.bw-mpb__band {
  position: absolute;
  top: 0;
  bottom: 0;
  overflow: hidden;
  /* equal slices (50% / 33%) — visible dividers so the split reads behind the monster */
  border-left: 2px solid rgba(57, 255, 20, 0.45);
  border-right: 2px solid rgba(57, 255, 20, 0.45);
}

/* even band = reverse flow (handled on the canvas); dividers above make the equal split read */

.bw-mpb__band-scan {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 120%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(57, 255, 20, 0.2) 42%,
    rgba(57, 255, 20, 0.95) 50%,
    rgba(57, 255, 20, 0.2) 58%,
    transparent 100%
  );
  opacity: 0;
  will-change: transform;
}

.bw-matrix-panel-backdrop__scanline {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 42%;
  max-width: 14rem;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(57, 255, 20, 0.2) 42%,
    rgba(57, 255, 20, 0.9) 50%,
    rgba(57, 255, 20, 0.2) 58%,
    transparent 100%
  );
  opacity: 0;
  pointer-events: none;
  will-change: transform;
}
</style>
