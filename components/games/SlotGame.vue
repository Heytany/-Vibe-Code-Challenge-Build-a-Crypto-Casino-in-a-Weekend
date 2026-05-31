<template>
  <div class="bw-dice-page space-y-6">
    <header class="bw-game-head max-w-xl mx-auto w-full">
      <div class="flex items-center justify-between gap-3 flex-wrap">
        <h1 class="text-xl md:text-2xl font-bold uppercase bw-accent">
          <UiLocaleText path="games.slot.title" tag="span" />
        </h1>
        <GamesGameModeToggle />
      </div>
      <p class="text-xs font-mono text-[var(--bw-muted)] mt-1 whitespace-normal">
        <UiLocaleText :path="isFun ? 'games.common.modeExplainFun' : 'games.common.modeExplainLive'" tag="span" />
      </p>
    </header>

    <div class="bw-dice-hero-stage">
      <MotionMatrixPanelBackdrop ref="matrixBackdropRef" />
      <div class="bw-dice-hero-stage__fg">
        <LobbyMonsterReelsHero :spinning="spinning">
          <template #bandit>
            <GamesSlotReelsPanel
              ref="banditRef"
              bare
              :reels="reels"
              :spinning="spinning"
              :won="won"
            />
          </template>
          <template #action>
            <UiBrutalButton
              class="bw-slot-spin-btn"
              variant="accent"
              :loading="busy"
              @click="onSpin"
            >
              <UiLocaleText path="games.slot.spin" tag="span" />
            </UiBrutalButton>
            <p
              v-if="signing && !isFun"
              class="text-xs font-mono text-[var(--bw-muted)] text-center mt-2 whitespace-normal"
            >
              <UiLocaleText path="games.common.confirmInPhantom" tag="span" />
            </p>
          </template>
        </LobbyMonsterReelsHero>
      </div>
    </div>

    <div ref="panelRef" class="bw-dice-controls max-w-xl mx-auto w-full">
      <UiBrokenPanel tilt="right">
        <p class="text-[var(--bw-muted)] text-sm font-mono mb-4">
          <UiLocaleText path="games.slot.subtitle" tag="span" />
        </p>

        <div class="bw-dice-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            class="bw-dice-tabs__btn"
            :class="{ 'is-active': activeTab === 'play' }"
            :aria-selected="activeTab === 'play'"
            @click="activeTab = 'play'"
          >
            <UiLocaleText path="games.slot.tabPlay" tag="span" />
          </button>
          <button
            type="button"
            role="tab"
            class="bw-dice-tabs__btn"
            :class="{ 'is-active': activeTab === 'rules' }"
            :aria-selected="activeTab === 'rules'"
            @click="activeTab = 'rules'"
          >
            <UiLocaleText path="games.slot.tabRules" tag="span" />
          </button>
          <button
            type="button"
            role="tab"
            class="bw-dice-tabs__btn"
            :class="{ 'is-active': activeTab === 'fair' }"
            :aria-selected="activeTab === 'fair'"
            @click="activeTab = 'fair'"
          >
            <UiLocaleText path="games.slot.tabFair" tag="span" />
          </button>
        </div>

        <div class="bw-game-tabpanels">
          <div
            role="tabpanel"
            class="bw-game-tabpanel"
            :class="{ 'is-inactive': activeTab !== 'play' }"
          >
            <GamesGameBetInput
              v-model:bet="bet"
              :is-fun="isFun"
              :disabled="busy"
              :bet-invalid="betInvalid"
              :bet-touched="betTouched"
              @blur-bet="markBetTouched"
            />

            <label class="flex items-center gap-2 text-xs uppercase font-bold mb-3 cursor-pointer">
              <input v-model="showResult" type="checkbox" class="bw-check">
              <UiLocaleText path="games.common.showResult" tag="span" />
            </label>

            <div v-if="showResult" class="bw-game-result-slot">
              <div
                v-show="reels !== null && won !== null && !busy"
                class="bw-dice-result"
                :class="{
                  'is-win': won,
                  'is-lose': !won,
                  'is-super': isSuperWin,
                }"
              >
                <p class="text-xs uppercase text-[var(--bw-muted)] mb-1">
                  <UiLocaleText path="games.slot.youSpun" tag="span" />
                </p>
                <p class="text-3xl font-bold bw-accent mb-2 tracking-widest">
                  {{ reels?.map(slotSymbolChar).join(' ') ?? '' }}
                </p>
                <p class="font-bold uppercase">
                  <UiLocaleText
                    :path="won ? 'games.common.win' : 'games.common.lose'"
                    tag="span"
                  />
                  <span
                    v-if="won && lastMultiplier !== null"
                    class="text-[var(--bw-muted)] font-mono text-sm normal-case ml-2"
                  >
                    (×{{ lastMultiplier }}
                    <span v-if="lastPayoutDelta !== null"> +{{ lastPayoutDelta }}</span>)
                  </span>
                </p>
                <p
                  v-show="isSuperWin"
                  class="mt-2 text-xs font-bold uppercase bw-accent"
                >
                  <UiLocaleText path="games.slot.superWin" tag="span" />
                </p>
              </div>
            </div>

            <p class="text-xs text-[var(--bw-muted)] font-mono mb-6 whitespace-normal">
              <UiLocaleText path="games.slot.payoutHint" tag="span" />
            </p>

          <GamesGameAutoFsBar v-model:bet="bet" :play="playOnce" :disabled="busy" />

          <div class="flex flex-wrap gap-4">
            <button type="button" class="bw-btn" @click="goLobby">
              <UiLocaleText path="common.back" tag="span" />
            </button>
          </div>
          </div>

          <div
            role="tabpanel"
            class="bw-game-tabpanel bw-dice-rules"
            :class="{ 'is-inactive': activeTab !== 'rules' }"
          >
            <p class="whitespace-normal mb-4">
              <UiLocaleText path="games.slot.rulesIntro" tag="span" />
            </p>
            <ol>
              <li><UiLocaleText path="games.slot.rulesStep1" tag="span" /></li>
              <li><UiLocaleText path="games.slot.rulesStep2" tag="span" /></li>
              <li><UiLocaleText path="games.slot.rulesStep3" tag="span" /></li>
              <li><UiLocaleText path="games.slot.rulesStep4" tag="span" /></li>
            </ol>
            <p class="mt-4 text-xs text-[var(--bw-muted)] font-mono whitespace-normal">
              <UiLocaleText path="games.slot.rulesRng" tag="span" />
            </p>
          </div>

          <div
            role="tabpanel"
            class="bw-game-tabpanel"
            :class="{ 'is-inactive': activeTab !== 'fair' }"
          >
            <GamesProvablyFair game="slot" :meta="lastMeta" :slot-symbol-char="slotSymbolChar" />
          </div>
        </div>
      </UiBrokenPanel>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * @agent-context Slot UI — monster holds bandit panel; spin under reels.
 */
