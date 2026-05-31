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

export interface SlotLiveSpinMeta {
  mode: 'live'
  signature: string
  reels: [number, number, number]
  multiplier: number
  won: boolean
  userSeed: bigint
  nonce: bigint
  blockhashBase58: string
  blockhash: Uint8Array
  bet: number
  payoutDelta: number
}

export type SlotSpinMeta = SlotFunSpinMeta | SlotLiveSpinMeta | null

const SYMBOLS = ['7', 'X', '#', '?', '!', '0']

export function slotSymbolChar(index: number): string {
  return SYMBOLS[index] ?? '?'
}

export function useGameSlot() {
  const { connected } = useWallet()
  const { casinoBalance, loading: balanceLoading } = useCasinoProgram()
  const { isFun } = useGameMode()
  const { balance: funBalance, nextNonce, applyDelta } = useFunBalance()
  const { playWinBurst, playSlotSpin } = useBrutalMotion()

  const bet = ref(10)
  const reels = ref<[number, number, number] | null>(null)
  const won = ref<boolean | null>(null)
  const lastMeta = ref<SlotSpinMeta>(null)
  const spinning = ref(false)

  const effectiveBalance = computed(() =>
    isFun.value ? funBalance.value : (casinoBalance.value ?? 0),
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
    if (!isFun.value && balanceLoading.value) {
      throw new WibeError(WibeErrorCode.TransactionFailed, 'Balance still loading')
    }
    if (effectiveBalance.value < bet.value) {
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
      const nonce = nextNonce()

      const nextReels = computeReels(blockhash, userSeed, nonce)
      const multiplier = slotPayoutMultiplier(nextReels[0], nextReels[1], nextReels[2])
      const didWin = multiplier > 0
      const superWin = isSlotSuperWin(multiplier)
      const delta = slotNetDelta(BigInt(bet.value), multiplier, FUN_MODE_HOUSE_EDGE_BPS)

      await playSlotSpin(banditEl ?? null)

      applyDelta(Number(delta))
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

  async function spinLive(banditEl?: HTMLElement | null) {
    if (!connected.value) throw new WibeError(WibeErrorCode.WalletNotConnected)
    validateBet()
    spinning.value = true
    won.value = null
    try {
      const { playSlot } = useCasinoProgram()
      const userSeed = randomU64()

      const res = await playSlot({ bet: bet.value, userSeed })

      await playSlotSpin(banditEl ?? null)

      reels.value = res.reels
      won.value = res.won
      const payoutDelta = Number(
        slotNetDelta(BigInt(res.bet), res.multiplier, FUN_MODE_HOUSE_EDGE_BPS),
      )
      lastMeta.value = {
        mode: 'live',
        signature: res.signature,
        reels: res.reels,
        multiplier: res.multiplier,
        won: res.won,
        userSeed: res.userSeed,
        nonce: res.nonce,
        blockhash: res.blockhash,
        blockhashBase58: res.blockhashBase58,
        bet: res.bet,
        payoutDelta,
      }

      if (res.won && banditEl) playWinBurst(banditEl)
      return lastMeta.value
    } finally {
      spinning.value = false
    }
  }

  async function spin(banditEl?: HTMLElement | null) {
    if (isFun.value) return spinFun(banditEl)
    return spinLive(banditEl)
  }

  return {
    isFun,
    bet,
    reels: readonly(reels),
    won: readonly(won),
    lastMeta: readonly(lastMeta),
    spinning: readonly(spinning),
    effectiveBalance,
    isSuperWin,
    lastPayoutDelta,
    lastMultiplier,
    spin,
    slotSymbolChar,
  }
}
