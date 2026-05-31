<template>
  <section class="bw-wheel-banner bw-panel bw-panel--broken max-w-xl mx-auto w-full">
    <div class="bw-wheel-banner__art" aria-hidden="true">
      <span class="bw-wheel-banner__wheel">◉</span>
      <span class="bw-wheel-banner__ko">x_x</span>
    </div>
    <div class="bw-wheel-banner__body">
      <UiLocaleText path="games.wheel.title" tag="p" class="font-bold uppercase bw-accent" />
      <UiLocaleText path="games.wheel.slogan" tag="p" class="text-sm" />
      <p class="text-xs font-mono text-[var(--bw-muted)] mt-1">
        <UiLocaleText path="games.wheel.prizeFund" />: <span class="bw-accent">{{ faucetRemaining ?? '—' }} WIBE</span>
        · <UiLocaleText path="games.wheel.bannerHint" />
      </p>
    </div>
    <button
      type="button"
      class="bw-btn bw-wheel-banner__cta"
      :class="{ 'bg-[var(--bw-accent)] text-[var(--bw-bg)]': !poolEmpty }"
      :disabled="poolEmpty || motionStore.isLocked"
      @click="goWheel"
    >
      <UiLocaleText :path="poolEmpty ? 'games.wheel.poolEmpty' : 'games.wheel.bannerCta'" />
    </button>
  </section>
</template>

<script setup lang="ts">
/**
 * @agent-context Lobby banner → WIBE Wheel faucet. Disabled when the prize pool is drained.
 * @see components/games/WheelGame.vue, composables/useWheel.ts
 */
const { playRouteTransition } = useBrutalMotion()
const motionStore = useMotionStore()
const { faucetRemaining, poolEmpty, refreshFaucet } = useWheel()

onMounted(() => refreshFaucet())

function goWheel() {
  if (poolEmpty.value) return
  playRouteTransition('/games/wheel', 'matrix')
}
</script>

<style scoped>
.bw-wheel-banner {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  flex-wrap: wrap;
}

.bw-wheel-banner__art {
  position: relative;
  display: grid;
  place-items: center;
  flex: none;
}

.bw-wheel-banner__wheel {
  font-size: 2.6rem;
  color: var(--bw-accent);
  animation: bw-wheel-banner-spin 6s linear infinite;
}

.bw-wheel-banner__ko {
  position: absolute;
  bottom: -2px;
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--bw-fg);
}

.bw-wheel-banner__body {
  flex: 1 1 12rem;
  min-width: 0;
}

.bw-wheel-banner__cta {
  flex: 1 1 100%;
  text-align: center;
}

@media (min-width: 640px) {
  .bw-wheel-banner__cta {
    flex: 0 0 auto;
  }
}

@keyframes bw-wheel-banner-spin {
  to { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
  .bw-wheel-banner__wheel { animation: none; }
}
</style>
