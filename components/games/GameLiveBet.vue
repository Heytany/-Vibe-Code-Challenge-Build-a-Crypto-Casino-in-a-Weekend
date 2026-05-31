<template>
  <div class="mb-6">
    <label class="block space-y-2 max-w-xs mx-auto sm:mx-0 sm:ml-auto sm:text-right">
      <span class="text-xs uppercase font-bold block">
        <UiLocaleText path="games.common.bet" tag="span" />
        <span class="text-[var(--bw-muted)] normal-case ml-1">({{ TOKEN_SYMBOL }})</span>
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
      <p class="text-[0.65rem] text-[var(--bw-muted)] font-mono whitespace-normal">
        <UiLocaleText path="games.common.liveBetHint" tag="span" />
      </p>
    </label>
  </div>
</template>

<script setup lang="ts">
/**
 * @agent-context LIVE bet only on game pages — balances/deposit live in LayoutWalletStrip.
 */
import { TOKEN_SYMBOL } from '~/shared/format-tokens'

defineProps<{
  bet: number
  disabled?: boolean
  betInvalid?: boolean
  betTouched?: boolean
}>()

const emit = defineEmits<{
  'update:bet': [value: number]
  'blur-bet': []
}>()

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
