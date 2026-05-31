<template>
  <div class="bw-wheel-page max-w-xl mx-auto w-full space-y-6">
    <header>
      <UiLocaleText path="games.wheel.title" tag="h1" class="text-2xl font-bold uppercase bw-accent" />
      <UiLocaleText path="games.wheel.slogan" tag="p" class="text-sm font-bold mt-1" />
      <UiLocaleText path="games.wheel.tagline" tag="p" class="text-xs font-mono text-[var(--bw-muted)] mt-1 whitespace-normal" />
    </header>

    <div class="bw-wheel-stage">
      <svg viewBox="0 0 200 200" class="bw-wheel" :style="{ transform: `rotate(${angle}deg)` }" aria-hidden="true">
        <g v-for="(seg, i) in segments" :key="i">
          <path :d="seg.d" :fill="i % 2 ? 'var(--bw-bg)' : 'var(--bw-accent)'" stroke="var(--bw-border)" stroke-width="1.5" />
          <text :x="seg.tx" :y="seg.ty" :transform="`rotate(${seg.rot} ${seg.tx} ${seg.ty})`"
            font-size="11" font-weight="700" text-anchor="middle"
            :fill="i % 2 ? 'var(--bw-fg)' : 'var(--bw-bg)'">{{ seg.label }}</text>
        </g>
        <circle cx="100" cy="100" r="14" fill="var(--bw-border)" />
      </svg>
      <div class="bw-wheel__pointer" aria-hidden="true">▼</div>
      <!-- defeated monster pinned under the wheel -->
      <svg viewBox="0 0 120 40" class="bw-wheel__monster" shape-rendering="crispEdges" aria-hidden="true">
        <rect x="16" y="10" width="88" height="22" fill="var(--bw-fg)" />
        <rect x="26" y="16" width="12" height="6" fill="var(--bw-bg)" />
        <rect x="82" y="16" width="12" height="6" fill="var(--bw-bg)" />
        <rect x="28" y="17" width="4" height="2" fill="var(--bw-danger)" />
        <rect x="34" y="17" width="4" height="2" fill="var(--bw-danger)" />
        <rect x="84" y="17" width="4" height="2" fill="var(--bw-danger)" />
        <rect x="90" y="17" width="4" height="2" fill="var(--bw-danger)" />
        <rect x="0" y="20" width="18" height="8" fill="var(--bw-fg)" />
        <rect x="102" y="20" width="18" height="8" fill="var(--bw-fg)" />
      </svg>
    </div>

    <div class="bw-wheel__result-slot">
      <p v-if="lastPrize !== null" class="bw-wheel__result bw-accent">
        +{{ lastPrize }} WIBE
      </p>
    </div>

    <div class="space-y-3 text-center">
      <p class="text-xs font-mono">
        <span class="uppercase font-bold"><UiLocaleText path="games.wheel.prizeFund" />:</span>
        <span class="bw-accent ml-1">{{ faucetRemaining ?? '—' }} WIBE</span>
      </p>

      <UiBrutalButton class="w-full max-w-[14rem] mx-auto" variant="accent" :loading="spinning" :disabled="!canSpin" @click="onSpin">
        <UiLocaleText path="games.wheel.spin" />
      </UiBrutalButton>

      <button v-if="spinning" type="button" class="bw-wheel__abort text-xs underline" @click="cancelSpin">
        <UiLocaleText path="games.wheel.stuck" />
      </button>

      <UiLocaleText v-if="!isConfigured" path="errors.liveBlocked.noProgram" tag="p" class="text-xs text-[var(--bw-muted)]" />
      <UiLocaleText v-else-if="poolEmpty" path="games.wheel.poolEmpty" tag="p" class="text-xs text-[var(--bw-danger)]" />
      <p v-else-if="onCooldown" class="text-xs text-[var(--bw-muted)]">{{ cooldownLabel }}</p>
      <UiLocaleText v-else-if="!canSpin" path="games.wheel.connectFirst" tag="p" class="text-xs text-[var(--bw-muted)]" />
    </div>

    <UiBrokenPanel class="max-w-xl mx-auto w-full">
      <div class="bw-dice-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          class="bw-dice-tabs__btn"
          :class="{ 'is-active': activeTab === 'rules' }"
          :aria-selected="activeTab === 'rules'"
          @click="activeTab = 'rules'"
        >
          <UiLocaleText path="games.wheel.tabRules" tag="span" />
        </button>
        <button
          type="button"
          role="tab"
          class="bw-dice-tabs__btn"
          :class="{ 'is-active': activeTab === 'trust' }"
          :aria-selected="activeTab === 'trust'"
          @click="activeTab = 'trust'"
        >
          <UiLocaleText path="games.wheel.tabTrust" tag="span" />
        </button>
      </div>

      <div class="bw-game-tabpanels">
        <div
          role="tabpanel"
          class="bw-game-tabpanel bw-dice-rules"
          :class="{ 'is-inactive': activeTab !== 'rules' }"
        >
          <p class="whitespace-normal mb-4">
            <UiLocaleText path="games.wheel.rulesIntro" tag="span" />
          </p>
          <ol>
            <li><UiLocaleText path="games.wheel.rulesStep1" tag="span" /></li>
            <li><UiLocaleText path="games.wheel.rulesStep2" tag="span" /></li>
            <li><UiLocaleText path="games.wheel.rulesStep3" tag="span" /></li>
            <li><UiLocaleText path="games.wheel.rulesStep4" tag="span" /></li>
            <li><UiLocaleText path="games.wheel.rulesStep5" tag="span" /></li>
          </ol>

          <div class="bw-wheel-rent-note mt-4">
            <p class="bw-wheel-rent-note__title">
              <UiLocaleText path="games.wheel.rulesRentTitle" tag="span" />
            </p>
            <p class="bw-wheel-rent-note__body">
              <UiLocaleText path="games.wheel.rulesRentBody" tag="span" />
            </p>
          </div>
          <p class="mt-4 font-bold uppercase text-sm">
            <UiLocaleText path="games.wheel.rulesSkewTitle" tag="span" />
          </p>
          <ul class="mt-2 space-y-1 text-sm whitespace-normal">
            <li><UiLocaleText path="games.wheel.rulesSkew1" tag="span" /></li>
            <li><UiLocaleText path="games.wheel.rulesSkew2" tag="span" /></li>
            <li><UiLocaleText path="games.wheel.rulesSkew3" tag="span" /></li>
            <li><UiLocaleText path="games.wheel.rulesSkew4" tag="span" /></li>
            <li><UiLocaleText path="games.wheel.rulesSkew5" tag="span" /></li>
            <li><UiLocaleText path="games.wheel.rulesSkew6" tag="span" /></li>
          </ul>
          <p class="mt-4 whitespace-normal text-sm">
            <UiLocaleText path="games.wheel.rulesCommission" tag="span" />
          </p>
          <p class="mt-4 text-xs text-[var(--bw-muted)] font-mono whitespace-normal">
            <UiLocaleText path="games.wheel.rulesRng" tag="span" />
          </p>
        </div>

        <div
          role="tabpanel"
          class="bw-game-tabpanel bw-dice-rules"
          :class="{ 'is-inactive': activeTab !== 'trust' }"
        >
          <p class="whitespace-normal mb-4">
            <UiLocaleText path="games.wheel.trustIntro" tag="span" />
          </p>
          <ul class="space-y-2 whitespace-normal">
            <li><UiLocaleText path="games.wheel.trust1" tag="span" /></li>
            <li><UiLocaleText path="games.wheel.trust2" tag="span" /></li>
            <li><UiLocaleText path="games.wheel.trust3" tag="span" /></li>
            <li><UiLocaleText path="games.wheel.trust4" tag="span" /></li>
            <li><UiLocaleText path="games.wheel.trust5" tag="span" /></li>
          </ul>
          <p class="mt-4 whitespace-normal text-sm text-[var(--bw-muted)]">
            <UiLocaleText path="games.wheel.trustScope" tag="span" />
          </p>
          <p class="mt-4 text-xs font-mono whitespace-normal">
            <UiLocaleText path="games.wheel.trustFormula" tag="span" />
          </p>
        </div>
      </div>
    </UiBrokenPanel>

    <div class="text-center">
      <button type="button" class="bw-btn text-sm" @click="goLobby"><UiLocaleText path="games.wheel.back" /></button>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * @agent-context WIBE Wheel faucet UI — free spin → credits casino balance. No auto-roll, no verify.
 * @see composables/useWheel.ts
 */
