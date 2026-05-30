<template>
  <div
    ref="banditRef"
    class="bw-slot-bandit"
    :class="{
      'bw-slot-bandit--bare': bare,
      'is-spinning': spinning,
      'is-win': !spinning && won === true,
      'is-lose': !spinning && won === false,
      'is-settled': !spinning && reels !== null,
    }"
  >
    <div v-if="!bare" class="bw-slot-bandit__cabinet">
      <p class="bw-slot-bandit__label">
        <UiLocaleText path="games.slot.reels" tag="span" />
      </p>
      <div class="bw-slot-bandit__reels">
        <div
          v-for="i in 3"
          :key="i"
          class="bw-slot-bandit__reel"
          :class="`bw-slot-bandit__reel--${i}`"
        >
          <div class="bw-slot-bandit__reel-scene">
            <div class="bw-slot-bandit__reel-flip">
              <div class="bw-slot-bandit__reel-face bw-slot-bandit__reel-face--front">
                <UiGlitchText
                  tag="span"
                  :glitching="!spinning && won === true"
                  class="bw-slot-bandit__symbol font-bold"
                >
                  {{ displayFace(i - 1, 'front') }}
                </UiGlitchText>
              </div>
              <div class="bw-slot-bandit__reel-face bw-slot-bandit__reel-face--back" aria-hidden="true">
                <span class="bw-slot-bandit__symbol font-bold">
                  {{ displayFace(i - 1, 'back') }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="bw-slot-bandit__reels bw-slot-bandit__reels--bare">
      <div
        v-for="i in 3"
        :key="i"
        class="bw-slot-bandit__reel"
        :class="`bw-slot-bandit__reel--${i}`"
      >
        <div class="bw-slot-bandit__reel-scene">
          <div class="bw-slot-bandit__reel-flip">
            <div class="bw-slot-bandit__reel-face bw-slot-bandit__reel-face--front">
              <UiGlitchText
                tag="span"
                :glitching="!spinning && won === true"
                class="bw-slot-bandit__symbol font-bold"
              >
                {{ displayFace(i - 1, 'front') }}
              </UiGlitchText>
            </div>
            <div class="bw-slot-bandit__reel-face bw-slot-bandit__reel-face--back" aria-hidden="true">
              <span class="bw-slot-bandit__symbol font-bold">
                {{ displayFace(i - 1, 'back') }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * @agent-context Reel windows — 3D flip per cell while spinning; `bare` = monster head mount.
 */
import { slotSymbolChar } from '~/composables/useGameSlot'

const props = withDefaults(
  defineProps<{
    reels: [number, number, number] | null
    spinning: boolean
    won: boolean | null
    /** Head mount: reels only, no cabinet chrome */
    bare?: boolean
  }>(),
  { bare: false },
)

const banditRef = ref<HTMLElement | null>(null)

interface ReelFaces {
  front: string
  back: string
}

const GLITCH_CHARS = ['7', 'X', '#', '?', '!', '0']

const idleFaces = (): ReelFaces => ({ front: '—', back: '—' })

const flicker = ref<[ReelFaces, ReelFaces, ReelFaces]>([
  idleFaces(),
  idleFaces(),
  idleFaces(),
])

let flickerTimer: ReturnType<typeof setInterval> | null = null

function randomSymbol(): string {
  return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]!
}

function randomFaces(): ReelFaces {
  return { front: randomSymbol(), back: randomSymbol() }
}

function settledFaces(index: number): ReelFaces {
  const sym = props.reels ? slotSymbolChar(props.reels[index]) : '—'
  return { front: sym, back: sym }
}

function displayFace(index: number, side: 'front' | 'back'): string {
  if (props.spinning) return flicker.value[index]?.[side] ?? '?'
  return settledFaces(index)[side]
}

watch(
  () => props.spinning,
  (isSpinning) => {
    if (flickerTimer) {
      clearInterval(flickerTimer)
      flickerTimer = null
    }
    if (!isSpinning) return
    flicker.value = [0, 1, 2].map((index) => {
      const current = props.reels ? slotSymbolChar(props.reels[index]) : '—'
      return { front: current, back: randomSymbol() }
    }) as [ReelFaces, ReelFaces, ReelFaces]
    flickerTimer = setInterval(() => {
      flicker.value = [randomFaces(), randomFaces(), randomFaces()]
    }, 150)
  },
  { immediate: true },
)

onUnmounted(() => {
  if (flickerTimer) clearInterval(flickerTimer)
})
</script>
