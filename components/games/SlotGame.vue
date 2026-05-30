<template>
  <div class="bw-dice-page space-y-6">
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
              :loading="spinning"
              @click="onSpin"
            >
              <UiLocaleText path="games.slot.spin" tag="span" />
            </UiBrutalButton>
          </template>
        </LobbyMonsterReelsHero>
      </div>
    </div>

    <div ref="panelRef" class="bw-dice-controls max-w-xl mx-auto w-full">
      <UiBrokenPanel tilt="right">
        <div class="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <p class="text-[var(--bw-muted)] text-sm font-mono mb-1">
              <UiLocaleText path="games.slot.subtitle" tag="span" />
            </p>
            <h2 class="text-xl font-bold uppercase bw-accent">
              <UiLocaleText path="games.slot.title" tag="span" />
            </h2>
          </div>
          <GamesGameModeToggle />
        </div>

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
        </div>

        <div class="bw-game-tabpanels">
          <div
            role="tabpanel"
            class="bw-game-tabpanel"
            :class="{ 'is-inactive': activeTab !== 'play' }"
          >
            <p
              v-if="isFun"
              class="bw-fun-banner text-xs font-mono uppercase mb-4 px-3 py-2 border-2 border-[var(--bw-accent)] text-[var(--bw-accent)]"
            >
              <UiLocaleText path="games.common.funBanner" tag="span" />
            </p>

            <div class="bw-game-result-slot">
              <div
                v-show="reels !== null && won !== null && !spinning"
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

            <div class="grid gap-4 sm:grid-cols-2 mb-6">
            <label class="block space-y-2">
              <span class="text-xs uppercase font-bold">
                <UiLocaleText path="games.common.bet" tag="span" />
              </span>
              <input
                v-model.number="bet"
                type="number"
                min="1"
                class="bw-input w-full"
                :disabled="spinning"
              >
            </label>
            <div class="text-xs font-mono space-y-1">
              <span class="uppercase font-bold block">
                <UiLocaleText path="games.common.balance" tag="span" />
              </span>
              <span class="text-[var(--bw-accent)] text-lg">
                {{ effectiveBalance ?? '—' }}
                <span v-if="isFun" class="text-[var(--bw-muted)] text-xs ml-1">(fun)</span>
              </span>
            </div>
          </div>

          <p class="text-xs text-[var(--bw-muted)] font-mono mb-6 whitespace-normal">
            <UiLocaleText path="games.slot.payoutHint" tag="span" />
          </p>

          <div class="flex flex-wrap gap-4">
            <button type="button" class="bw-btn" @click="goLobby">
              <UiLocaleText path="common.back" tag="span" />
            </button>
            <button
              v-if="isFun"
              type="button"
              class="bw-btn text-sm"
              :disabled="spinning"
              @click="resetFunBalance"
            >
              <UiLocaleText path="games.common.resetFun" tag="span" />
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
  effectiveBalance,
  isSuperWin,
  lastPayoutDelta,
  lastMultiplier,
  spin,
  resetFunBalance,
  slotSymbolChar,
} = useGameSlot()

const activeTab = ref<'play' | 'rules'>('play')
const panelRef = ref<HTMLElement | null>(null)
const banditRef = ref<ComponentPublicInstance | null>(null)
const matrixBackdropRef = ref<{ play: (intense?: boolean) => Promise<void> } | null>(null)

onMounted(() => {
  playGameEnter(panelRef.value)
})

async function onSpin() {
  try {
    const el = (banditRef.value?.$el as HTMLElement | undefined) ?? null
    await spin(el)
    if (won.value) {
      await matrixBackdropRef.value?.play(isSuperWin.value)
    }
  } catch (e) {
    useBrutalToast().showError(e)
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
