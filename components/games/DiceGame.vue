<template>
  <div class="bw-dice-page space-y-6">
    <header class="bw-game-head max-w-xl mx-auto w-full">
      <div class="flex items-center justify-between gap-3 flex-wrap">
        <h1 class="text-xl md:text-2xl font-bold uppercase bw-accent">
          <UiLocaleText path="games.dice.title" tag="span" />
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
        <LobbyMonsterHero variant="dice" :rolling="playing">
          <template #center>
            <div class="bw-dice-hero-center">
              <GamesDiceCube
                ref="diceCubeRef"
                :value="lastRoll"
                :rolling="playing"
                :won="won"
              />
              <UiBrutalButton
                class="bw-dice-roll-btn"
                :loading="playing"
                @click="onRoll"
              >
                <UiLocaleText path="games.dice.roll" tag="span" />
              </UiBrutalButton>
            </div>
          </template>
        </LobbyMonsterHero>
      </div>
    </div>

    <div ref="panelRef" class="bw-dice-controls max-w-xl mx-auto w-full">
      <UiBrokenPanel>
        <p class="text-[var(--bw-muted)] text-sm font-mono mb-4">
          <UiLocaleText path="games.dice.subtitle" tag="span" />
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
            <UiLocaleText path="games.dice.tabPlay" tag="span" />
          </button>
          <button
            type="button"
            role="tab"
            class="bw-dice-tabs__btn"
            :class="{ 'is-active': activeTab === 'rules' }"
            :aria-selected="activeTab === 'rules'"
            @click="activeTab = 'rules'"
          >
            <UiLocaleText path="games.dice.tabRules" tag="span" />
          </button>
          <button
            type="button"
            role="tab"
            class="bw-dice-tabs__btn"
            :class="{ 'is-active': activeTab === 'fair' }"
            :aria-selected="activeTab === 'fair'"
            @click="activeTab = 'fair'"
          >
            <UiLocaleText path="games.dice.tabFair" tag="span" />
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

            <label class="flex items-center gap-2 text-xs uppercase font-bold mb-3 cursor-pointer">
              <input v-model="showResult" type="checkbox" class="bw-check">
              <UiLocaleText path="games.common.showResult" tag="span" />
            </label>

            <div v-if="showResult" class="bw-game-result-slot">
              <div
                v-show="lastRoll !== null && won !== null && !playing"
                class="bw-dice-result"
                :class="{
                  'is-win': won,
                  'is-lose': !won,
                  'is-super': isSuperWin,
                }"
              >
                <p class="text-xs uppercase text-[var(--bw-muted)] mb-1">
                  <UiLocaleText path="games.dice.youRolled" tag="span" />
                </p>
                <p class="text-3xl font-bold bw-accent mb-2">{{ lastRoll }}</p>
                <p class="font-bold uppercase">
                  <UiLocaleText
                    :path="won ? 'games.common.win' : 'games.common.lose'"
                    tag="span"
                  />
                  <span
                    v-if="won && lastPayoutDelta !== null"
                    class="text-[var(--bw-muted)] font-mono text-sm normal-case ml-2"
                  >
                    (+{{ lastPayoutDelta }})
                  </span>
                </p>
                <p
                  v-show="isSuperWin"
                  class="mt-2 text-xs font-bold uppercase bw-accent"
                >
                  <UiLocaleText path="games.dice.superWin" tag="span" />
                </p>
              </div>
            </div>

            <div class="grid gap-4 sm:grid-cols-2 items-center mb-6">
            <div class="font-mono space-y-1 text-center sm:text-left">
              <span class="text-xs uppercase font-bold block">
                <UiLocaleText path="games.common.balance" tag="span" />
              </span>
              <span class="text-[var(--bw-accent)] text-2xl font-bold">
                {{ effectiveBalance ?? '—' }}
                <span v-if="isFun" class="text-[var(--bw-muted)] text-xs ml-1">(fun)</span>
              </span>
            </div>
            <label class="block space-y-2 text-center sm:text-right">
              <span class="text-xs uppercase font-bold block">
                <UiLocaleText path="games.common.bet" tag="span" />
              </span>
              <input
                v-model.number="bet"
                type="number"
                min="1"
                class="bw-input w-full text-center"
                :class="{ 'bw-input--invalid': betInvalid && betTouched }"
                :disabled="playing"
                @blur="markBetTouched"
              >
            </label>
          </div>

          <WalletCasinoActions :panel-el="panelRef" class="mb-6" />

          <div class="space-y-4 mb-6">
            <div class="space-y-2">
              <span class="text-xs uppercase font-bold block">
                <UiLocaleText path="games.dice.target" tag="span" />
                : {{ target }}
              </span>
              <SliderRoot
                class="bw-slider"
                :model-value="[target]"
                :min="2"
                :max="98"
                :step="1"
                :disabled="playing"
                aria-label="target"
                @update:model-value="(v) => { if (v) target = v[0] }"
              >
                <SliderTrack class="bw-slider__track">
                  <SliderRange class="bw-slider__range" />
                </SliderTrack>
                <SliderThumb class="bw-slider__thumb" />
              </SliderRoot>
            </div>
            <p class="text-xs text-[var(--bw-muted)] font-mono">
              <UiLocaleText path="games.dice.chance" tag="span" />: {{ winChance }}%
            </p>
            <RadioGroupRoot v-model="direction" class="flex flex-wrap gap-2" :disabled="playing">
              <RadioGroupItem
                value="under"
                class="bw-btn text-sm min-h-[44px]"
                :class="{ 'bg-[var(--bw-accent)] text-[var(--bw-bg)]': direction === 'under' }"
              >
                <UiLocaleText path="games.dice.rollUnder" tag="span" />
              </RadioGroupItem>
              <RadioGroupItem
                value="over"
                class="bw-btn text-sm min-h-[44px]"
                :class="{ 'bg-[var(--bw-accent)] text-[var(--bw-bg)]': direction === 'over' }"
              >
                <UiLocaleText path="games.dice.rollOver" tag="span" />
              </RadioGroupItem>
            </RadioGroupRoot>
          </div>

          <GamesGameAutoFsBar v-model:bet="bet" :play="playOnce" :disabled="playing" />

          <div class="flex flex-wrap gap-4">
            <button type="button" class="bw-btn" @click="goLobby">
              <UiLocaleText path="common.back" tag="span" />
            </button>
            <button
              v-if="isFun"
              type="button"
              class="bw-btn text-sm"
              :disabled="playing"
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
              <UiLocaleText path="games.dice.rulesIntro" tag="span" />
            </p>
            <ol>
              <li><UiLocaleText path="games.dice.rulesStep1" tag="span" /></li>
              <li><UiLocaleText path="games.dice.rulesStep2" tag="span" /></li>
              <li><UiLocaleText path="games.dice.rulesStep3" tag="span" /></li>
              <li><UiLocaleText path="games.dice.rulesStep4" tag="span" /></li>
            </ol>
            <p class="mt-4 text-xs text-[var(--bw-muted)] font-mono whitespace-normal">
              <UiLocaleText path="games.dice.rulesRng" tag="span" />
            </p>
          </div>

          <div
            role="tabpanel"
            class="bw-game-tabpanel"
            :class="{ 'is-inactive': activeTab !== 'fair' }"
          >
            <GamesProvablyFair game="dice" :meta="lastMeta" />
          </div>
        </div>
      </UiBrokenPanel>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * @agent-context Dice UI — monster + cube + roll btn on top; tabbed controls below.
 * Target uses Reka Slider, under/over uses Reka RadioGroup (keyboard + a11y for free).
 */
