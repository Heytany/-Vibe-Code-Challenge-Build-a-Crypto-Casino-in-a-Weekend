/**
 * @agent-context Per-session fun vs live mode — **shared** state across all components.
 * Default FUN until wallet + program ready; then auto LIVE on connect.
 * @see ai/decisions/014-fun-mode.md
 */
import type { GameMode } from '~/shared/fun-mode'
import { canUseLiveMode } from '~/shared/fun-mode'

const mode = ref<GameMode>('fun')
let modeWatchRegistered = false

export function useGameMode() {
  const { connected } = useWallet()
  const { isConfigured } = useCasinoProgram()

  const canLive = computed(() => canUseLiveMode(connected.value, isConfigured.value))

  if (import.meta.client && !modeWatchRegistered) {
    watch(canLive, (ok) => {
      if (ok) {
        mode.value = 'live'
      } else if (mode.value === 'live') {
        mode.value = 'fun'
      }
    }, { immediate: true })
    modeWatchRegistered = true
  }

  function setMode(next: GameMode) {
    if (next === 'live' && !canLive.value) return
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
