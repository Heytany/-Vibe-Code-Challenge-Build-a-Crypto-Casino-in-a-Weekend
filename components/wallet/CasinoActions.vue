<template>
  <div v-if="showPanel" class="bw-casino-actions bw-panel bw-panel--broken p-4 space-y-3">
    <p class="text-sm font-bold uppercase">
      <UiLocaleText path="games.common.depositWithdrawTitle" tag="span" />
    </p>

    <div class="flex flex-wrap gap-2 items-end">
      <label class="flex-1 min-w-[8rem] space-y-1">
        <span class="text-xs uppercase font-bold block">
          <UiLocaleText path="games.common.deposit" tag="span" /> /
          <UiLocaleText path="games.common.withdraw" tag="span" />
          ({{ TOKEN_SYMBOL }})
        </span>
        <input
          v-model.number="amount"
          type="number"
          min="1"
          class="bw-input w-full text-center"
          :disabled="busy"
        >
      </label>

      <button
        type="button"
        class="bw-btn text-sm min-h-[44px]"
        :disabled="busy || !canDeposit"
        @click="onDeposit"
      >
        <UiLocaleText path="games.common.deposit" tag="span" />
      </button>

      <button
        type="button"
        class="bw-btn text-sm min-h-[44px]"
        :disabled="busy || !canWithdraw"
        @click="onWithdraw"
      >
        <UiLocaleText path="games.common.withdraw" tag="span" />
      </button>

      <button
        type="button"
        class="bw-btn text-sm min-h-[44px]"
        :disabled="busy || !maxWithdraw"
        @click="onWithdrawMax"
      >
        <UiLocaleText path="games.common.max" tag="span" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * @agent-context Deposit / withdraw controls — used from global LayoutWalletStrip.
 */
import { formatTokenAmount, TOKEN_SYMBOL } from '~/shared/format-tokens'

const props = defineProps<{
  panelEl?: HTMLElement | null
}>()

const { connected } = useWallet()
const { casinoBalance, deposit, withdraw, isConfigured } = useCasinoProgram()
const { playDepositPulse } = useBrutalMotion()
const { showError } = useBrutalToast()

const amount = ref(100)
const busy = ref(false)

const showPanel = computed(() => connected.value && isConfigured.value)

const formattedBalance = computed(() => formatTokenAmount(casinoBalance.value))

const maxWithdraw = computed(() => casinoBalance.value ?? 0)
const canDeposit = computed(() => amount.value > 0 && !busy.value)
const canWithdraw = computed(() =>
  amount.value > 0
  && casinoBalance.value !== null
  && amount.value <= casinoBalance.value
  && !busy.value,
)

async function onDeposit() {
  if (!canDeposit.value) return
  busy.value = true
  try {
    await deposit(amount.value)
    playDepositPulse(props.panelEl ?? null)
  } catch (e) {
    showError(e)
  } finally {
    busy.value = false
  }
}

async function onWithdraw() {
  if (!canWithdraw.value) return
  busy.value = true
  try {
    await withdraw(amount.value)
  } catch (e) {
    showError(e)
  } finally {
    busy.value = false
  }
}

async function onWithdrawMax() {
  if (!maxWithdraw.value) return
  amount.value = maxWithdraw.value
  await onWithdraw()
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
