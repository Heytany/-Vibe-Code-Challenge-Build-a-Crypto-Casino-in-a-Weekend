<template>
  <div
    ref="layerRef"
    class="bw-motion-crack-layer"
    :class="{ 'bw-motion-crack-layer--3d': canUse3d }"
    aria-hidden="true"
  >
    <svg
      v-show="visible"
      ref="svgRef"
      class="bw-motion-crack-svg"
      :viewBox="`0 0 ${size.w} ${size.h}`"
      preserveAspectRatio="none"
    >
      <defs>
        <filter id="bw-crack-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="2" flood-color="#39ff14" flood-opacity="0.45" />
        </filter>
        <linearGradient id="bw-crack-shard-fill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="rgba(245,245,240,0.22)" />
          <stop offset="100%" stop-color="rgba(57,255,20,0.06)" />
        </linearGradient>
      </defs>

      <g v-if="canUse3d" filter="url(#bw-crack-glow)">
        <path
          v-for="(shard, i) in shards"
          :key="`shard-${i}`"
          :ref="(el) => setShardRef(el, i)"
          :d="shard.d"
          fill="url(#bw-crack-shard-fill)"
          stroke="rgba(245,245,240,0.18)"
          stroke-width="0.5"
          :opacity="shard.opacity"
        />
      </g>

      <g filter="url(#bw-crack-glow)">
        <path
          v-for="(stroke, i) in strokes"
          :key="`stroke-${i}`"
          :ref="(el) => setStrokeRef(el, i)"
          :d="stroke.d"
          fill="none"
          :stroke="stroke.highlight ? '#39ff14' : 'rgba(57,255,20,0.55)'"
          :stroke-width="stroke.width"
          stroke-linecap="butt"
          stroke-linejoin="miter"
          stroke-miterlimit="3"
          :opacity="stroke.opacity"
        />
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
/**
 * @agent-context Jagged glass cracks from viewport center — sits BELOW modal layer.
 * @see shared/crack-geometry.ts
 */
import gsap from 'gsap'
import { buildCrackWeb, buildGlassShards, type CrackStroke, type GlassShard } from '~/shared/crack-geometry'

const motionStore = useMotionStore()
const { canUse3d } = useMotionDesktop3d()

const layerRef = ref<HTMLElement | null>(null)
const svgRef = ref<SVGSVGElement | null>(null)
const visible = ref(false)
const size = reactive({ w: 1920, h: 1080 })
const strokes = ref<CrackStroke[]>([])
const shards = ref<GlassShard[]>([])

const strokeEls = ref<(SVGPathElement | null)[]>([])
const shardEls = ref<(SVGPathElement | null)[]>([])

function setStrokeRef(el: unknown, i: number) {
  strokeEls.value[i] = el as SVGPathElement | null
}

function setShardRef(el: unknown, i: number) {
  shardEls.value[i] = el as SVGPathElement | null
}

async function animateCrack() {
  size.w = window.innerWidth
  size.h = window.innerHeight
  const cx = size.w / 2
  const cy = size.h / 2

  strokes.value = buildCrackWeb(cx, cy, size.w, size.h)
  shards.value = canUse3d.value ? buildGlassShards(cx, cy, size.w, size.h) : []
  strokeEls.value = []
  shardEls.value = []
  visible.value = true

  await nextTick()

  if (canUse3d.value && layerRef.value) {
    gsap.fromTo(layerRef.value, { rotateX: 6, scale: 1.04, z: -60 }, {
      rotateX: 0,
      scale: 1,
      z: 0,
      duration: 0.55,
      ease: 'power2.out',
      transformPerspective: 900,
    })
  }

  const paths = strokeEls.value.filter(Boolean) as SVGPathElement[]
  paths.forEach((p, i) => {
    const len = p.getTotalLength()
    const delay = strokes.value[i]?.delay ?? 0
    gsap.set(p, { strokeDasharray: len, strokeDashoffset: len, opacity: 0 })
    gsap.to(p, {
      strokeDashoffset: 0,
      opacity: strokes.value[i]?.opacity ?? 1,
      duration: 0.45 + Math.random() * 0.25,
      delay,
      ease: 'power2.out',
    })
  })

  if (canUse3d.value) {
    const shardPaths = shardEls.value.filter(Boolean) as SVGPathElement[]
    shardPaths.forEach((p, i) => {
      gsap.fromTo(p, { opacity: 0, scale: 0.6 }, {
        opacity: shards.value[i]?.opacity ?? 0.1,
        scale: 1,
        duration: 0.35,
        delay: shards.value[i]?.delay ?? 0.15,
        ease: 'power2.out',
        transformOrigin: 'center center',
      })
    })
  }

  gsap.to(document.body, { x: '+=2', duration: 0.04, repeat: 5, yoyo: true, clearProps: 'x' })

  return gsap.to({}, { duration: 0.65 })
}

function hideCrack() {
  visible.value = false
  strokes.value = []
  shards.value = []
  strokeEls.value = []
  shardEls.value = []
  if (layerRef.value) gsap.set(layerRef.value, { clearProps: 'all' })
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
.bw-motion-crack-layer {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  overflow: hidden;
}

.bw-motion-crack-layer--3d {
  transform-style: preserve-3d;
  transform: translateZ(-40px);
}

.bw-motion-crack-svg {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
