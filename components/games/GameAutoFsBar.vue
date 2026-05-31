<template>
  <div class="bw-auto" :aria-label="t('games.auto.title')">
    <p class="bw-auto__title">
      <UiLocaleText path="games.auto.title" tag="span" />
    </p>

    <div class="bw-auto__grid">
      <label class="bw-auto__field">
        <span class="bw-auto__field-label"><UiLocaleText path="games.auto.betPerRoll" tag="span" /></span>
        <input v-model.number="bet" type="number" min="1" class="bw-input" :disabled="running">
      </label>

      <div class="bw-auto__field">
        <span class="bw-auto__field-label"><UiLocaleText path="games.auto.rounds" tag="span" /></span>
        <div class="bw-auto__rounds-row">
          <input
            v-model.number="rounds"
            type="number"
            min="1"
            class="bw-input bw-auto__rounds-input"
            :class="{ 'bw-auto__dim': endless }"
            :disabled="running || endless"
            :aria-label="t('games.auto.rounds')"
          >
          <button
            type="button"
            class="bw-auto__inf"
            :class="{ 'is-on': endless }"
            :disabled="running"
            :aria-pressed="endless"
            :aria-label="endless ? t('games.auto.infiniteOn') : t('games.auto.infiniteOff')"
            :title="endless ? t('games.auto.infiniteOn') : t('games.auto.infiniteOff')"
            @click="endless = !endless"
          >
            <Infinity :size="26" :stroke-width="2.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>

    <div class="bw-auto__settings">
      <div class="bw-auto__speed-row">
        <span class="bw-auto__label"><UiLocaleText path="games.auto.speed" tag="span" /></span>
        <div class="bw-seg" role="radiogroup" :aria-label="t('games.auto.speed')">
          <button
            type="button"
            role="radio"
            class="bw-seg__opt"
            :class="{ 'is-on': speed === 1 }"
            :aria-checked="speed === 1"
            @click="setSpeed(1)"
          >
            <UiLocaleText path="games.auto.x1" tag="span" />
          </button>
          <button
            type="button"
            role="radio"
            class="bw-seg__opt"
            :class="{ 'is-on': speed === 2 }"
            :aria-checked="speed === 2"
            @click="setSpeed(2)"
          >
            <UiLocaleText path="games.auto.x2" tag="span" />
          </button>
        </div>
      </div>

      <label class="bw-auto__check">
        <input v-model="stopOnWin" type="checkbox" class="bw-check" :disabled="running">
        <UiLocaleText path="games.auto.stopOnWin" tag="span" />
      </label>
    </div>

    <div class="bw-auto__actions">
      <button
        type="button"
        class="bw-btn bw-auto__go"
        :class="{ 'bw-auto__stop': running }"
        :disabled="disabled && !running"
        @click="onToggleAuto"
      >
        <template v-if="running">
          <UiLocaleText path="games.auto.stop" tag="span" />
          <span v-if="remaining >= 0" class="font-mono ml-1">({{ remaining }})</span>
        </template>
        <UiLocaleText v-else path="games.auto.start" tag="span" />
      </button>

      <button type="button" class="bw-btn bw-auto__fs" @click="toggle">
        <UiLocaleText :path="isFullscreen ? 'games.auto.exit' : 'games.auto.fullscreen'" tag="span" />
      </button>
    </div>

    <UiPrimitivesBrutalAlert
      v-model:open="skipPromptOpen"
      :title="t('games.auto.skipPromptTitle')"
      :description="t('games.auto.skipPromptBody', { n: skipPromptCount })"
      :cancel-label="t('games.auto.skipPromptContinue')"
      :action-label="t('games.auto.skipPromptStop')"
      @cancel="resolveSkipPrompt('continue')"
      @action="resolveSkipPrompt('stop')"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * @agent-context Auto-roll + speed + fullscreen control bar shared by Dice and Slot.
 * `play` runs one round and resolves to whether it won (for stop-on-win). Fullscreen uses the
 * document root so body-teleported win toasts stay visible.
 * @see composables/useAutoPlay.ts, composables/useFullscreen.ts, ai/decisions/016-game-automation-fullscreen.md
 */
import type { AutoPlayActionResult } from '~/composables/useAutoPlay'
import { Infinity } from 'lucide-vue-next'

const props = defineProps<{
  play: () => Promise<AutoPlayActionResult>
  disabled?: boolean
}>()

const bet = defineModel<number>('bet', { default: 10 })

const { t } = useI18n()
const { setMotionSpeed } = useBrutalMotion()
const { running, remaining, start, stop } = useAutoPlay()
const { isFullscreen, toggle } = useFullscreen()
const { show, showError } = useBrutalToast()

const rounds = ref(10)
const endless = ref(false)
const stopOnWin = ref(false)
const speed = ref<1 | 2>(1)
const skipPromptOpen = ref(false)
const skipPromptCount = ref(0)

let skipPromptResolver: ((choice: 'continue' | 'stop') => void) | null = null

function promptAfterSkips(count: number): Promise<'continue' | 'stop'> {
  skipPromptCount.value = count
  skipPromptOpen.value = true
  return new Promise((resolve) => {
    skipPromptResolver = resolve
  })
}

