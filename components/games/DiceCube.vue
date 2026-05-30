<template>
  <div
    ref="cubeRef"
    class="bw-dice-cube"
    :class="{
      'is-rolling': rolling,
      'is-win': !rolling && won === true,
      'is-lose': !rolling && won === false,
    }"
  >
    <div class="bw-dice-cube__scene">
      <div class="bw-dice-cube__body">
        <div class="bw-dice-cube__face bw-dice-cube__face--front">
          <p class="bw-dice-cube__label">
            <UiLocaleText path="games.dice.roll" tag="span" />
          </p>
          <UiGlitchText
            tag="p"
            :glitching="!rolling && won === true"
            class="bw-dice-cube__value font-bold bw-accent"
          >
            {{ displayValue }}
          </UiGlitchText>
        </div>

        <div class="bw-dice-cube__face bw-dice-cube__face--back" aria-hidden="true">
          <span class="bw-dice-cube__tag">RNG</span>
          <div class="bw-dice-cube__stripes">
            <span /><span /><span /><span />
          </div>
        </div>

        <div class="bw-dice-cube__face bw-dice-cube__face--right" aria-hidden="true">
          <div class="bw-dice-cube__pip-grid">
            <span v-for="n in 9" :key="`r-${n}`" :class="{ on: n % 2 === 1 }" />
          </div>
        </div>

        <div class="bw-dice-cube__face bw-dice-cube__face--left" aria-hidden="true">
          <div class="bw-dice-cube__pip-grid bw-dice-cube__pip-grid--alt">
            <span v-for="n in 9" :key="`l-${n}`" :class="{ on: n === 1 || n === 5 || n === 9 }" />
          </div>
        </div>

        <div class="bw-dice-cube__face bw-dice-cube__face--top" aria-hidden="true">
          <div class="bw-dice-cube__cross" />
        </div>

        <div class="bw-dice-cube__face bw-dice-cube__face--bottom" aria-hidden="true">
          <span class="bw-dice-cube__tag">0–99</span>
        </div>
      </div>
      <div class="bw-dice-cube__shadow" aria-hidden="true" />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * @agent-context 3D CSS cube the lobby monster rolls — front face shows 0–99 result.
 * GSAP animates `.bw-dice-cube__body` inside the root ref.
 */
const props = defineProps<{
  value: number | null
  rolling: boolean
  won: boolean | null
}>()

const cubeRef = ref<HTMLElement | null>(null)
const flicker = ref<number | null>(null)
let flickerTimer: ReturnType<typeof setInterval> | null = null

const displayValue = computed(() => {
  if (props.rolling) return flicker.value ?? '··'
  if (props.value !== null) return props.value
  return '—'
})

watch(
  () => props.rolling,
  (isRolling) => {
    if (flickerTimer) {
      clearInterval(flickerTimer)
      flickerTimer = null
    }
    if (!isRolling) {
      flicker.value = null
      return
    }
    flicker.value = Math.floor(Math.random() * 100)
    flickerTimer = setInterval(() => {
      flicker.value = Math.floor(Math.random() * 100)
    }, 70)
  },
  { immediate: true },
)

onUnmounted(() => {
  if (flickerTimer) clearInterval(flickerTimer)
})
</script>
