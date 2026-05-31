/**
 * @agent-context Race an on-chain play RPC against user cancel + signing timeout.
 */
import { WibeError, WibeErrorCode } from '~/shared/errors'

export const LIVE_SIGNING_TIMEOUT_MS = 90_000

/** LIVE signing dismissed / cancelled — auto-roll skips the round without stopping. */
export function isSkippableLiveRoundError(err: unknown): boolean {
  if (!(err instanceof WibeError)) return false
  return err.code === WibeErrorCode.PlayCancelled
    || err.code === WibeErrorCode.WalletRejected
}

export interface SigningRace<T> {
  promise: Promise<T>
  cancel: (reason?: 'user' | 'timeout') => void
}

export function raceLiveSigning<T>(
  operation: Promise<T>,
  timeoutMs = LIVE_SIGNING_TIMEOUT_MS,
): SigningRace<T> {
  let settled = false
  let rejectRace: ((err: WibeError) => void) | null = null
  let timer: ReturnType<typeof setTimeout> | null = null

  const cancelPromise = new Promise<T>((_, reject) => {
    rejectRace = reject
  })

  function finish() {
    if (settled) return
    settled = true
    if (timer) clearTimeout(timer)
    rejectRace = null
  }

  timer = setTimeout(() => {
    rejectRace?.(new WibeError(WibeErrorCode.PlayCancelled, 'Phantom signing timed out'))
  }, timeoutMs)

  const promise = Promise.race([operation, cancelPromise]).finally(finish)

  return {
    promise,
    cancel(reason = 'user') {
      const msg = reason === 'timeout'
        ? 'Phantom signing timed out'
        : 'Play cancelled'
      rejectRace?.(new WibeError(WibeErrorCode.PlayCancelled, msg))
    },
  }
}

/** Ignore stale play results after cancel (RPC may still resolve in background). */
export function createPlayGeneration() {
  let generation = 0
  return {
    next() {
      generation += 1
      return generation
    },
    bump() {
      generation += 1
    },
    isCurrent(gen: number) {
      return gen === generation
    },
  }
}