function resolveSkipPrompt(choice: 'continue' | 'stop') {
  skipPromptOpen.value = false
  skipPromptResolver?.(choice)
  skipPromptResolver = null
}

function stopAutoRoll() {
  if (skipPromptResolver) resolveSkipPrompt('stop')
  stop()
}

function setSpeed(s: 1 | 2) {
  speed.value = s
  setMotionSpeed(s)
}

async function onToggleAuto() {
  if (running.value) {
    stopAutoRoll()
    return
  }
  // controls sit below the game — scroll the monster + dice/reels into view so rolls are visible
  document.querySelector('.bw-dice-hero-stage')?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  const summary = await start(props.play, {
    rounds: endless.value ? Number.POSITIVE_INFINITY : Math.max(1, rounds.value || 1),
    stopOnWin: stopOnWin.value,
    delayMs: 350 / speed.value,
    onConsecutiveSkips: promptAfterSkips,
  })

  // Report why auto-roll stopped (win toasts are already shown per round).
  if (summary.reason === 'error') {
    if (summary.error) showError(summary.error)
    return
  }
  if (summary.reason === 'rounds') {
    if (summary.wins === 0) {
      show(t('games.auto.doneTitle'), t('games.auto.doneNoWin', { n: summary.played }), 'default')
    } else {
      show(t('games.auto.doneTitle'), t('games.auto.doneWins', { wins: summary.wins, n: summary.played }), 'success')
    }
  }
}

// restore normal speed when leaving the game
onUnmounted(() => {
  setMotionSpeed(1)
  if (skipPromptResolver) resolveSkipPrompt('stop')
})
</script>

<style scoped>
.bw-auto {
  border: 2px dashed var(--bw-muted);
  padding: 0.75rem;
  margin-bottom: 1.5rem;
}

/* inputs styled here too — DiceGame/SlotGame .bw-input is scoped and doesn't reach this child */
.bw-auto :deep(.bw-input),
.bw-auto input.bw-input {
  min-height: 44px;
  padding: 0.5rem 0.75rem;
  border: 3px solid var(--bw-border);
  background: var(--bw-bg);
  color: var(--bw-fg);
  font-family: var(--bw-font);
  font-weight: 700;
  font-size: 1rem;
  opacity: 1;
}

.bw-auto input.bw-input::placeholder {
  color: var(--bw-muted);
}

.bw-auto__title {
  font-size: 0.7rem;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--bw-muted);
  margin-bottom: 0.6rem;
}

.bw-auto__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

@media (max-width: 420px) {
  .bw-auto__grid {
    grid-template-columns: 1fr;
  }
}

.bw-auto__field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.bw-auto__field-label {
  font-size: 0.65rem;
  text-transform: uppercase;
  font-weight: 700;
}

.bw-auto__rounds-row {
  display: flex;
  align-items: stretch;
  gap: 0.5rem;
  min-width: 0;
}

.bw-auto__rounds-input {
  flex: 1 1 0;
  min-width: 0;
  width: auto;
}

.bw-auto__settings {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.bw-auto__speed-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem 0.75rem;
}

.bw-auto__label {
  font-size: 0.65rem;
  text-transform: uppercase;
  font-weight: 700;
  flex-shrink: 0;
}

.bw-auto__check {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 48px;
  padding: 0.5rem 0.75rem;
  border: 3px solid var(--bw-border);
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  cursor: pointer;
  width: 100%;
}

.bw-auto__check .bw-check {
  width: 26px;
  height: 26px;
}

.bw-auto__check .bw-check::before {
  width: 12px;
  height: 12px;
}

/* segmented radio for speed — clear current-state */
.bw-seg {
  display: inline-flex;
  border: 3px solid var(--bw-border);
}

.bw-seg__opt {
  min-height: 44px;
  min-width: 48px;
  padding: 0 0.75rem;
  background: var(--bw-bg);
  color: var(--bw-fg);
  font-family: var(--bw-font);
  font-weight: 700;
  cursor: pointer;
  border: none;
}

.bw-seg__opt + .bw-seg__opt {
  border-left: 3px solid var(--bw-border);
}

.bw-seg__opt.is-on {
  background: var(--bw-accent);
  color: var(--bw-bg);
}

.bw-seg__opt:focus-visible {
  outline: 3px solid var(--bw-accent);
  outline-offset: 2px;
}

/* action row — Start grows, Fullscreen wraps under on narrow screens */
.bw-auto__actions {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

@media (min-width: 480px) {
  .bw-auto__actions {
    grid-template-columns: 1fr 1fr;
  }
}

.bw-auto__go,
.bw-auto__fs {
  width: 100%;
  min-width: 0;
}

.bw-auto__stop {
  background: var(--bw-danger);
  color: var(--bw-bg);
  border-color: var(--bw-danger);
}

.bw-auto__dim {
  opacity: 0.4;
}

.bw-auto__inf {
  flex: 0 0 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  min-width: 48px;
  padding: 0;
  border: 3px solid var(--bw-border);
  background: var(--bw-bg);
  color: var(--bw-muted);
  font-family: var(--bw-font);
  cursor: pointer;
}

.bw-auto__inf:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.bw-auto__inf.is-on {
  background: var(--bw-accent);
  color: var(--bw-bg);
  border-color: var(--bw-accent);
}
</style>
