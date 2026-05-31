/**
 * @agent-context Auto-roll engine — repeatedly runs a game action (dice roll / slot spin)
 * for a fixed number of rounds or until stopped / a win, with a per-round delay. Used by
 * the game settings automation module.
 * @see components/games/GameAutoFsBar.vue, ai/decisions/016-game-automation-fullscreen.md
 */
export interface AutoPlayOptions {
  rounds: number // Number.POSITIVE_INFINITY for endless
  stopOnWin?: boolean
  delayMs?: number
}

export type AutoPlayReason = 'rounds' | 'win' | 'cancelled' | 'error'

export interface AutoPlaySummary {
  played: number
  wins: number
  reason: AutoPlayReason
  error?: unknown
}

export function useAutoPlay() {
  const running = ref(false)
  const remaining = ref(0)
  let cancelled = false

  async function start(
    action: () => Promise<boolean>,
    opts: AutoPlayOptions,
  ): Promise<AutoPlaySummary> {
    if (running.value) return { played: 0, wins: 0, reason: 'cancelled' }
    const { rounds, stopOnWin = false, delayMs = 350 } = opts
    running.value = true
    cancelled = false
    remaining.value = Number.isFinite(rounds) ? rounds : -1

    let n = 0
    let wins = 0
    let reason: AutoPlayReason = 'rounds'
    let error: unknown

    while (!cancelled && (!Number.isFinite(rounds) || n < rounds)) {
      let won = false
      try {
        won = await action()
      } catch (e) {
        reason = 'error'
        error = e
        break
      }
      n += 1
      if (won) wins += 1
      if (Number.isFinite(rounds)) remaining.value = rounds - n
      if (stopOnWin && won) {
        reason = 'win'
        break
      }
      if (cancelled) {
        reason = 'cancelled'
        break
      }
      await new Promise((r) => setTimeout(r, delayMs))
    }
    if (cancelled && reason === 'rounds') reason = 'cancelled'

    running.value = false
    remaining.value = 0
    return { played: n, wins, reason, error }
  }

  function stop() {
    cancelled = true
    running.value = false
  }

  onUnmounted(stop)

  return { running, remaining, start, stop }
}
