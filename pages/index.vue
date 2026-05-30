<template>
  <div class="space-y-10">
    <section class="space-y-4">
      <UiGlitchText tag="h1" :glitching="true" class="text-4xl md:text-5xl font-bold uppercase tracking-tight">
        {{ t('lobby.title') }}
      </UiGlitchText>
      <p class="text-[var(--bw-muted)] max-w-2xl whitespace-normal">
        {{ t('lobby.subtitle') }}
      </p>
      <WalletBalanceDisplay />
    </section>

    <section class="grid gap-6 md:grid-cols-2">
      <button
        v-for="game in games"
        :key="game.to"
        type="button"
        class="bw-panel bw-panel--broken p-6 block text-left w-full text-[var(--bw-fg)] hover:bg-[var(--bw-accent)] hover:text-[var(--bw-bg)] transition-colors group"
        :class="game.tilt"
        :disabled="motionStore.isLocked"
        @click="goToGame(game.to)"
      >
        <span class="text-xs text-[var(--bw-muted)] group-hover:text-[var(--bw-bg)] font-mono">
          {{ t(game.statusKey) }}
        </span>
        <h2 class="text-2xl font-bold uppercase mt-2 mb-3">
          {{ t(game.titleKey) }}
        </h2>
        <p class="text-sm whitespace-normal opacity-80">
          {{ t(game.descKey) }}
        </p>
      </button>
    </section>
  </div>
</template>

<script setup lang="ts">
/**
 * @agent-context Lobby — matrix GSAP transition on game card click.
 * @see composables/useBrutalMotion.ts
 */
const { t } = useI18n()
const { playRouteTransition } = useBrutalMotion()
const motionStore = useMotionStore()

const games = [
  {
    to: '/games/dice',
    titleKey: 'games.dice.title',
    descKey: 'games.dice.desc',
    statusKey: 'lobby.status.wip',
    tilt: 'bw-broken-tilt',
  },
  {
    to: '/games/slot',
    titleKey: 'games.slot.title',
    descKey: 'games.slot.desc',
    statusKey: 'lobby.status.wip',
    tilt: 'bw-broken-tilt-alt',
  },
]

function goToGame(to: string) {
  playRouteTransition(to, 'matrix')
}
</script>
