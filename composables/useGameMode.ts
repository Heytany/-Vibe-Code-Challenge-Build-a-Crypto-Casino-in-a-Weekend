/**
 * @agent-context Per-session fun vs live mode — fun default, no wallet required.
 * @see ai/decisions/014-fun-mode.md
 */
import type { GameMode } from '~/shared/fun-mode'
import { canUseLiveMode } from '~/shared/fun-mode'

export function useGameMode() {
  const mode = ref<GameMode>('fun')
  const { connected } = useWallet()
  const { isConfigured } = useCasinoProgram()

  const canLive = computed(() => canUseLiveMode(connected.value, isConfigured.value))

  watch(canLive, (ok) => {
    if (!ok && mode.value === 'live') mode.value = 'fun'
  })

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