const { t } = useI18n()
const { playRouteTransition } = useBrutalMotion()
const { showWin, showError } = useBrutalToast()
const {
  faucetRemaining, cooldownUntil, onCooldown, poolEmpty, canSpin, spinning, lastPrize, isConfigured,
  refreshFaucet, spin, cancelSpin,
} = useWheel()

const activeTab = ref<'rules' | 'trust'>('rules')

const PRIZES = [1, 5, 25, 100, 300, 700, 1000, 50]
const angle = ref(0)

const segments = computed(() => {
  const n = PRIZES.length
  const step = 360 / n
  return PRIZES.map((label, i) => {
    const a0 = (i * step - 90) * (Math.PI / 180)
    const a1 = ((i + 1) * step - 90) * (Math.PI / 180)
    const x0 = 100 + 95 * Math.cos(a0)
    const y0 = 100 + 95 * Math.sin(a0)
    const x1 = 100 + 95 * Math.cos(a1)
    const y1 = 100 + 95 * Math.sin(a1)
    const mid = (i + 0.5) * step - 90
    const mr = (mid * Math.PI) / 180
    return {
      label: String(label),
      d: `M100 100 L${x0.toFixed(1)} ${y0.toFixed(1)} A95 95 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)} Z`,
      tx: 100 + 62 * Math.cos(mr),
      ty: 100 + 62 * Math.sin(mr),
      rot: mid + 90,
    }
  })
})

