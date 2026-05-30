<template>
  <div
    ref="rootRef"
    class="bw-access-denied"
    role="alert"
    aria-live="assertive"
  >
    <canvas ref="canvasRef" class="bw-access-denied__matrix" aria-hidden="true" />
    <div ref="scanlineRef" class="bw-access-denied__scanline" aria-hidden="true" />
    <div ref="slicesRef" class="bw-access-denied__slices" aria-hidden="true">
      <div v-for="i in sliceCount" :key="i" class="bw-access-denied__slice" />
    </div>

    <div class="bw-access-denied__center">
      <UiDancingText
        tag="h1"
        class-name="bw-access-denied__title font-bold uppercase bw-accent"
        :text="titleText"
      />
      <p v-if="hintText" class="bw-access-denied__hint font-mono text-sm text-[var(--bw-muted)]">
        {{ hintText }}
      </p>
      <button type="button" class="bw-btn bw-access-denied__back mt-8" @click="emit('exit')">
        <UiLocaleText path="errors.back" tag="span" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * @agent-context Full-screen access denied — eternal matrix + looping route-glitch + dancing title.
 */
import gsap from 'gsap'

const props = withDefaults(
  defineProps<{
    statusCode?: number
  }>(),
  { statusCode: 403 },
)

const emit = defineEmits<{ exit: [] }>()

const { t } = useI18n()
const prefersReducedMotion = usePrefersReducedMotion()

const rootRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const scanlineRef = ref<HTMLElement | null>(null)
const slicesRef = ref<HTMLElement | null>(null)
const sliceCount = 5

const { start, stop, onResize } = useMatrixRain(canvasRef)

const titleText = computed(() => t('errors.ACCESS_DENIED'))
const hintText = computed(() =>
  t('errors.pageHint', { code: props.statusCode ?? '???' }),
)

let glitchTl: gsap.core.Timeline | null = null

function layoutSlices() {
  const slices = slicesRef.value?.querySelectorAll('.bw-access-denied__slice') ?? []
  const h = window.innerHeight
  const sliceH = Math.max(h / sliceCount, 48)
  slices.forEach((slice, i) => {
    const el = slice as HTMLElement
    el.style.height = `${sliceH}px`
    el.style.top = `${i * sliceH}px`
  })
}

function startGlitchLoop() {
  if (prefersReducedMotion.value || !slicesRef.value || !scanlineRef.value) return

  layoutSlices()
  const slices = slicesRef.value.querySelectorAll('.bw-access-denied__slice')

  glitchTl?.kill()
  glitchTl = gsap.timeline({ repeat: -1, repeatDelay: 0.85 })

  glitchTl.fromTo(
    scanlineRef.value,
    { scaleX: 0, opacity: 0, transformOrigin: 'left center' },
    { scaleX: 1, opacity: 1, duration: 0.28, ease: 'power2.in' },
    0,
  )
  glitchTl.fromTo(
    scanlineRef.value,
    { x: '-100%' },
    { x: '100%', duration: 0.42, ease: 'power3.inOut' },
    0.15,
  )
  glitchTl.to(
    slices,
    {
      x: () => (Math.random() > 0.5 ? 1 : -1) * (40 + Math.random() * 90),
      duration: 0.38,
      stagger: 0.04,
      ease: 'power3.inOut',
    },
    0.08,
  )
  glitchTl.to(slices, { x: 0, duration: 0.25, stagger: 0.03, ease: 'power2.out' }, 0.5)
  glitchTl.to(scanlineRef.value, { opacity: 0, duration: 0.18 }, 0.55)
}

onMounted(() => {
  start()
  startGlitchLoop()
  window.addEventListener('resize', onResize)
  window.addEventListener('resize', layoutSlices)
})

onUnmounted(() => {
  stop()
  glitchTl?.kill()
  window.removeEventListener('resize', onResize)
  window.removeEventListener('resize', layoutSlices)
})
</script>

<style scoped>
.bw-access-denied {
  position: fixed;
  inset: 0;
  z-index: calc(var(--bw-motion-overlay-z, 500) + 10);
  background: rgba(10, 10, 10, 0.94);
  overflow: hidden;
}

.bw-access-denied__matrix {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.bw-access-denied__scanline {
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(
    90deg,
    transparent,
    var(--bw-accent) 45%,
    var(--bw-accent) 55%,
    transparent
  );
  opacity: 0;
  pointer-events: none;
  z-index: 2;
}

.bw-access-denied__slices {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
}

.bw-access-denied__slice {
  position: absolute;
  left: 0;
  width: 100%;
  background: color-mix(in srgb, var(--bw-accent) 6%, transparent);
  border-top: 1px solid color-mix(in srgb, var(--bw-accent) 18%, transparent);
  border-bottom: 1px solid color-mix(in srgb, var(--bw-fg) 12%, transparent);
}

.bw-access-denied__center {
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1.5rem;
  max-width: min(92vw, 28rem);
  animation: bw-access-float 3.4s ease-in-out infinite;
}

.bw-access-denied__title {
  margin: 0;
  font-size: clamp(1.75rem, 7vw, 2.75rem);
  line-height: 1.15;
  letter-spacing: 0.06em;
  text-shadow: 4px 4px 0 var(--bw-fg);
}

.bw-access-denied__hint {
  margin: 1rem 0 0;
  white-space: normal;
}

.bw-access-denied__back {
  min-width: 11rem;
}

@keyframes bw-access-float {
  0%, 100% { transform: translate(-50%, -50%) translateY(0); }
  50% { transform: translate(-50%, -50%) translateY(-12px); }
}

@media (prefers-reduced-motion: reduce) {
  .bw-access-denied__center {
    animation: none;
    transform: translate(-50%, -50%);
  }
}
</style>
