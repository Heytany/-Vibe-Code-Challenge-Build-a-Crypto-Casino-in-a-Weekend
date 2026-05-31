/**
 * @agent-context Locks the off-chain RNG mirror to known vectors so it stays in sync with
 * programs/wibe-casino/src/lib.rs. Vectors were generated from the same FNV-1a transcription;
 * PO should additionally cross-check one vector against `anchor test` after deploy.
 * @run pnpm test:motion (vitest) — or: pnpm exec vitest run tests/rng-verify.test.ts
 */
import { describe, expect, it } from 'vitest'
import {
  base58Decode,
  computeReels,
  computeRoll,
  diceNetDelta,
  diceWon,
  hashFromInputs,
  DOMAIN_DICE,
  slotNetDelta,
  slotPayoutMultiplier,
  verifyDice,
  verifySlot,
} from '../shared/rng-verify'

// deterministic test blockhash: byte i = (i*7+3) mod 256
const BLOCKHASH = new Uint8Array(32)
for (let i = 0; i < 32; i++) BLOCKHASH[i] = (i * 7 + 3) & 0xff
const BLOCKHASH_B58 = 'Cs8KY3PiWrCMAytMsBRQo8EdGbticVtdvufLnb2UhXh'

describe('rng-verify — fixed vectors', () => {
  it('dice roll vectors', () => {
    expect(computeRoll(BLOCKHASH, 42n, 0n)).toBe(17)
    expect(computeRoll(BLOCKHASH, 123456789n, 5n)).toBe(28)
  })

  it('raw hash vector (dice domain)', () => {
    expect(hashFromInputs(BLOCKHASH, 42n, 0n, DOMAIN_DICE)).toBe(0x3760d68fa571fa3cn)
  })

  it('slot reel vectors (per-reel nonce stride)', () => {
    expect(computeReels(BLOCKHASH, 42n, 0n)).toEqual([3, 4, 0])
    expect(computeReels(BLOCKHASH, 777n, 9n)).toEqual([4, 3, 5])
  })
})

describe('rng-verify — invariants', () => {
  it('roll always in 1..100, symbols in 0..5', () => {
    for (let s = 0; s < 500; s++) {
      const roll = computeRoll(BLOCKHASH, BigInt(s), BigInt(s))
      expect(roll).toBeGreaterThanOrEqual(1)
      expect(roll).toBeLessThanOrEqual(100)
      for (const sym of computeReels(BLOCKHASH, BigInt(s), BigInt(s))) {
        expect(sym).toBeGreaterThanOrEqual(0)
        expect(sym).toBeLessThanOrEqual(5)
      }
    }
  })

  it('is deterministic and domain/nonce separated', () => {
    expect(computeRoll(BLOCKHASH, 42n, 7n)).toBe(computeRoll(BLOCKHASH, 42n, 7n))
    expect(computeRoll(BLOCKHASH, 1n, 0n)).not.toBe(computeRoll(BLOCKHASH, 1n, 1n))
  })
})

describe('rng-verify — payouts', () => {
  it('dice loss subtracts the bet', () => {
    expect(diceNetDelta(100n, false, 200)).toBe(-100n)
  })

  it('dice win pays 1.95x minus house edge (2%)', () => {
    // gross = 100*19500/10000 = 195; edge = 195*200/10000 = 3; payout = 192; net = 92
    expect(diceNetDelta(100n, true, 200)).toBe(92n)
  })

  it('slot multipliers', () => {
    expect(slotPayoutMultiplier(3, 3, 3)).toBe(10)
    expect(slotPayoutMultiplier(3, 3, 1)).toBe(2)
    expect(slotPayoutMultiplier(0, 1, 2)).toBe(0)
  })

  it('slot triple win net delta', () => {
    // gross = 100*10 = 1000; edge = 1000*200/10000 = 20; payout = 980; net = 880
    expect(slotNetDelta(100n, 10, 200)).toBe(880n)
  })

  it('diceWon under/over', () => {
    expect(diceWon(17, true, 50)).toBe(true)
    expect(diceWon(17, false, 50)).toBe(false)
  })
})

describe('rng-verify — verification entry points', () => {
  it('verifyDice matches honest report', () => {
    const roll = computeRoll(BLOCKHASH, 42n, 0n) // 17
    const res = verifyDice({
      blockhash: BLOCKHASH,
      userSeed: 42n,
      nonce: 0n,
      rollUnder: true,
      target: 50,
      reportedRoll: roll,
      reportedWon: true,
    })
    expect(res.ok).toBe(true)
    expect(res.expectedRoll).toBe(17)
  })

  it('verifyDice rejects a tampered roll', () => {
    const res = verifyDice({
      blockhash: BLOCKHASH,
      userSeed: 42n,
      nonce: 0n,
      rollUnder: true,
      target: 50,
      reportedRoll: 99,
      reportedWon: false,
    })
    expect(res.ok).toBe(false)
  })

  it('verifySlot matches honest report', () => {
    const expected = computeReels(BLOCKHASH, 42n, 0n)
    const res = verifySlot({
      blockhash: BLOCKHASH,
      userSeed: 42n,
      nonce: 0n,
      reportedReels: expected,
    })
    expect(res.ok).toBe(true)
  })
})

describe('rng-verify — base58', () => {
  it('decodes a blockhash string to the original 32 bytes', () => {
    const decoded = base58Decode(BLOCKHASH_B58)
    expect(decoded.length).toBe(32)
    expect(Array.from(decoded)).toEqual(Array.from(BLOCKHASH))
  })
})