const { playRouteTransition, playGameEnter } = useBrutalMotion()
const {
  isFun,
  bet,
  reels,
  won,
  spinning,
  signing,
  busy,
  effectiveBalance,
  isSuperWin,
  lastPayoutDelta,
  lastMultiplier,
  lastMeta,
  spin,
  slotSymbolChar,
} = useGameSlot()

const activeTab = ref<'play' | 'rules' | 'fair'>('play')
const showResult = ref(false)
const panelRef = ref<HTMLElement | null>(null)
const banditRef = ref<ComponentPublicInstance | null>(null)
const matrixBackdropRef = ref<{
  play: (intense?: boolean) => Promise<void>
  playSplit: (segments: number, intense?: boolean) => Promise<void>
} | null>(null)
const { touched: betTouched, invalid: betInvalid, markTouched: markBetTouched, validateBetOrToast } = useBetField(bet)
const { showWin, showError, show } = useBrutalToast()
const { t } = useI18n()

onMounted(() => {
  playGameEnter(panelRef.value)
})

/** segments for the split win animation: triple (×10) → 3, any pair (×2) → 2, else 1 */
function winSegments(): number {
  const m = lastMultiplier.value
  if (m && m >= 10) return 3
  if (m && m >= 2) return 2
  return 1
}

/** One spin; resolves to whether it won. Throws on invalid/insufficient so auto-roll stops. */
async function playOnce(): Promise<boolean> {
  if (!validateBetOrToast()) throw new Error('invalid-bet')
  const el = (banditRef.value?.$el as HTMLElement | undefined) ?? null
  await spin(el)
  if (!isFun.value) showResult.value = true
  if (won.value) {
    showWin(lastPayoutDelta.value, isSuperWin.value, { isLive: !isFun.value })
    await matrixBackdropRef.value?.playSplit(winSegments(), isSuperWin.value)
  } else if (won.value === false && !isFun.value) {
    show(t('games.common.lose'), t('games.common.loseLive'), 'default')
  }
  return Boolean(won.value)
}

async function onSpin() {
  try {
    await playOnce()
  } catch (e) {
    if ((e as Error)?.message !== 'invalid-bet') showError(e)
  }
}

function goLobby() {
  playRouteTransition('/', 'instant')
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

.bw-dice-page {
  padding-top: 0.5rem;
  overflow-x: clip;
  max-width: 100%;
}
</style>
