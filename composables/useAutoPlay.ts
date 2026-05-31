/**
 * @agent-context Auto-roll engine — repeatedly runs a game action (dice roll / slot spin)
 * for a fixed number of rounds or until stopped / a win, with a per-round delay. Used by
 * the game settings automation module.
 * @see components/games/GameAutoFsBar.vue, ai/decisions/016-game-automation-fullscreen.md
 */
export type AutoPlayActionResult = boolean | 'skip'

export const AUTO_ROLL_SKIP_PROMPT_THRESHOLD = 3

export interface AutoPlayOptions {
  rounds: number // Number.POSITIVE_INFINITY for endless
  stopOnWin?: boolean
  delayMs?: number
  /** After N consecutive LIVE cancels, await user choice before continuing. */
  onConsecutiveSkips?: (count: number) => Promise<'continue' | 'stop'>
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
    action: () => Promise<AutoPlayActionResult>,
    opts: AutoPlayOptions,
  ): Promise<AutoPlaySummary> {
    if (running.value) return { played: 0, wins: 0, reason: 'cancelled' }
    const { rounds, stopOnWin = false, delayMs = 350 } = opts
    running.value = true
    cancelled = false
    remaining.value = Number.isFinite(rounds) ? rounds : -1

    let n = 0
    let wins = 0
    let consecutiveSkips = 0
    let reason: AutoPlayReason = 'rounds'
    let error: unknown

    while (!cancelled && (!Number.isFinite(rounds) || n < rounds)) {
      let won = false
      try {
        const result = await action()
        if (result === 'skip') {
          consecutiveSkips += 1
          if (
            consecutiveSkips >= AUTO_ROLL_SKIP_PROMPT_THRESHOLD
            && opts.onConsecutiveSkips
            && !cancelled
          ) {
            const choice = await opts.onConsecutiveSkips(consecutiveSkips)
            consecutiveSkips = 0
            if (choice === 'stop' || cancelled) {
              reason = 'cancelled'
              break
            }
          }
          continue
        }
        consecutiveSkips = 0
        won = result
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
