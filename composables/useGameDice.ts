/**
 * @agent-context Dice game — fun mode (client RNG) + live mode (on-chain, when wired).
 * @see ai/specs/game-dice.md, ai/decisions/014-fun-mode.md
 */
import {
  computeRoll,
  diceNetDelta,
  diceWon,
  DICE_TARGET_MAX,
  DICE_TARGET_MIN,
} from '~/shared/rng-verify'
import { isDiceSuperWin } from '~/shared/dice-super-win'
import {
  FUN_MODE_HOUSE_EDGE_BPS,
  FUN_MODE_START_BALANCE,
  randomBlockhash32,
  randomU64,
} from '~/shared/fun-mode'
import { WibeError, WibeErrorCode } from '~/shared/errors'

export type DiceDirection = 'under' | 'over'

export interface DiceFunRollMeta {
  mode: 'fun'
  roll: number
  won: boolean
  userSeed: bigint
  nonce: bigint
  blockhash: Uint8Array
  rollUnder: boolean
  target: number
  bet: number
  winChance: number
  superWin: boolean
  payoutDelta: number
}

export interface DiceLiveRollMeta {
  mode: 'live'
  signature: string
  roll: number
  won: boolean
  userSeed: bigint
  nonce: bigint
  blockhashBase58: string
  rollUnder: boolean
  target: number
  bet: number
}

export type DiceRollMeta = DiceFunRollMeta | DiceLiveRollMeta | null

export function useGameDice() {
  const { connected } = useWallet()
  const { casinoBalance } = useCasinoProgram()
  const { mode, isFun } = useGameMode()
  const { playWinBurst, playDiceTumble } = useBrutalMotion()

  const bet = ref(10)
  const target = ref(50)
  const direction = ref<DiceDirection>('under')
  const lastRoll = ref<number | null>(null)
  const won = ref<boolean | null>(null)
  const lastMeta = ref<DiceRollMeta>(null)
  const playing = ref(false)
  const funBalance = ref(FUN_MODE_START_BALANCE)
  let funNonce = 0n

  const winChance = computed(() => {
    if (direction.value === 'under') return target.value - 1
    return 100 - target.value
  })

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

  function validateBet() {
    if (bet.value <= 0 || target.value < DICE_TARGET_MIN || target.value > DICE_TARGET_MAX) {
      throw new WibeError(WibeErrorCode.InvalidBet)
    }
    const bal = effectiveBalance.value
    if (bal !== null && bal < bet.value) {
      throw new WibeError(WibeErrorCode.InsufficientBalance)
    }
  }

  async function rollFun(diceEl?: HTMLElement | null) {
    validateBet()
    playing.value = true
    won.value = null
    try {
      const userSeed = randomU64()
      const blockhash = randomBlockhash32()
      const nonce = funNonce
      funNonce += 1n

      const roll = computeRoll(blockhash, userSeed, nonce)
      const rollUnder = direction.value === 'under'
      const chance = winChance.value
      const didWin = diceWon(roll, rollUnder, target.value)
      const delta = diceNetDelta(BigInt(bet.value), didWin, FUN_MODE_HOUSE_EDGE_BPS)
      const superWin = isDiceSuperWin(didWin, roll, chance)

      await playDiceTumble(diceEl ?? null)

      funBalance.value = Math.max(0, funBalance.value + Number(delta))
      lastRoll.value = roll
      won.value = didWin
      lastMeta.value = {
        mode: 'fun',
        roll,
        won: didWin,
        userSeed,
        nonce,
        blockhash,
        rollUnder,
        target: target.value,
        bet: bet.value,
        winChance: chance,
        superWin,
        payoutDelta: Number(delta),
      }

      if (didWin && diceEl) playWinBurst(diceEl)
      return lastMeta.value
    } finally {
      playing.value = false
    }
  }

  async function rollLive(diceEl?: HTMLElement | null) {
    if (!connected.value) throw new WibeError(WibeErrorCode.WalletNotConnected)
    validateBet()
    playing.value = true
    won.value = null
    try {
      const { playDice } = useCasinoProgram()
      const userSeed = randomU64()
      const rollUnder = direction.value === 'under'

      await playDiceTumble(diceEl ?? null)

      const res = await playDice({
        bet: bet.value,
        target: target.value,
        rollUnder,
        userSeed,
      })

      lastRoll.value = res.roll
      won.value = res.won
      lastMeta.value = {
        mode: 'live',
        signature: res.signature,
        roll: res.roll,
        won: res.won,
        userSeed: res.userSeed,
        nonce: res.nonce,
        blockhashBase58: res.blockhashBase58,
        rollUnder: res.rollUnder,
        target: res.target,
        bet: res.bet,
      }

      if (res.won && diceEl) playWinBurst(diceEl)
      return lastMeta.value
    } finally {
      playing.value = false
    }
  }

  async function roll(diceEl?: HTMLElement | null) {
    if (isFun.value) return rollFun(diceEl)
    return rollLive(diceEl)
  }

  function resetFunBalance() {
    funBalance.value = FUN_MODE_START_BALANCE
    funNonce = 0n
    lastRoll.value = null
    won.value = null
    lastMeta.value = null
  }

  return {
    mode,
    isFun,
    bet,
    target,
    direction,
    lastRoll: readonly(lastRoll),
    won: readonly(won),
    lastMeta: readonly(lastMeta),
    playing: readonly(playing),
    winChance,
    effectiveBalance,
    funBalance: readonly(funBalance),
    isSuperWin,
    lastPayoutDelta,
    roll,
    resetFunBalance,
  }
}
