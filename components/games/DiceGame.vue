<template>
  <div ref="panelRef">
    <UiBrokenPanel>
      <p class="text-[var(--bw-muted)] text-sm mb-4 font-mono">
        <UiLocaleText path="games.dice.subtitle" tag="span" />
      </p>
      <h2 class="text-2xl font-bold uppercase mb-6 bw-accent">
        <UiLocaleText path="games.dice.title" tag="span" />
      </h2>
      <p class="mb-6 whitespace-normal">
        <UiLocaleText path="games.dice.placeholder" tag="span" />
      </p>
      <div class="flex flex-wrap gap-4">
        <UiBrutalButton disabled>
          <UiLocaleText path="games.dice.roll" tag="span" />
        </UiBrutalButton>
        <button type="button" class="bw-btn" @click="goLobby">
          <UiLocaleText path="common.back" tag="span" />
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
const { playRouteTransition, playGameEnter } = useBrutalMotion()
const panelRef = ref<HTMLElement | null>(null)

onMounted(() => {
  playGameEnter(panelRef.value)
})

function goLobby() {
  playRouteTransition('/', 'instant')
}
</script>
