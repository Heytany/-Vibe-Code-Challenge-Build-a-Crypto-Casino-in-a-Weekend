<template>
  <div v-if="show" ref="barRef" class="bw-funds-bar border-b-4 border-[var(--bw-border)] bg-[var(--bw-bg)]">
    <div class="container mx-auto px-4 py-3 max-w-5xl space-y-3">
      <!-- FUN mode (games only) -->
      <template v-if="showFunFunds">
        <div class="flex flex-wrap items-end justify-between gap-4">
          <div class="font-mono space-y-1 min-w-[8rem]">
            <span class="text-xs uppercase font-bold block text-[var(--bw-muted)]">
              <UiLocaleText path="games.common.funBalanceLabel" tag="span" />
            </span>
            <span class="text-xl font-bold text-[var(--bw-accent)]">
              {{ formattedFunBalance }}
              <span class="text-xs text-[var(--bw-muted)] ml-1">{{ funUnit }}</span>
            </span>
          </div>
          <button
            type="button"
            class="bw-btn text-sm min-h-[44px]"
            @click="topUp"
          >
            <UiLocaleText path="games.common.refillFun" tag="span" />
          </button>
        </div>
      </template>

      <!-- LIVE funds — games in LIVE, or lobby whenever wallet + env ready -->
      <template v-else-if="showLiveFunds">
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
          <button
            type="button"
            class="bw-btn text-sm min-h-[44px] px-3"
            :disabled="loading"
            :title="t('games.common.refreshBalances')"
            @click="onRefresh"
          >
            ↻
          </button>
        </div>

        <p
          v-if="needsDeposit"
          class="text-xs font-bold uppercase text-[var(--bw-accent)] whitespace-normal"
        >
          <UiLocaleText path="games.common.liveNeedDeposit" tag="span" />
        </p>

        <WalletCasinoActions :panel-el="barRef" />
      </template>

      <!-- LIVE on game route but wallet not ready -->
      <template v-else-if="isGameRoute">
        <p class="text-xs font-mono text-[var(--bw-muted)] whitespace-normal">
          <UiLocaleText path="games.common.connectFirst" tag="span" />
        </p>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * @agent-context Unified funds bar — FUN on games; LIVE on games + lobby when wallet connected.
 */
import { formatTokenAmount, TOKEN_SYMBOL } from '~/shared/format-tokens'

const route = useRoute()
const { t } = useI18n()
const { connected } = useWallet()
const { isConfigured, casinoBalance, walletTokenBalance, loading, refreshBalance } = useCasinoProgram()
const { isFun } = useGameMode()
const { balance: funBalance, topUp } = useFunBalance()

const barRef = ref<HTMLElement | null>(null)

const isGameRoute = computed(() => route.path.startsWith('/games/'))
const walletReady = computed(() => connected.value && isConfigured.value)

/** FUN credits strip — only on game pages in FUN mode. */
const showFunFunds = computed(() => isGameRoute.value && isFun.value)

/** WIBE strip — LIVE on games; on lobby whenever Phantom + env (even if game mode toggle is FUN). */
const showLiveFunds = computed(() => {
  if (!walletReady.value) return false
  if (isGameRoute.value) return !isFun.value
  return true
})

const show = computed(() => {
  if (isGameRoute.value) return true
  return walletReady.value
})

const funUnit = computed(() => t('games.common.funUnit'))
const formattedFunBalance = computed(() => formatTokenAmount(funBalance.value))

const formattedCasino = computed(() => {
  if (loading.value && casinoBalance.value === null) return '…'
  return formatTokenAmount(casinoBalance.value ?? 0)
})

const formattedWallet = computed(() => formatTokenAmount(walletTokenBalance.value ?? 0))

const needsDeposit = computed(() =>
  showLiveFunds.value && (casinoBalance.value ?? 0) <= 0,
)

async function onRefresh() {
  try {
    await refreshBalance()
  } catch (e) {
    console.warn('[GameFundsBar] refresh failed', e)
  }
}
</script>
