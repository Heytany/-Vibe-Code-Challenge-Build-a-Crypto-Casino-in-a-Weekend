<template>
  <div class="bw-lobby flex flex-col justify-center gap-6 md:gap-8 min-h-[calc(100vh-15rem)]">
    <section class="text-center space-y-3">
      <UiGlitchText
        tag="h1"
        :glitching="true"
        class="text-3xl md:text-5xl font-bold uppercase tracking-tight"
      >
        <UiLocaleText path="lobby.title" tag="span" />
      </UiGlitchText>
      <p class="text-[var(--bw-muted)] text-sm md:text-base mx-auto max-w-xl whitespace-normal">
        <UiLocaleText path="lobby.tagline" tag="span" />
      </p>
      <div class="flex justify-center">
        <WalletBalanceDisplay />
      </div>
    </section>

    <LobbyMonsterHero>
      <template #left>
        <button
          type="button"
          class="bw-game-card bw-panel bw-panel--broken bw-broken-tilt"
          :disabled="motionStore.isLocked"
          @click="goToGame('/games/dice')"
        >
          <UiLocaleText
            path="lobby.status.wip"
            tag="span"
            class="text-[0.65rem] text-[var(--bw-muted)] font-mono"
          />
          <h2 class="text-lg md:text-2xl font-bold uppercase mt-1 mb-2">
            <UiLocaleText path="games.dice.title" tag="span" />
          </h2>
          <p class="text-xs md:text-sm whitespace-normal opacity-80">
            <UiLocaleText path="games.dice.desc" tag="span" />
          </p>
        </button>
      </template>

      <template #right>
        <button
          type="button"
          class="bw-game-card bw-panel bw-panel--broken bw-broken-tilt-alt"
          :disabled="motionStore.isLocked"
          @click="goToGame('/games/slot')"
        >
          <UiLocaleText
            path="lobby.status.wip"
            tag="span"
            class="text-[0.65rem] text-[var(--bw-muted)] font-mono"
          />
          <h2 class="text-lg md:text-2xl font-bold uppercase mt-1 mb-2">
            <UiLocaleText path="games.slot.title" tag="span" />
          </h2>
          <p class="text-xs md:text-sm whitespace-normal opacity-80">
            <UiLocaleText path="games.slot.desc" tag="span" />
          </p>
        </button>
      </template>
    </LobbyMonsterHero>
  </div>
</template>

<script setup lang="ts">
/**
 * @agent-context Lobby — pixel-art monster holds the two game panels (LobbyMonsterHero).
 * Cards keep the matrix GSAP transition on click; monster idle motion is CSS-only.
 * @see components/lobby/MonsterHero.vue, composables/useBrutalMotion.ts
 */
const { playRouteTransition } = useBrutalMotion()
const motionStore = useMotionStore()
const { t } = useI18n()

useSeoMeta({
  description: () => t('seo.lobby.description'),
  ogDescription: () => t('seo.lobby.description'),
})

function goToGame(to: string) {
  playRouteTransition(to, 'matrix')
}
</script>

<style scoped>
.bw-game-card {
  display: block;
  width: 100%;
  text-align: left;
  cursor: pointer;
  color: var(--bw-fg);
  padding: clamp(0.7rem, 2.5vw, 1.4rem);
  transition: background-color 0.15s, color 0.15s, transform 0.1s;
}

.bw-game-card:hover:not(:disabled),
.bw-game-card:focus-visible {
  background: var(--bw-accent);
  color: var(--bw-bg);
}

.bw-game-card:hover:not(:disabled) :deep(.text-\[var\(--bw-muted\)\]),
.bw-game-card:focus-visible :deep(.text-\[var\(--bw-muted\)\]) {
  color: var(--bw-bg);
}

.bw-game-card:focus-visible {
  outline: 3px solid var(--bw-accent);
  outline-offset: 3px;
}

.bw-game-card:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
