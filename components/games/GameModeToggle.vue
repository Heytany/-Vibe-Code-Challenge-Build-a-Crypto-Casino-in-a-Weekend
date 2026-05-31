<template>
  <div class="bw-mode-toggle">
    <div
      class="bw-seg"
      role="radiogroup"
      :aria-label="t('games.common.modeLabel')"
    >
      <button
        type="button"
        role="radio"
        class="bw-seg__opt"
        :class="{ 'is-on': isFun }"
        :aria-checked="isFun"
        @click="setMode('fun')"
      >
        <UiLocaleText path="games.common.funMode" tag="span" />
      </button>
      <button
        type="button"
        role="radio"
        class="bw-seg__opt"
        :class="{ 'is-on': !isFun, 'is-locked': !canLive && isFun }"
        :aria-checked="!isFun"
        :aria-disabled="!canLive"
        @click="onLiveClick"
      >
        <UiLocaleText path="games.common.liveMode" tag="span" />
      </button>
    </div>

    <p class="bw-mode-toggle__now text-xs font-mono text-[var(--bw-muted)]">
      <UiLocaleText path="games.common.modeNow" tag="span" />
      <span class="text-[var(--bw-accent)] font-bold ml-1">
        {{ isFun ? t('games.common.funMode') : t('games.common.liveMode') }}
      </span>
    </p>

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
 * @agent-context FUN / LIVE segmented radio — fun always available; live alert when program/wallet missing.
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

<style scoped>
.bw-seg {
  display: inline-flex;
  border: 3px solid var(--bw-border);
  background: var(--bw-bg);
}

.bw-seg__opt {
  min-height: 44px;
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background: transparent;
  color: var(--bw-fg);
  border: none;
  cursor: pointer;
}

.bw-seg__opt + .bw-seg__opt {
  border-left: 3px solid var(--bw-border);
}

.bw-seg__opt.is-on {
  background: var(--bw-accent);
  color: var(--bw-bg);
}

.bw-seg__opt.is-locked:not(.is-on) {
  opacity: 0.6;
}

.bw-seg__opt:focus-visible {
  outline: 3px solid var(--bw-accent);
  outline-offset: 2px;
}

.bw-mode-toggle__now {
  margin-top: 0.35rem;
}
</style>
