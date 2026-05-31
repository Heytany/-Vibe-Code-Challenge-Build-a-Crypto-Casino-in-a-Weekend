<template>
  <div class="bw-play-funds space-y-4 mb-6">
    <p
      v-if="isFun"
      class="bw-fun-banner text-xs font-mono uppercase px-3 py-2 border-2 border-[var(--bw-accent)] text-[var(--bw-accent)]"
    >
      <UiLocaleText path="games.common.funBanner" tag="span" />
    </p>

    <template v-else>
      <p class="bw-live-banner text-xs font-mono whitespace-normal px-3 py-2 border-2 border-[var(--bw-border)]">
        <UiLocaleText path="games.common.liveBanner" tag="span" />
      </p>
      <p
        v-if="needsDeposit"
        class="text-xs font-bold uppercase text-[var(--bw-accent)] whitespace-normal"
      >
        <UiLocaleText path="games.common.liveNeedDeposit" tag="span" />
      </p>
    </template>

    <div class="grid gap-4 sm:grid-cols-2 items-start">
      <div class="font-mono space-y-2 text-center sm:text-left">
        <div>
          <span class="text-xs uppercase font-bold block">
            <UiLocaleText path="games.common.balance" tag="span" />
          </span>
          <span class="text-[var(--bw-accent)] text-2xl font-bold">
            {{ formattedCasinoBalance }}
            <span class="text-[var(--bw-muted)] text-xs ml-1">{{ unitLabel }}</span>
          </span>
        </div>
        <div v-if="!isFun">
          <span class="text-xs uppercase font-bold block text-[var(--bw-muted)]">
            <UiLocaleText path="games.common.walletBalance" tag="span" />
          </span>
          <span class="text-lg font-bold">
            {{ formattedWalletBalance }}
            <span class="text-[var(--bw-muted)] text-xs ml-1">{{ unitLabel }}</span>
          </span>
        </div>
      </div>

      <label class="block space-y-2 text-center sm:text-right">
        <span class="text-xs uppercase font-bold block">
          <UiLocaleText path="games.common.bet" tag="span" />
          <span class="text-[var(--bw-muted)] normal-case ml-1">({{ unitLabel }})</span>
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
        <p v-if="!isFun" class="text-[0.65rem] text-[var(--bw-muted)] font-mono whitespace-normal">
          <UiLocaleText path="games.common.minBetHint" tag="span" />
        </p>
      </label>
    </div>

    <p v-if="!isFun" class="text-[0.65rem] text-[var(--bw-muted)] font-mono whitespace-normal">
      <UiLocaleText path="games.common.phantomTokenHint" tag="span" />
      <code v-if="tokenMintShort" class="ml-1">{{ tokenMintShort }}</code>
    </p>

    <WalletCasinoActions v-if="!isFun" :panel-el="panelEl" />
  </div>
</template>

<script setup lang="ts">
/**
 * @agent-context Balance + bet + LIVE deposit block on game play tab.
 */
import { formatTokenAmount, TOKEN_SYMBOL } from '~/shared/format-tokens'

const props = defineProps<{
  isFun: boolean
  bet: number
  casinoBalance: number | null
  walletBalance?: number | null
  disabled?: boolean
  betInvalid?: boolean
  betTouched?: boolean
  panelEl?: HTMLElement | null
}>()

const emit = defineEmits<{
  'update:bet': [value: number]
  'blur-bet': []
}>()

const { t } = useI18n()
const config = useRuntimeConfig()

const tokenMintShort = computed(() => {
  const mint = config.public.casinoTokenMint as string
  if (!mint || mint.length < 12) return ''
  return `${mint.slice(0, 4)}…${mint.slice(-4)}`
})

const unitLabel = computed(() =>
  props.isFun ? t('games.common.funUnit') : TOKEN_SYMBOL,
)

const formattedCasinoBalance = computed(() => formatTokenAmount(props.casinoBalance))
const formattedWalletBalance = computed(() => formatTokenAmount(props.walletBalance ?? null))

const needsDeposit = computed(() =>
  !props.isFun
  && props.casinoBalance !== null
  && props.casinoBalance <= 0
  && (props.walletBalance ?? 0) > 0,
)

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

.bw-live-banner {
  color: var(--bw-muted);
}
</style>
