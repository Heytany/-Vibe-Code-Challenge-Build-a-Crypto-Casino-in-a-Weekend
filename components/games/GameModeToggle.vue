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
        'opacity-45 cursor-not-allowed': !canLive,
      }"
      :aria-pressed="!isFun"
      :disabled="!canLive"
      :title="canLive ? t('games.common.liveModeHint') : t('games.common.liveModeLocked')"
      @click="setMode('live')"
    >
      <UiLocaleText path="games.common.liveMode" tag="span" />
    </button>
  </div>
</template>

<script setup lang="ts">
/**
 * @agent-context FUN / LIVE toggle — fun always available; live needs wallet + program.
 */
const { t } = useI18n()
const { isFun, canLive, setMode } = useGameMode()
</script>
