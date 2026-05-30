<template>
  <UiBrokenPanel tilt="right">
    <p class="text-[var(--bw-muted)] text-sm mb-4 font-mono">
      {{ t('games.slot.subtitle') }}
    </p>
    <h2 class="text-2xl font-bold uppercase mb-6 bw-accent">
      {{ t('games.slot.title') }}
    </h2>

    <div class="grid grid-cols-3 gap-2 mb-6 max-w-xs">
      <div
        v-for="i in 3"
        :key="i"
        class="aspect-square border-3 border-[var(--bw-border)] flex items-center justify-center text-2xl font-bold bw-broken-tilt"
        :style="{ transform: `rotate(${(i - 2) * 0.8}deg)` }"
      >
        ?
      </div>
    </div>

    <p class="mb-6 whitespace-normal">
      {{ t('games.slot.placeholder') }}
    </p>
    <div class="flex flex-wrap gap-4">
      <UiBrutalButton disabled variant="accent">
        {{ t('games.slot.spin') }}
      </UiBrutalButton>
      <NuxtLink to="/" class="bw-btn inline-flex items-center no-underline text-[var(--bw-fg)]">
        {{ t('common.back') }}
      </NuxtLink>
    </div>
  </UiBrokenPanel>
</template>

<script setup lang="ts">
/**
 * @agent-context Slot game UI shell — logic in useGameSlot + on-chain play_slot.
 * @see ai/specs/game-slot.md
 */
const { t } = useI18n()
</script>
