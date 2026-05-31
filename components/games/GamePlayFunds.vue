<template>
  <div class="bw-fun-funds space-y-4 mb-6">
    <p class="bw-fun-banner text-xs font-mono uppercase px-3 py-2 border-2 border-[var(--bw-accent)] text-[var(--bw-accent)]">
      <UiLocaleText path="games.common.funBanner" tag="span" />
    </p>

    <div class="grid gap-4 sm:grid-cols-2 items-end">
      <div class="font-mono space-y-2 text-center sm:text-left">
        <span class="text-xs uppercase font-bold block">
          <UiLocaleText path="games.common.funBalanceLabel" tag="span" />
        </span>
        <span class="text-[var(--bw-accent)] text-2xl font-bold">
          {{ formattedBalance }}
          <span class="text-[var(--bw-muted)] text-xs ml-1">{{ funUnit }}</span>
        </span>
        <button
          type="button"
          class="bw-btn text-sm min-h-[44px] w-full sm:w-auto"
          :disabled="disabled"
          @click="emit('refill')"
        >
          <UiLocaleText path="games.common.refillFun" tag="span" />
        </button>
      </div>

      <label class="block space-y-2 text-center sm:text-right">
        <span class="text-xs uppercase font-bold block">
          <UiLocaleText path="games.common.bet" tag="span" />
          <span class="text-[var(--bw-muted)] normal-case ml-1">({{ funUnit }})</span>
        </span>
        <input
          :value="bet"
          type="number"
          min="1"
          class="bw-input w-full text-center"
          :class="{ 'bw-input--invalid': betInvalid && betTouched }"
          :disabled="disabled"
          @input="onBetInput"
          @blur="emit('blur-bet')"
        >
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * @agent-context FUN-only funds on game pages — virtual credits + refill, no WIBE / deposit.
 */
import { formatTokenAmount } from '~/shared/format-tokens'

const props = defineProps<{
  bet: number
  balance: number | null
  disabled?: boolean
  betInvalid?: boolean
  betTouched?: boolean
}>()

const emit = defineEmits<{
  'update:bet': [value: number]
  'blur-bet': []
  refill: []
}>()

const { t } = useI18n()
const funUnit = computed(() => t('games.common.funUnit'))
const formattedBalance = computed(() => formatTokenAmount(props.balance))

function onBetInput(e: Event) {
  const raw = (e.target as HTMLInputElement).value
  const n = Number(raw)
  emit('update:bet', Number.isFinite(n) ? n : 0)
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
