# ADR-014: Fun mode (mandatory)

**Status:** accepted  
**Date:** 2026-05-30

## Context

PO requires every game to be playable **without wallet connect or real tokens** — “просто запустить и поиграть”. Live devnet mode remains for verifiable on-chain play.

## Decision

- Two modes: **`fun`** (default) and **`live`**.
- **Fun mode:** client-side RNG via `shared/rng-verify.ts` (same FNV-1a math as `lib.rs`), simulated blockhash, virtual balance (`FUN_MODE_START_BALANCE = 1000`). No Phantom, no deposit.
- **Live mode:** requires connected Phantom + deployed program + casino balance; on-chain instructions.
- UI: `GameModeToggle` on every game page; banner `games.common.funBanner` in fun mode.
- Composables: `useGameMode()`, `useGameDice()` / `useGameSlot()` branch on `isFun`.

## Consequences

- Games must never block play on wallet for the default path.
- Live toggle disabled until `canLive` (wallet + `NUXT_PUBLIC_CASINO_PROGRAM_ID`).
- Fun payouts use `FUN_MODE_HOUSE_EDGE_BPS` (200) — not authoritative; live uses on-chain config.
- Verify-on-Explorer UI only in live mode (iteration 4 wire-up).
