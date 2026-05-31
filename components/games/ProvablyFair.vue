<template>
  <div class="bw-fair">
    <p class="text-sm whitespace-normal mb-3">
      <UiLocaleText path="games.fair.intro" tag="span" />
    </p>

    <pre class="bw-fair__formula">{{ t('games.fair.formula') }}</pre>

    <div v-if="meta" class="bw-fair__grid">
      <div class="bw-fair__row">
        <span class="bw-fair__k"><UiLocaleText path="games.fair.blockhash" tag="span" /></span>
        <code class="bw-fair__v" :title="blockhashHex">{{ shorten(blockhashHex) }}</code>
      </div>
      <div class="bw-fair__row">
        <span class="bw-fair__k"><UiLocaleText path="games.fair.seed" tag="span" /></span>
        <code class="bw-fair__v">{{ seedStr }}</code>
      </div>
      <div class="bw-fair__row">
        <span class="bw-fair__k"><UiLocaleText path="games.fair.nonce" tag="span" /></span>
        <code class="bw-fair__v">{{ nonceStr }}</code>
      </div>
      <div class="bw-fair__row">
        <span class="bw-fair__k"><UiLocaleText path="games.fair.domain" tag="span" /></span>
        <code class="bw-fair__v">{{ domainStr }}</code>
      </div>
      <div class="bw-fair__row">
        <span class="bw-fair__k"><UiLocaleText path="games.fair.result" tag="span" /></span>
        <code class="bw-fair__v bw-accent">{{ resultStr }}</code>
      </div>
    </div>

    <p v-else class="text-xs font-mono text-[var(--bw-muted)] mb-3">
      <UiLocaleText path="games.fair.noPlay" tag="span" />
    </p>

    <button
      v-if="meta"
      type="button"
      class="bw-btn text-sm w-full mb-3"
      @click="onVerify"
    >
      <UiLocaleText path="games.fair.recompute" tag="span" />
    </button>

    <p
      v-if="verified !== null"
      class="bw-fair__verdict"
      :class="verified ? 'is-ok' : 'is-fail'"
      role="status"
    >
      <UiLocaleText :path="verified ? 'games.fair.matchOk' : 'games.fair.matchFail'" tag="span" />
    </p>

    <a
      v-if="explorerUrl"
      :href="explorerUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="bw-btn text-sm w-full mt-3 inline-block text-center no-underline"
    >
      <UiLocaleText path="games.fair.explorer" tag="span" />
    </a>
    <p class="text-xs font-mono text-[var(--bw-muted)] mt-3 whitespace-normal">
      <UiLocaleText :path="explorerUrl ? 'games.fair.liveNote' : 'games.fair.funNote'" tag="span" />
    </p>
  </div>
</template>

<script setup lang="ts">
/**
 * @agent-context Provably-fair panel — recomputes a play's outcome from its public inputs
 * (blockhash, seed, nonce, domain) via shared/rng-verify, so a paranoid player can confirm
 * the casino did not cheat. Same math as the on-chain program (README: verifiable on-chain).
 * @see shared/rng-verify.ts, ai/decisions/015-provably-fair.md
 */
import { verifyDice, verifySlot } from '~/shared/rng-verify'

const props = defineProps<{
  game: 'dice' | 'slot'
  // dice/slot lastMeta (fun) or live meta; null when nothing played yet
  meta: Record<string, unknown> | null
  slotSymbolChar?: (i: number) => string
}>()

const { t } = useI18n()
const verified = ref<boolean | null>(null)

// reset verdict whenever a new play arrives
watch(() => props.meta, () => { verified.value = null })

function toBytes(v: unknown): Uint8Array {
  if (v instanceof Uint8Array) return v
  if (Array.isArray(v)) return new Uint8Array(v as number[])
  return new Uint8Array(0)
}

const blockhashHex = computed(() => {
  const bh = toBytes(props.meta?.blockhash)
  return Array.from(bh).map((b) => b.toString(16).padStart(2, '0')).join('')
})
const seedStr = computed(() => (props.meta?.userSeed ?? '—').toString())
const nonceStr = computed(() => (props.meta?.nonce ?? '—').toString())
const domainStr = computed(() => (props.game === 'dice' ? '"dice"' : '"slot" · nonce+reel·φ'))

const resultStr = computed(() => {
  if (!props.meta) return '—'
  if (props.game === 'dice') return String(props.meta.roll ?? '—')
  const reels = props.meta.reels as number[] | undefined
  if (!reels) return '—'
  return props.slotSymbolChar ? reels.map(props.slotSymbolChar).join(' ') : reels.join(' ')
})

const explorerUrl = computed(() => {
  const sig = props.meta?.signature as string | undefined
  return sig ? `https://explorer.solana.com/tx/${sig}?cluster=devnet` : ''
})

function onVerify() {
  const m = props.meta
  if (!m) return
  const blockhash = toBytes(m.blockhash)
  if (props.game === 'dice') {
    const r = verifyDice({
      blockhash,
      userSeed: BigInt(String(m.userSeed)),
      nonce: BigInt(String(m.nonce)),
      rollUnder: Boolean(m.rollUnder),
      target: Number(m.target),
      reportedRoll: Number(m.roll),
      reportedWon: Boolean(m.won),
    })
    verified.value = r.ok
  } else {
    const reels = (m.reels as number[]) ?? []
    const r = verifySlot({
      blockhash,
      userSeed: BigInt(String(m.userSeed)),
      nonce: BigInt(String(m.nonce)),
      reportedReels: [reels[0] ?? 0, reels[1] ?? 0, reels[2] ?? 0],
    })
    verified.value = r.ok
  }
}

function shorten(hex: string): string {
  if (hex.length <= 20) return hex
  return `${hex.slice(0, 12)}…${hex.slice(-6)}`
}
</script>

<style scoped>
.bw-fair__formula {
  font-size: 0.7rem;
  border: 2px solid var(--bw-border);
  padding: 0.6rem;
  margin-bottom: 0.9rem;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
  color: var(--bw-accent);
}

.bw-fair__grid {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 0.9rem;
}

.bw-fair__row {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  font-size: 0.75rem;
  border-bottom: 1px dashed var(--bw-muted);
  padding-bottom: 0.3rem;
}

.bw-fair__k {
  text-transform: uppercase;
  font-weight: 700;
  color: var(--bw-muted);
  white-space: nowrap;
}

.bw-fair__v {
  font-family: var(--bw-font);
  text-align: right;
  word-break: break-all;
}

.bw-fair__verdict {
  font-weight: 700;
  text-transform: uppercase;
  text-align: center;
  padding: 0.6rem;
  border: 3px solid;
}

.bw-fair__verdict.is-ok {
  color: var(--bw-accent);
  border-color: var(--bw-accent);
}

.bw-fair__verdict.is-fail {
  color: var(--bw-danger);
  border-color: var(--bw-danger);
}
</style>
