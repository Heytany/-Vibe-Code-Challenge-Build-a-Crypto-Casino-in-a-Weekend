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
import { isSlotSuperWin } from '~/shared/slot-super-win'
import { WibeError, WibeErrorCode } from '~/shared/errors'

export interface SlotFunSpinMeta {
  mode: 'fun'
  reels: [number, number, number]
  multiplier: number
  won: boolean
  superWin: boolean
  payoutDelta: number
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
  const { playWinBurst, playSlotSpin } = useBrutalMotion()

  const bet = ref(10)
  const reels = ref<[number, number, number] | null>(null)
  const won = ref<boolean | null>(null)
  const lastMeta = ref<SlotSpinMeta>(null)
  const spinning = ref(false)
  const funBalance = ref(FUN_MODE_START_BALANCE)
  let funNonce = 0n

  const effectiveBalance = computed(() =>
    isFun.value ? funBalance.value : casinoBalance.value,
  )

  const isSuperWin = computed(() => {
    const m = lastMeta.value
    return m !== null && 'superWin' in m && m.superWin === true
  })

  const lastPayoutDelta = computed(() => {
    const m = lastMeta.value
    return m !== null && 'payoutDelta' in m ? m.payoutDelta : null
  })

  const lastMultiplier = computed(() => {
    const m = lastMeta.value
    return m !== null && 'multiplier' in m ? m.multiplier : null
  })

  function validateBet() {
    if (bet.value <= 0) throw new WibeError(WibeErrorCode.InvalidBet)
    const bal = effectiveBalance.value
    if (bal !== null && bal < bet.value) {
      throw new WibeError(WibeErrorCode.InsufficientBalance)
    }
  }

  async function spinFun(banditEl?: HTMLElement | null) {
    validateBet()
    spinning.value = true
    won.value = null
    try {
      const userSeed = randomU64()
      const blockhash = randomBlockhash32()
      const nonce = funNonce
      funNonce += 1n

      const nextReels = computeReels(blockhash, userSeed, nonce)
      const multiplier = slotPayoutMultiplier(nextReels[0], nextReels[1], nextReels[2])
      const didWin = multiplier > 0
      const superWin = isSlotSuperWin(multiplier)
      const delta = slotNetDelta(BigInt(bet.value), multiplier, FUN_MODE_HOUSE_EDGE_BPS)

      await playSlotSpin(banditEl ?? null)

      funBalance.value = Math.max(0, funBalance.value + Number(delta))
      reels.value = nextReels
      won.value = didWin
      lastMeta.value = {
        mode: 'fun',
        reels: nextReels,
        multiplier,
        won: didWin,
        superWin,
        payoutDelta: Number(delta),
        userSeed,
        nonce,
        blockhash,
        bet: bet.value,
      }

      if (didWin && banditEl) playWinBurst(banditEl)
      return lastMeta.value
    } finally {
      spinning.value = false
    }
  }

  async function spinLive(_banditEl?: HTMLElement | null) {
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

  async function spin(banditEl?: HTMLElement | null) {
    if (isFun.value) return spinFun(banditEl)
    return spinLive(banditEl)
  }

  function resetFunBalance() {
    funBalance.value = FUN_MODE_START_BALANCE
    funNonce = 0n
    reels.value = null
    won.value = null
    lastMeta.value = null
  }

  return {
    isFun,
    bet,
    reels: readonly(reels),
    won: readonly(won),
    lastMeta: readonly(lastMeta),
    spinning: readonly(spinning),
    effectiveBalance,
    funBalance: readonly(funBalance),
    isSuperWin,
    lastPayoutDelta,
    lastMultiplier,
    spin,
    resetFunBalance,
    slotSymbolChar,
  }
}
