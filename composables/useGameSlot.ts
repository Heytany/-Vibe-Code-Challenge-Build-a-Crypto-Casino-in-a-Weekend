/**
 * @agent-context Slot game client logic — wraps play_slot instruction.
 * @see ai/specs/game-slot.md, ai/specs/rng.md
 * @failure-modes: INVALID_BET, INSUFFICIENT_BALANCE, TRANSACTION_FAILED
 */
import { WibeError, WibeErrorCode } from '~/shared/errors'

export function useGameSlot() {
  const { connected } = useWallet()
  const { casinoBalance } = useCasinoProgram()

  const bet = ref(1)
  const reels = ref<[number, number, number] | null>(null)
  const spinning = ref(false)

  async function spin() {
    if (!connected.value) throw new WibeError(WibeErrorCode.WalletNotConnected)
    if (bet.value <= 0) throw new WibeError(WibeErrorCode.InvalidBet)
    if (casinoBalance.value !== null && casinoBalance.value < bet.value) {
      throw new WibeError(WibeErrorCode.InsufficientBalance)
    }

    spinning.value = true
    try {
      // TODO: call useCasinoProgram().playSlot({ bet, userSeed })
      reels.value = null
      throw new WibeError(WibeErrorCode.TransactionFailed, 'play_slot not wired — implement next')
    } finally {
      spinning.value = false
    }
  }

  return {
    bet,
    reels: readonly(reels),
    spinning: readonly(spinning),
    spin,
  }
}
