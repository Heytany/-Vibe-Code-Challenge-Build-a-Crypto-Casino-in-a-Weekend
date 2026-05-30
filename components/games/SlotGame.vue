<template>
  <div ref="panelRef" class="space-y-6">
    <UiBrokenPanel tilt="right">
      <div class="flex flex-wrap items-start justify-between gap-4 mb-4">
        <div>
          <p class="text-[var(--bw-muted)] text-sm font-mono mb-1">
            <UiLocaleText path="games.slot.subtitle" tag="span" />
          </p>
          <h2 class="text-2xl font-bold uppercase bw-accent">
            <UiLocaleText path="games.slot.title" tag="span" />
          </h2>
        </div>
        <GamesGameModeToggle />
      </div>

      <p
        v-if="isFun"
        class="bw-fun-banner text-xs font-mono uppercase mb-4 px-3 py-2 border-2 border-[var(--bw-accent)] text-[var(--bw-accent)]"
      >
        <UiLocaleText path="games.common.funBanner" tag="span" />
      </p>

      <div class="grid grid-cols-3 gap-2 mb-6 max-w-xs">
        <div
          v-for="i in 3"
          :key="i"
          ref="reelRefs"
          class="aspect-square border-3 border-[var(--bw-border)] flex items-center justify-center text-2xl font-bold bw-broken-tilt"
          :class="{ 'bw-shake': spinning }"
          :style="{ transform: `rotate(${(i - 2) * 0.8}deg)` }"
        >
          {{ displayReel(i - 1) }}
        </div>
      </div>

      <label class="block space-y-2 mb-6 max-w-xs">
        <span class="text-xs uppercase font-bold">
          <UiLocaleText path="games.common.bet" tag="span" />
        </span>
        <input
          v-model.number="bet"
          type="number"
          min="1"
          class="bw-input w-full"
          :disabled="spinning"
        >
      </label>

      <p class="text-xs font-mono mb-6">
        <UiLocaleText path="games.common.balance" tag="span" />:
        <span class="text-[var(--bw-accent)]">{{ effectiveBalance ?? '—' }}</span>
        <span v-if="isFun" class="text-[var(--bw-muted)]"> (fun)</span>
      </p>

      <div class="flex flex-wrap gap-4">
        <UiBrutalButton variant="accent" :loading="spinning" @click="onSpin">
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
 * @agent-context Slot UI — fun mode default (no wallet); live when wired.
 */
const { playRouteTransition, playGameEnter } = useBrutalMotion()
const { isFun, bet, reels, spinning, effectiveBalance, spin, slotSymbolChar } = useGameSlot()

const panelRef = ref<HTMLElement | null>(null)
const reelRefs = ref<HTMLElement[]>([])

onMounted(() => {
  playGameEnter(panelRef.value)
})

function displayReel(index: number) {
  if (spinning.value) return '?'
  if (!reels.value) return '?'
  return slotSymbolChar(reels.value[index]!)
}

async function onSpin() {
  try {
    await spin(reelRefs.value[0] ?? null)
  } catch (e) {
    useBrutalToast().showError(e)
  }
}

function goLobby() {
  playRouteTransition('/', 'instant')
}
</script>

<style scoped>
.bw-input {
  min-height: 44px;
  padding: 0.5rem 0.75rem;
  border: 3px solid var(--bw-border);
  background: var(--bw-bg);
  color: var(--bw-fg);
  font-family: var(--bw-font);
}
</style>
