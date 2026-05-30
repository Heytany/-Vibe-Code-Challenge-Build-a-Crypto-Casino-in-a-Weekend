/**
 * @agent-context Dice game client logic — wraps play_dice instruction.
 * @see ai/specs/game-dice.md, ai/specs/rng.md
 * @failure-modes: INVALID_BET, INSUFFICIENT_BALANCE, TRANSACTION_FAILED
 */
import { WibeError, WibeErrorCode } from '~/shared/errors'

export type DiceDirection = 'under' | 'over'

export function useGameDice() {
  const { connected } = useWallet()
  const { casinoBalance } = useCasinoProgram()

  const bet = ref(1)
  const target = ref(50)
  const direction = ref<DiceDirection>('under')
  const lastRoll = ref<number | null>(null)
  const playing = ref(false)

  async function roll() {
    if (!connected.value) throw new WibeError(WibeErrorCode.WalletNotConnected)
    if (bet.value <= 0 || target.value < 2 || target.value > 98) {
      throw new WibeError(WibeErrorCode.InvalidBet)
    }
    if (casinoBalance.value !== null && casinoBalance.value < bet.value) {
      throw new WibeError(WibeErrorCode.InsufficientBalance)
    }

    playing.value = true
    try {
      // TODO: call useCasinoProgram().playDice({ bet, target, direction, userSeed })
      lastRoll.value = null
      throw new WibeError(WibeErrorCode.TransactionFailed, 'play_dice not wired — implement next')
    } finally {
      playing.value = false
    }
  }

  return {
    bet,
    target,
    direction,
    lastRoll: readonly(lastRoll),
    playing: readonly(playing),
    roll,
  }
}
