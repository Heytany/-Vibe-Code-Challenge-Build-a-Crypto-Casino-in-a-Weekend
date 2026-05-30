/**
 * @agent-context Slot game — fun mode (client RNG) + live mode (on-chain, when wired).
 * @see ai/specs/game-slot.md, ai/decisions/014-fun-mode.md
 */
import {
  computeReels,
  slotNetDelta,
  slotPayoutMultiplier,
} from '~/shared/rng-verify'
import {
  FUN_MODE_HOUSE_EDGE_BPS,
  FUN_MODE_START_BALANCE,
  randomBlockhash32,
  randomU64,
} from '~/shared/fun-mode'
import { WibeError, WibeErrorCode } from '~/shared/errors'

export interface SlotFunSpinMeta {
  mode: 'fun'
  reels: [number, number, number]
  multiplier: number
  won: boolean
  userSeed: bigint
  nonce: bigint
  blockhash: Uint8Array
  bet: number
}

export type SlotSpinMeta = SlotFunSpinMeta | null

const SYMBOLS = ['7', 'X', '#', '?', '!', '0']

export function slotSymbolChar(index: number): string {
  return SYMBOLS[index] ?? '?'
}

export function useGameSlot() {
  const { connected } = useWallet()
  const { casinoBalance } = useCasinoProgram()
  const { isFun } = useGameMode()
  const { playWinBurst } = useBrutalMotion()

  const bet = ref(10)
  const reels = ref<[number, number, number] | null>(null)
  const lastMeta = ref<SlotSpinMeta>(null)
  const spinning = ref(false)
  const funBalance = ref(FUN_MODE_START_BALANCE)
  let funNonce = 0n

  const effectiveBalance = computed(() =>
    isFun.value ? funBalance.value : casinoBalance.value,
  )

  function validateBet() {
    if (bet.value <= 0) throw new WibeError(WibeErrorCode.InvalidBet)
    const bal = effectiveBalance.value
    if (bal !== null && bal < bet.value) {
      throw new WibeError(WibeErrorCode.InsufficientBalance)
    }
  }

  async function spinFun(resultEl?: HTMLElement | null) {
    validateBet()
    spinning.value = true
    try {
      await new Promise(r => setTimeout(r, 400))
      const userSeed = randomU64()
      const blockhash = randomBlockhash32()
      const nonce = funNonce
      funNonce += 1n

      const nextReels = computeReels(blockhash, userSeed, nonce)
      const multiplier = slotPayoutMultiplier(nextReels[0], nextReels[1], nextReels[2])
      const didWin = multiplier > 0
      const delta = slotNetDelta(BigInt(bet.value), multiplier, FUN_MODE_HOUSE_EDGE_BPS)

      funBalance.value = Math.max(0, funBalance.value + Number(delta))
      reels.value = nextReels
      lastMeta.value = {
        mode: 'fun',
        reels: nextReels,
        multiplier,
        won: didWin,
        userSeed,
        nonce,
        blockhash,
        bet: bet.value,
      }

      if (didWin && resultEl) playWinBurst(resultEl)
      return lastMeta.value
    } finally {
      spinning.value = false
    }
  }

  async function spinLive(_resultEl?: HTMLElement | null) {
    if (!connected.value) throw new WibeError(WibeErrorCode.WalletNotConnected)
    validateBet()
    spinning.value = true
    try {
      throw new WibeError(
        WibeErrorCode.TransactionFailed,
        'Live mode: wire useCasinoProgram.playSlot — see iterations/04-plan-dice-game.md',
      )
    } finally {
      spinning.value = false
    }
  }

  async function spin(resultEl?: HTMLElement | null) {
    if (isFun.value) return spinFun(resultEl)
    return spinLive(resultEl)
  }

  return {
    isFun,
    bet,
    reels: readonly(reels),
    lastMeta: readonly(lastMeta),
    spinning: readonly(spinning),
    effectiveBalance,
    funBalance: readonly(funBalance),
    spin,
    slotSymbolChar,
  }
}
