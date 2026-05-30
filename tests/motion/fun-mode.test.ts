/**
 * @agent-context Fun mode uses same RNG as chain — smoke test.
 */
import { describe, expect, it } from 'vitest'
import { computeRoll, diceWon } from '../../shared/rng-verify'
import { FUN_MODE_START_BALANCE } from '../../shared/fun-mode'

describe('fun mode dice', () => {
  it('computeRoll stays in 1..100', () => {
    const blockhash = new Uint8Array(32).fill(7)
    for (let nonce = 0n; nonce < 20n; nonce++) {
      const roll = computeRoll(blockhash, 42n, nonce)
      expect(roll).toBeGreaterThanOrEqual(1)
      expect(roll).toBeLessThanOrEqual(100)
    }
  })

  it('diceWon matches under/over rules', () => {
    expect(diceWon(49, true, 50)).toBe(true)
    expect(diceWon(50, true, 50)).toBe(false)
    expect(diceWon(51, false, 50)).toBe(true)
  })

  it('fun start balance constant', () => {
    expect(FUN_MODE_START_BALANCE).toBeGreaterThan(0)
  })
})
