/**
 * @agent-context Shared virtual fun credits — module-level state for dice + slot.
 * @see ai/decisions/014-fun-mode.md
 */
import { FUN_MODE_START_BALANCE } from '~/shared/fun-mode'

const balance = ref(FUN_MODE_START_BALANCE)
let funNonce = 0n

export function useFunBalance() {
  function topUp() {
    balance.value += FUN_MODE_START_BALANCE
  }

  function reset() {
    balance.value = FUN_MODE_START_BALANCE
    funNonce = 0n
  }

  function nextNonce(): bigint {
    const n = funNonce
    funNonce += 1n
    return n
  }

  function applyDelta(delta: number) {
    balance.value = Math.max(0, balance.value + delta)
  }

  return {
    balance: readonly(balance),
    topUp,
    reset,
    nextNonce,
    applyDelta,
  }
}
