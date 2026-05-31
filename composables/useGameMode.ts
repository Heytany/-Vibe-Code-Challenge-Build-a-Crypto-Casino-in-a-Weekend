/**
 * @agent-context Per-session fun vs live mode — **shared** state across all components.
 * Auto-switches to LIVE when Phantom connects (unless user explicitly chose FUN).
 * @see ai/decisions/014-fun-mode.md
 */
import type { GameMode } from '~/shared/fun-mode'
import { canUseLiveMode } from '~/shared/fun-mode'

const mode = ref<GameMode>('fun')
/** User clicked FUN while wallet + program were ready — don't auto-flip back to LIVE. */
let funPinnedWhileLive = false

export function useGameMode() {
  const { connected } = useWallet()
  const { isConfigured } = useCasinoProgram()

  const canLive = computed(() => canUseLiveMode(connected.value, isConfigured.value))

  watch(canLive, (ok) => {
    if (!ok) {
      mode.value = 'fun'
      funPinnedWhileLive = false
      return
    }
    if (!funPinnedWhileLive) {
      mode.value = 'live'
    }
  })

  function setMode(next: GameMode) {
    if (next === 'live' && !canLive.value) return
    if (next === 'fun') {
      funPinnedWhileLive = canLive.value
    } else {
      funPinnedWhileLive = false
    }
    mode.value = next
  }

  const isFun = computed(() => mode.value === 'fun')

  return {
    mode: readonly(mode),
    isFun,
    canLive,
    setMode,
  }
}
