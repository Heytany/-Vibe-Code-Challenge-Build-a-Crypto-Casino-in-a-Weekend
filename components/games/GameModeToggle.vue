<template>
  <div
    class="flex flex-wrap gap-1"
    role="group"
    :aria-label="t('games.common.modeLabel')"
  >
    <button
      type="button"
      class="bw-btn text-xs py-2 px-3 min-h-[44px] font-bold tracking-widest"
      :class="{ 'bg-[var(--bw-accent)] text-[var(--bw-bg)]': isFun }"
      :aria-pressed="isFun"
      @click="setMode('fun')"
    >
      <UiLocaleText path="games.common.funMode" tag="span" />
    </button>
    <button
      type="button"
      class="bw-btn text-xs py-2 px-3 min-h-[44px] font-bold tracking-widest"
      :class="{
        'bg-[var(--bw-accent)] text-[var(--bw-bg)]': !isFun,
        'opacity-60': !canLive,
      }"
      :aria-pressed="!isFun"
      @click="onLiveClick"
    >
      <UiLocaleText path="games.common.liveMode" tag="span" />
    </button>

    <UiPrimitivesBrutalAlert
      v-model:open="liveBlockedOpen"
      :title="t('errors.liveBlocked.title')"
      :description="liveBlockedDescription"
      :cancel-label="t('errors.liveBlocked.dismiss')"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * @agent-context FUN / LIVE toggle — fun always available; live alert when program/wallet missing.
 */
const { t } = useI18n()
const { isFun, canLive, setMode } = useGameMode()
const { connected } = useWallet()
const { isConfigured } = useCasinoProgram()

const liveBlockedOpen = ref(false)

const liveBlockedDescription = computed(() => {
  if (!connected.value) return t('errors.liveBlocked.noWallet')
  if (!isConfigured.value) return t('errors.liveBlocked.noProgram')
  return t('errors.liveBlocked.generic')
})

function onLiveClick() {
  if (!canLive.value) {
    liveBlockedOpen.value = true
    return
  }
  setMode('live')
}
</script>
