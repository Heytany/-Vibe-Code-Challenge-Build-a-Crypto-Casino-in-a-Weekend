<template>
  <div v-if="show" ref="stripRef" class="bw-wallet-strip border-b-4 border-[var(--bw-border)] bg-[var(--bw-bg)]">
    <div class="container mx-auto px-4 py-3 max-w-5xl space-y-3">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div class="font-mono space-y-1 min-w-[8rem]">
          <span class="text-xs uppercase font-bold block text-[var(--bw-muted)]">
            <UiLocaleText path="games.common.casinoBalanceLabel" tag="span" />
          </span>
          <span class="text-xl font-bold text-[var(--bw-accent)]">
            {{ formattedCasino }}
            <span class="text-xs text-[var(--bw-muted)] ml-1">{{ TOKEN_SYMBOL }}</span>
          </span>
        </div>
        <div class="font-mono space-y-1 min-w-[8rem]">
          <span class="text-xs uppercase font-bold block text-[var(--bw-muted)]">
            <UiLocaleText path="games.common.walletBalance" tag="span" />
          </span>
          <span class="text-lg font-bold">
            {{ formattedWallet }}
            <span class="text-xs text-[var(--bw-muted)] ml-1">{{ TOKEN_SYMBOL }}</span>
          </span>
        </div>
      </div>

      <p
        v-if="needsDeposit"
        class="text-xs font-bold uppercase text-[var(--bw-accent)] whitespace-normal"
      >
        <UiLocaleText path="games.common.liveNeedDeposit" tag="span" />
      </p>

      <WalletCasinoActions :panel-el="stripRef" />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * @agent-context Global LIVE wallet block — under header, not sticky. Hidden in FUN mode.
 */
import { formatTokenAmount, TOKEN_SYMBOL } from '~/shared/format-tokens'

const { connected } = useWallet()
const { isConfigured, casinoBalance, walletTokenBalance, loading } = useCasinoProgram()
const { isFun } = useGameMode()

const stripRef = ref<HTMLElement | null>(null)

const show = computed(() =>
  connected.value && isConfigured.value && !isFun.value,
)

const formattedCasino = computed(() => {
  if (loading.value && casinoBalance.value === null) return '…'
  return formatTokenAmount(casinoBalance.value)
})

const formattedWallet = computed(() => formatTokenAmount(walletTokenBalance.value))

const needsDeposit = computed(() =>
  casinoBalance.value !== null && casinoBalance.value <= 0,
)
</script>
