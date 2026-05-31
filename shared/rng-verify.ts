/**
 * @agent-context Off-chain mirror of the on-chain verifiable RNG. Lets the UI recompute
 * a dice roll / slot reels from public inputs so a paranoid player can confirm the casino
 * is not cheating — must stay byte-for-byte in sync with programs/wibe-casino/src/lib.rs
 * (`hash_from_inputs`, `compute_roll`, `compute_symbol`, payout helpers).
 * @see ai/specs/rng.md, ai/specs/game-dice.md, ai/specs/game-slot.md
 * @invariant fnv1a over [blockhash(32) || userSeed(u64 LE) || nonce(u64 LE) || domain]
 */

// ── Game constants (mirror lib.rs) ──────────────────────────────────────────
export const DICE_TARGET_MIN = 2
export const DICE_TARGET_MAX = 98
/** Dice gross multiplier in basis points before house edge (lib.rs: 19500 = 1.95×). */
export const DICE_MULTIPLIER_BPS = 19500
export const SLOT_SYMBOL_COUNT = 6
export const SLOT_TRIPLE_MULTIPLIER = 10
export const SLOT_PAIR_MULTIPLIER = 2
/** Max house edge accepted on-chain at initialize() (require house_edge_bps <= 1000). */
export const MAX_HOUSE_EDGE_BPS = 1000

export const DOMAIN_DICE = new TextEncoder().encode('dice')
export const DOMAIN_SLOT = new TextEncoder().encode('slot')
/**
 * Per-reel nonce stride (64-bit golden ratio). Each reel hashes with `nonce + reel*STRIDE`
 * instead of a trailing domain byte — a trailing byte under FNV-1a is too weakly mixed and made
 * the three reels mod 6 ALWAYS distinct (slot could never pay). Must match lib.rs.
 */
export const SLOT_REEL_STRIDE = 0x9e3779b97f4a7c15n

// ── FNV-1a 64-bit (matches Rust wrapping_mul) ───────────────────────────────
const FNV_OFFSET_BASIS = 0xcbf29ce484222325n
const FNV_PRIME = 0x100000001b3n
const U64_MASK = 0xffffffffffffffffn

function fnv1a64(bytes: Uint8Array): bigint {
  let hash = FNV_OFFSET_BASIS
  for (let i = 0; i < bytes.length; i++) {
    hash ^= BigInt(bytes[i])
    hash = (hash * FNV_PRIME) & U64_MASK
  }
  return hash
}

function u64ToLeBytes(value: bigint): Uint8Array {
  const out = new Uint8Array(8)
  let v = value & U64_MASK
  for (let i = 0; i < 8; i++) {
    out[i] = Number(v & 0xffn)
    v >>= 8n
  }
  return out
}

/**
 * Recompute the raw 64-bit hash from the same public inputs the program uses.
 * @param blockhash first 32 bytes of the recent blockhash (sysvar / tx context)
 */
export function hashFromInputs(
  blockhash: Uint8Array,
  userSeed: bigint,
  nonce: bigint,
  domain: Uint8Array,
): bigint {
  if (blockhash.length < 32) {
    throw new Error('blockhash must be at least 32 bytes')
  }
  const buf = new Uint8Array(48 + domain.length)
  buf.set(blockhash.subarray(0, 32), 0)
  buf.set(u64ToLeBytes(userSeed), 32)
  buf.set(u64ToLeBytes(nonce), 40)
  buf.set(domain, 48)
  return fnv1a64(buf)
}

/** Dice roll 1..100 (lib.rs compute_roll). */
export function computeRoll(blockhash: Uint8Array, userSeed: bigint, nonce: bigint): number {
  const hash = hashFromInputs(blockhash, userSeed, nonce, DOMAIN_DICE)
  return Number(hash % 100n) + 1
}

/** Slot symbol 0..5 for a given reel index (lib.rs compute_symbol). */
export function computeSymbol(
  blockhash: Uint8Array,
  userSeed: bigint,
  nonce: bigint,
  reel: number,
): number {
  const reelNonce = (nonce + BigInt(reel) * SLOT_REEL_STRIDE) & U64_MASK
  const hash = hashFromInputs(blockhash, userSeed, reelNonce, DOMAIN_SLOT)
  return Number(hash % BigInt(SLOT_SYMBOL_COUNT))
}

export function computeReels(
  blockhash: Uint8Array,
  userSeed: bigint,
  nonce: bigint,
): [number, number, number] {
  return [
    computeSymbol(blockhash, userSeed, nonce, 0),
    computeSymbol(blockhash, userSeed, nonce, 1),
    computeSymbol(blockhash, userSeed, nonce, 2),
  ]
}

