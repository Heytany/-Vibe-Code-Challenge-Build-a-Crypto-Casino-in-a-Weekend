<template>
  <UiBrokenPanel>
    <p class="text-[var(--bw-muted)] text-sm mb-4 font-mono">
      {{ t('games.dice.subtitle') }}
    </p>
    <h2 class="text-2xl font-bold uppercase mb-6 bw-accent">
      {{ t('games.dice.title') }}
    </h2>
    <p class="mb-6 whitespace-normal">
      {{ t('games.dice.placeholder') }}
    </p>
    <div class="flex flex-wrap gap-4">
      <UiBrutalButton disabled>
        {{ t('games.dice.roll') }}
      </UiBrutalButton>
      <NuxtLink to="/" class="bw-btn inline-flex items-center no-underline text-[var(--bw-fg)]">
        {{ t('common.back') }}
      </NuxtLink>
    </div>
  </UiBrokenPanel>
</template>

<script setup lang="ts">
/**
 * @agent-context Dice game UI shell — logic in useGameDice + on-chain play_dice.
 * @see ai/specs/game-dice.md
 */
const { t } = useI18n()
</script>
