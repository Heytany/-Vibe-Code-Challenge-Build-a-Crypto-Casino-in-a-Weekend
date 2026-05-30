<template>
  <Teleport to="body">
    <svg
      v-show="visible"
      ref="svgRef"
      class="bw-motion-crack-svg"
      :viewBox="`0 0 ${size.w} ${size.h}`"
      aria-hidden="true"
    >
      <path
        v-for="(d, i) in paths"
        :key="i"
        :d="d"
        fill="none"
        stroke="#39ff14"
        stroke-width="2"
        stroke-linecap="square"
      />
    </svg>
  </Teleport>
</template>

<script setup lang="ts">
/**
 * @agent-context Radial crack lines from viewport center — used with BrutalCrackModal.
 */
import gsap from 'gsap'

const motionStore = useMotionStore()
const visible = ref(false)
const svgRef = ref<SVGSVGElement | null>(null)
const size = reactive({ w: 1920, h: 1080 })
const paths = ref<string[]>([])

function buildCrackPaths(cx: number, cy: number) {
  const count = 10
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.4
    const len = Math.max(size.w, size.h) * (0.35 + Math.random() * 0.25)
    const midX = cx + Math.cos(angle) * len * 0.45 + (Math.random() - 0.5) * 40
    const midY = cy + Math.sin(angle) * len * 0.45 + (Math.random() - 0.5) * 40
    const endX = cx + Math.cos(angle) * len
    const endY = cy + Math.sin(angle) * len
    return `M ${cx} ${cy} Q ${midX} ${midY} ${endX} ${endY}`
  })
}

async function animateCrack() {
  size.w = window.innerWidth
  size.h = window.innerHeight
  const cx = size.w / 2
  const cy = size.h / 2
  paths.value = buildCrackPaths(cx, cy)
  visible.value = true
  await nextTick()

  const pathsEls = svgRef.value?.querySelectorAll('path') ?? []
  pathsEls.forEach((p) => {
    const len = p.getTotalLength()
    gsap.set(p, { strokeDasharray: len, strokeDashoffset: len })
  })

  gsap.to(document.body, { x: '+=2', duration: 0.04, repeat: 5, yoyo: true, clearProps: 'x' })

  return gsap.to(pathsEls, {
    strokeDashoffset: 0,
    duration: 0.55,
    stagger: 0.04,
    ease: 'power3.out',
  })
}

function hideCrack() {
  visible.value = false
  paths.value = []
}

defineExpose({ animateCrack, hideCrack })

watch(
  () => motionStore.crackPhase,
  async (phase, prev) => {
    if (phase === 'opening' && prev !== 'opening') {
      await animateCrack()
      setTimeout(() => motionStore.runCrackConnect(), 450)
    }
    if (phase === 'closing' || (phase === 'idle' && prev !== 'idle')) {
      hideCrack()
    }
  },
)
</script>

<style scoped>
.bw-motion-crack-svg {
  position: fixed;
  inset: 0;
  z-index: calc(var(--bw-motion-overlay-z, 500) + 1);
  width: 100%;
  height: 100%;
  pointer-events: none;
}
</style>
