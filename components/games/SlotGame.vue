<template>
  <div ref="panelRef">
    <UiBrokenPanel tilt="right">
      <p class="text-[var(--bw-muted)] text-sm mb-4 font-mono">
        <UiLocaleText path="games.slot.subtitle" tag="span" />
      </p>
      <h2 class="text-2xl font-bold uppercase mb-6 bw-accent">
        <UiLocaleText path="games.slot.title" tag="span" />
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
        <UiLocaleText path="games.slot.placeholder" tag="span" />
      </p>
      <div class="flex flex-wrap gap-4">
        <UiBrutalButton disabled variant="accent">
          <UiLocaleText path="games.slot.spin" tag="span" />
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
 * @agent-context Slot game UI shell — logic in useGameSlot + on-chain play_slot.
 * @see ai/specs/game-slot.md
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