// ── Outcome + payout helpers (mirror lib.rs) ────────────────────────────────
export function diceWon(roll: number, rollUnder: boolean, target: number): boolean {
  return rollUnder ? roll < target : roll > target
}

export function slotPayoutMultiplier(r1: number, r2: number, r3: number): number {
  if (r1 === r2 && r2 === r3) return SLOT_TRIPLE_MULTIPLIER
  if (r1 === r2 || r2 === r3 || r1 === r3) return SLOT_PAIR_MULTIPLIER
  return 0
}

/** Net balance delta for a dice play (negative = loss). Uses integer math like Rust. */
export function diceNetDelta(bet: bigint, won: boolean, houseEdgeBps: number): bigint {
  if (!won) return -bet
  const gross = (bet * BigInt(DICE_MULTIPLIER_BPS)) / 10_000n
  const edge = (gross * BigInt(houseEdgeBps)) / 10_000n
  const payout = gross - edge
  return payout - bet
}

/** Net balance delta for a slot play (negative = loss). */
export function slotNetDelta(bet: bigint, multiplier: number, houseEdgeBps: number): bigint {
  if (multiplier <= 0) return -bet
  const gross = bet * BigInt(multiplier)
  const edge = (gross * BigInt(houseEdgeBps)) / 10_000n
  const payout = gross - edge
  return payout - bet
}

// ── Verification entry points for the "verify roll" UI ──────────────────────
export interface DiceVerifyInput {
  blockhash: Uint8Array
  userSeed: bigint
  nonce: bigint
  rollUnder: boolean
  target: number
  /** value emitted on-chain in DicePlayed */
  reportedRoll: number
  reportedWon: boolean
}

export function verifyDice(input: DiceVerifyInput): {
  ok: boolean
  expectedRoll: number
  expectedWon: boolean
} {
  const expectedRoll = computeRoll(input.blockhash, input.userSeed, input.nonce)
  const expectedWon = diceWon(expectedRoll, input.rollUnder, input.target)
  return {
    ok: expectedRoll === input.reportedRoll && expectedWon === input.reportedWon,
    expectedRoll,
    expectedWon,
  }
}

export interface SlotVerifyInput {
  blockhash: Uint8Array
  userSeed: bigint
  nonce: bigint
  /** values emitted on-chain in SlotPlayed */
  reportedReels: [number, number, number]
}

export function verifySlot(input: SlotVerifyInput): {
  ok: boolean
  expectedReels: [number, number, number]
} {
  const expectedReels = computeReels(input.blockhash, input.userSeed, input.nonce)
  const ok =
    expectedReels[0] === input.reportedReels[0] &&
    expectedReels[1] === input.reportedReels[1] &&
    expectedReels[2] === input.reportedReels[2]
  return { ok, expectedReels }
}

// ── Base58 decode (self-contained; blockhash from explorer is base58) ───────
const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

/** Encode bytes to base58 (e.g. for blockhash display). */
export function base58Encode(input: Uint8Array): string {
  if (input.length === 0) return ''
  let zeros = 0
  while (zeros < input.length && input[zeros] === 0) zeros++

  const digits: number[] = [0]
  for (let i = zeros; i < input.length; i++) {
    let carry = input[i]
    for (let j = 0; j < digits.length; j++) {
      carry += digits[j] << 8
      digits[j] = carry % 58
      carry = (carry / 58) | 0
    }
    while (carry > 0) {
      digits.push(carry % 58)
      carry = (carry / 58) | 0
    }
  }

  let out = '1'.repeat(zeros)
  for (let i = digits.length - 1; i >= 0; i--) {
    out += BASE58_ALPHABET[digits[i]]
  }
  return out
}

/** Decode a base58 string (e.g. a Solana blockhash) to bytes. */
export function base58Decode(input: string): Uint8Array {
  if (input.length === 0) return new Uint8Array(0)
  const bytes: number[] = [0]
  for (const ch of input) {
    const value = BASE58_ALPHABET.indexOf(ch)
    if (value === -1) throw new Error(`invalid base58 char: ${ch}`)
    let carry = value
    for (let j = 0; j < bytes.length; j++) {
      carry += bytes[j] * 58
      bytes[j] = carry & 0xff
      carry >>= 8
    }
    while (carry > 0) {
      bytes.push(carry & 0xff)
      carry >>= 8
    }
  }
  // leading zeros
  for (let k = 0; k < input.length && input[k] === '1'; k++) bytes.push(0)
  return new Uint8Array(bytes.reverse())
}
