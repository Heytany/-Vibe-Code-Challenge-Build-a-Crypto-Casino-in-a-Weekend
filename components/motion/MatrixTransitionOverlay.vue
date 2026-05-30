<template>
  <Teleport to="body">
    <div
      v-show="visible"
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
 */
import gsap from 'gsap'
import { MATRIX_GLYPHS, MOTION_DURATIONS } from '~/shared/motion'

const motionStore = useMotionStore()
const router = useRouter()

const rootRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const scanlineRef = ref<HTMLElement | null>(null)
const slicesRef = ref<HTMLElement | null>(null)
const visible = ref(false)
const sliceCount = 5

let rafId = 0
let columns: { y: number; speed: number; chars: string[] }[] = []
let ctx: CanvasRenderingContext2D | null = null

function resizeCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  const colCount = Math.min(40, Math.floor(canvas.width / 18))
  columns = Array.from({ length: colCount }, () => ({
    y: Math.random() * canvas.height,
    speed: 2 + Math.random() * 4,
    chars: Array.from({ length: 24 }, () => MATRIX_GLYPHS[Math.floor(Math.random() * MATRIX_GLYPHS.length)]),
  }))
}

function drawMatrix() {
  const canvas = canvasRef.value
  if (!canvas || !ctx) return
  ctx.fillStyle = 'rgba(10, 10, 10, 0.12)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.font = '14px IBM Plex Mono, monospace'
  const fontSize = 16
  columns.forEach((col, i) => {
    const x = i * 18
    col.chars.forEach((char, j) => {
      const y = col.y - j * fontSize
      if (y < 0 || y > canvas.height) return
      ctx!.fillStyle = j === 0 ? '#39ff14' : `rgba(57, 255, 20, ${0.15 + (1 - j / col.chars.length) * 0.6})`
      ctx!.fillText(char, x, y)
    })
    col.y += col.speed
    if (col.y > canvas.height + col.chars.length * fontSize) {
      col.y = -col.chars.length * fontSize
      col.chars = col.chars.map(() => MATRIX_GLYPHS[Math.floor(Math.random() * MATRIX_GLYPHS.length)])
    }
  })
  rafId = requestAnimationFrame(drawMatrix)
}

function stopMatrix() {
  cancelAnimationFrame(rafId)
}

async function runTransition() {
  const target = motionStore.matrixTarget
  if (!target || !rootRef.value) {
    motionStore.cancelMatrix()
    return
  }

  visible.value = true
  await nextTick()

  const canvas = canvasRef.value
  if (canvas) {
    ctx = canvas.getContext('2d')
    resizeCanvas()
    drawMatrix()
  }

  const mainEl = document.querySelector('main')
  const slices = slicesRef.value?.querySelectorAll('.bw-motion-slice') ?? []

  const tl = gsap.timeline({
    onComplete: () => {
      stopMatrix()
      visible.value = false
      motionStore.finishMatrix((to) => router.push(to))
      if (mainEl) gsap.set(mainEl, { clearProps: 'all' })
    },
    onInterrupt: () => {
      stopMatrix()
      visible.value = false
      motionStore.cancelMatrix()
    },
  })

  tl.fromTo(rootRef.value, { opacity: 0 }, { opacity: 1, duration: 0.15 }, 0)

  if (mainEl && slices.length) {
    const rect = mainEl.getBoundingClientRect()
    const sliceH = rect.height / sliceCount
    slices.forEach((slice, i) => {
      const el = slice as HTMLElement
      el.style.height = `${sliceH}px`
      el.style.top = `${rect.top + i * sliceH}px`
    })
    tl.to(slices, {
      x: () => (Math.random() > 0.5 ? 1 : -1) * (40 + Math.random() * 80),
      duration: 0.35,
      stagger: 0.06,
      ease: 'power2.inOut',
    }, 0.3)
    tl.to(mainEl, { opacity: 0.2, filter: 'hue-rotate(90deg)', duration: 0.4 }, 0.35)
  }

  if (scanlineRef.value) {
    gsap.set(scanlineRef.value, { x: '-100%', opacity: 1 })
    tl.to(scanlineRef.value, { x: '100%', duration: 0.5, ease: 'power3.inOut' }, 0.7)
  }

  tl.to(rootRef.value, { opacity: 0, duration: 0.25 }, MOTION_DURATIONS.route - 0.25)
}

watch(
  () => motionStore.matrixTarget,
  (target) => {
    if (target && motionStore.activeOverlay === 'matrix') runTransition()
  },
)

onUnmounted(() => stopMatrix())
</script>

<style scoped>
.bw-motion-overlay {
  position: fixed;
  inset: 0;
  z-index: var(--bw-motion-overlay-z, 500);
  pointer-events: all;
  background: var(--bw-bg);
}

.bw-motion-matrix-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
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
    rgba(57, 255, 20, 0.35) 45%,
    rgba(57, 255, 20, 0.8) 50%,
    rgba(57, 255, 20, 0.35) 55%,
    transparent 100%
  );
  opacity: 0;
  pointer-events: none;
}

.bw-motion-slices {
  pointer-events: none;
}

.bw-motion-slice {
  position: fixed;
  left: 0;
  width: 100%;
  background: var(--bw-bg);
  border-bottom: 1px solid rgba(57, 255, 20, 0.2);
  opacity: 0.85;
}
</style>
