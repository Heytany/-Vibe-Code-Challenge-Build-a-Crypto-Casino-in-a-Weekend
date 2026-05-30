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
 * @agent-context Displays in-casino balance from useCasinoProgram (stub until on-chain wired).
 */
const { connected } = useWallet()
const { casinoBalance, loading } = useCasinoProgram()

const formattedBalance = computed(() => {
  if (casinoBalance.value === null) return '—'
  return casinoBalance.value.toLocaleString()
})
</script>
