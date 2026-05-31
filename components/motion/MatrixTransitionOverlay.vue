<template>
  <Teleport to="body">
    <div
      v-if="visible"
      ref="rootRef"
      class="bw-motion-overlay"
      aria-hidden="true"
    >
      <canvas ref="canvasRef" class="bw-motion-matrix-canvas" />
      <div ref="scanlineRef" class="bw-motion-scanline" />
      <div ref="slicesRef" class="bw-motion-slices">
        <div v-for="i in sliceCount" :key="i" class="bw-motion-slice" />
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
/**
 * @agent-context Full-screen matrix rain + glitch wipe before route change.
 * @see ai/specs/ui-motion.md
 * @failure-modes: overlay mount fail → finishMatrix still navigates
 */
import gsap from 'gsap'
import { MATRIX_GLYPHS, MOTION_DURATIONS, getVisualViewport } from '~/shared/motion'

const motionStore = useMotionStore()
const router = useRouter()

const rootRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const scanlineRef = ref<HTMLElement | null>(null)
const slicesRef = ref<HTMLElement | null>(null)
const visible = ref(false)
const sliceCount = 5

// Pin the overlay to the visible screen (iOS visual viewport ≠ layout viewport).
const { apply: anchorOverlay } = useViewportAnchor(rootRef, visible)

let rafId = 0
let running = false
let columns: { y: number; speed: number; chars: string[] }[] = []
let ctx: CanvasRenderingContext2D | null = null

const FONT_SIZE = 16
const COL_MIN_STEP = 14

let colWidth = COL_MIN_STEP
let logicalW = 0
let logicalH = 0

function resizeCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return

  const dpr = window.devicePixelRatio || 1
  const vp = getVisualViewport()
  logicalW = vp.width
  logicalH = vp.height

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
    chars: Array.from({ length: 28 }, () => MATRIX_GLYPHS[Math.floor(Math.random() * MATRIX_GLYPHS.length)]),
  }))
}

function drawMatrix() {
  const canvas = canvasRef.value
  if (!canvas || !ctx) return

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
      col.chars = col.chars.map(() => MATRIX_GLYPHS[Math.floor(Math.random() * MATRIX_GLYPHS.length)])
    }
  })
  rafId = requestAnimationFrame(drawMatrix)
}

function stopMatrix() {
  cancelAnimationFrame(rafId)
}

function completeTransition() {
  if (!running) return
  stopMatrix()
  visible.value = false
  running = false
  const mainEl = document.querySelector('main')
  if (mainEl) gsap.set(mainEl, { clearProps: 'all' })
  motionStore.finishMatrix((to) => router.push(to))
}

async function runTransition() {
  const target = motionStore.matrixTarget
  if (!target || running) return

  running = true
  visible.value = true
  await nextTick()

  if (!rootRef.value) {
    console.warn('[matrix-transition] overlay mount failed — navigating immediately')
    completeTransition()
    return
  }

  anchorOverlay()

  const canvas = canvasRef.value
  if (canvas) {
    ctx = canvas.getContext('2d')
    resizeCanvas()
    drawMatrix()
  }

  const mainEl = document.querySelector('main')
  const slices = slicesRef.value?.querySelectorAll('.bw-motion-slice') ?? []

  const failsafe = window.setTimeout(() => {
    if (running) {
      console.warn('[matrix-transition] failsafe navigate')
      completeTransition()
    }
  }, 2500)

  const tl = gsap.timeline({
    onComplete: () => {
      window.clearTimeout(failsafe)
      completeTransition()
    },
  })

  tl.fromTo(rootRef.value, { opacity: 0 }, { opacity: 1, duration: 0.12 }, 0)

  if (slices.length) {
    // distribute glitch bars across the FULL visible screen (not the main element)
    const sliceH = logicalH / sliceCount
    slices.forEach((slice, i) => {
      const el = slice as HTMLElement
      el.style.height = `${sliceH}px`
      el.style.top = `${i * sliceH}px`
    })
    tl.to(slices, {
      x: () => (Math.random() > 0.5 ? 1 : -1) * (50 + Math.random() * 100),
      duration: 0.4,
      stagger: 0.05,
      ease: 'power3.inOut',
    }, 0.25)
  }

  if (mainEl) {
    tl.to(mainEl, { opacity: 0.15, filter: 'hue-rotate(90deg) contrast(1.4)', duration: 0.45 }, 0.3)
  }

  if (scanlineRef.value) {
    gsap.set(scanlineRef.value, { x: 0, scaleX: 0, opacity: 0, transformOrigin: 'left center' })
    tl.fromTo(
      scanlineRef.value,
      { scaleX: 0, opacity: 0 },
      { scaleX: 1, opacity: 1, duration: 0.35, ease: 'power2.in' },
      0.55,
    )
    tl.fromTo(
      scanlineRef.value,
      { x: '-100%' },
      { x: '100%', duration: 0.45, ease: 'power3.inOut' },
      0.75,
    )
  }

  tl.to(rootRef.value, { opacity: 0, duration: 0.2 }, MOTION_DURATIONS.route - 0.2)
}

watch(
  () => motionStore.activeOverlay === 'matrix' && motionStore.matrixTarget,
  (active) => {
    if (active) runTransition()
  },
)

onUnmounted(() => {
  stopMatrix()
  running = false
})
</script>

<style scoped>
.bw-motion-overlay {
  position: fixed;
  top: 0;
  left: 0;
  /* JS (useViewportAnchor) sets exact px width/height/transform from the visual viewport;
     these are the pre-JS fallback so the overlay always covers the screen. */
  width: 100%;
  height: 100vh;
  height: 100dvh;
  transform-origin: top left;
  z-index: var(--bw-motion-overlay-z, 500);
  pointer-events: all;
  background: rgba(10, 10, 10, 0.92);
}

.bw-motion-matrix-canvas {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.bw-motion-scanline {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(57, 255, 20, 0.25) 42%,
    rgba(57, 255, 20, 0.95) 50%,
    rgba(57, 255, 20, 0.25) 58%,
    transparent 100%
  );
  opacity: 0;
  pointer-events: none;
  will-change: transform, opacity;
}

.bw-motion-slices {
  pointer-events: none;
}

.bw-motion-slice {
  position: absolute;
  left: 0;
  width: 100%;
  background: rgba(10, 10, 10, 0.75);
  border-bottom: 2px solid rgba(57, 255, 20, 0.35);
  opacity: 0.9;
  will-change: transform;
}
</style>
