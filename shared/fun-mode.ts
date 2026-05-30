/**
 * @agent-context Fun mode — client-only play without wallet or casino balance.
 * Uses the same RNG as on-chain (shared/rng-verify.ts) with simulated blockhash.
 * @see ai/decisions/014-fun-mode.md
 */

export type GameMode = 'fun' | 'live'

/** Default house edge for fun-mode payout math (matches typical initialize: 200 bps). */
export const FUN_MODE_HOUSE_EDGE_BPS = 200

/** Starting virtual credits in fun mode (not real tokens). */
export const FUN_MODE_START_BALANCE = 1000

export function randomU64(): bigint {
  const buf = new BigUint64Array(1)
  crypto.getRandomValues(buf)
  return buf[0]!
}

export function randomBlockhash32(): Uint8Array {
  const buf = new Uint8Array(32)
  crypto.getRandomValues(buf)
  return buf
}

export function canUseLiveMode(connected: boolean, programConfigured: boolean): boolean {
  return connected && programConfigured
}
