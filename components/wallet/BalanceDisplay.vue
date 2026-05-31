<template>
  <div v-if="connected" class="text-xs font-mono text-[var(--bw-muted)] whitespace-normal">
    <UiLocaleText path="wallet.casinoBalance" tag="span" class="text-[var(--bw-accent)]" />:
    <UiBrutalSkeleton
      v-if="loading"
      inline
      width="4.5rem"
      height="1.1rem"
      class="align-middle ml-1"
    />
    <span v-else>{{ formattedBalance }}</span>
  </div>
</template>

<script setup lang="ts">
/**
 * @agent-context Displays in-casino balance from useCasinoProgram on lobby.
 */
import { formatTokenAmount, TOKEN_SYMBOL } from '~/shared/format-tokens'

const { connected } = useWallet()
const { casinoBalance, loading, isConfigured } = useCasinoProgram()

const formattedBalance = computed(() => {
  const amount = formatTokenAmount(casinoBalance.value)
  if (!isConfigured.value || casinoBalance.value === null) return amount
  return `${amount} ${TOKEN_SYMBOL}`
})
</script>