import { RadioGroupItem, RadioGroupRoot, SliderRange, SliderRoot, SliderThumb, SliderTrack } from 'reka-ui'

const { playRouteTransition, playGameEnter } = useBrutalMotion()
const {
  isFun,
  bet,
  target,
  direction,
  lastRoll,
  won,
  playing,
  winChance,
  effectiveBalance,
  isSuperWin,
  lastPayoutDelta,
  lastMeta,
  roll,
  resetFunBalance,
} = useGameDice()

const activeTab = ref<'play' | 'rules' | 'fair'>('play')
const showResult = ref(false)
const panelRef = ref<HTMLElement | null>(null)
const diceCubeRef = ref<ComponentPublicInstance | null>(null)
const matrixBackdropRef = ref<{ play: (intense?: boolean) => Promise<void> } | null>(null)
const { touched: betTouched, invalid: betInvalid, markTouched: markBetTouched, validateBetOrToast } = useBetField(bet)
const { showWin, showError } = useBrutalToast()

onMounted(() => {
  playGameEnter(panelRef.value)
})

/** One round; resolves to whether it won. Throws on invalid/insufficient so auto-roll stops. */
async function playOnce(): Promise<boolean> {
  if (!validateBetOrToast()) throw new Error('invalid-bet')
  const el = (diceCubeRef.value?.$el as HTMLElement | undefined) ?? null
  await roll(el)
  if (won.value) {
    showWin(lastPayoutDelta.value, isSuperWin.value)
    await matrixBackdropRef.value?.play(isSuperWin.value)
  }
  return Boolean(won.value)
}

async function onRoll() {
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
