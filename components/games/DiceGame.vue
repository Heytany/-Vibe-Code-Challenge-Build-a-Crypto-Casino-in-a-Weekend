<template>
  <div ref="panelRef">
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
        <button type="button" class="bw-btn" @click="goLobby">
          {{ t('common.back') }}
        </button>
      </div>
    </UiBrokenPanel>
  </div>
</template>

<script setup lang="ts">
/**
 * @agent-context Dice game UI shell — logic in useGameDice + on-chain play_dice.
 * @see ai/specs/game-dice.md
 */
const { t } = useI18n()
const { playRouteTransition, playGameEnter } = useBrutalMotion()
const panelRef = ref<HTMLElement | null>(null)

onMounted(() => {
  playGameEnter(panelRef.value)
})

function goLobby() {
  playRouteTransition('/', 'instant')
}
</script>
