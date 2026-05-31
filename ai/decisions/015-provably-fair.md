# ADR-015: Provably-fair verification module

**Status:** accepted
**Date:** 2026-05-31

## Context

README requires casino logic be **verifiable on-chain** — "a paranoid player using a block
explorer should be able to confirm it's not a scam."

## Decision

- `components/games/ProvablyFair.vue` — a "Fair" tab on both Dice and Slot.
- Shows the play's public inputs (blockhash, seed, nonce, domain) + result, and recomputes the
  outcome locally via `shared/rng-verify.ts` (same FNV-1a as `lib.rs`). Green MATCH / red MISMATCH.
- Fun mode: simulated blockhash, identical math, note to switch to LIVE for a real tx.
- Live mode: "Open in Solana Explorer" link (`/tx/<sig>?cluster=devnet`) so the player can read
  the inputs from chain and recompute themselves.

## Consequences

- Verification is client-side and transparent (no trust in our server).
- Live tx wiring (signature + on-chain blockhash) lands with the on-chain game wire-up.