const cooldownLabel = computed(() => {
  const ms = cooldownUntil.value - Date.now()
  if (ms <= 0) return ''
  const h = Math.floor(ms / 3_600_000)
  const m = Math.floor((ms % 3_600_000) / 60_000)
  return t('games.wheel.cooldown', { h, m })
})

onMounted(() => refreshFaucet())

async function onSpin() {
  try {
    angle.value += 360 * 5 + Math.floor(Math.random() * 360) // visual spin
    const prize = await spin()
    showWin(prize, prize >= 300)
  } catch (e) {
    showError(e)
  }
}

function goLobby() {
  playRouteTransition('/', 'instant')
}
</script>

<style scoped>
.bw-wheel-stage {
  position: relative;
  width: min(320px, 80vw);
  margin: 0 auto;
  padding-top: 0.5rem;
}

.bw-wheel {
  width: 100%;
  height: auto;
  display: block;
  filter: drop-shadow(6px 6px 0 var(--bw-accent));
  transition: transform 2.6s cubic-bezier(0.17, 0.67, 0.16, 0.99);
}

.bw-wheel__pointer {
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  color: var(--bw-accent);
  font-size: 1.5rem;
  text-shadow: 2px 2px 0 var(--bw-fg);
}

.bw-wheel__monster {
  width: 70%;
  margin: -8% auto 0;
  display: block;
  opacity: 0.85;
}

.bw-wheel__abort {
  display: block;
  margin: -0.25rem auto 0;
  color: var(--bw-muted);
  cursor: pointer;
}

.bw-wheel__abort:hover {
  color: var(--bw-danger);
}

.bw-wheel__result-slot {
  min-height: 2.5rem;
  text-align: center;
}

.bw-wheel__result {
  font-size: 1.8rem;
  font-weight: 700;
}

.bw-wheel-rent-note {
  padding: 0.75rem;
  border: 3px solid var(--bw-accent);
  background: color-mix(in srgb, var(--bw-accent) 8%, var(--bw-bg));
}

.bw-wheel-rent-note__title {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
  color: var(--bw-accent);
}

.bw-wheel-rent-note__body {
  font-size: 0.85rem;
  line-height: 1.45;
  white-space: normal;
}
</style>
