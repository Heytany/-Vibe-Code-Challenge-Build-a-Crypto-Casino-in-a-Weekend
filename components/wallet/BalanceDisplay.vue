<template>
  <div v-if="connected" class="text-xs font-mono text-[var(--bw-muted)] whitespace-normal">
    <span class="text-[var(--bw-accent)]">{{ t('wallet.casinoBalance') }}:</span>
    {{ formattedBalance }}
  </div>
</template>

<script setup lang="ts">
/**
 * @agent-context Displays in-casino balance from useCasinoProgram (stub until on-chain wired).
 */
const { t } = useI18n()
const { connected } = useWallet()
const { casinoBalance } = useCasinoProgram()

const formattedBalance = computed(() => {
  if (casinoBalance.value === null) return '—'
  return casinoBalance.value.toLocaleString()
})
</script>
