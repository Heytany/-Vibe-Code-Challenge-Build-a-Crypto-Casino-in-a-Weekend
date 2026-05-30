# Brutal wibe — agent handoff (read first)

**Project:** Brutal wibe — brutalist on-chain crypto casino  
**Phase:** Iteration 4 — **fun mode done**; live Dice wire-up next (host with Anchor + Phantom)

## Roles

| Who | Role |
|-----|------|
| Human (PO) | Product owner, UI tester — [`iterations/help.md`](../iterations/help.md) |
| **Cursor** | **Primary now** — fun mode, live wire-up on macOS host |
| Claude (Cloud) | Operator when available — it.3 lobby; blocked on deploy/sign in sandbox |

## Mandatory: Fun mode (ADR-014)

Every game **must** work without wallet:

- Default mode: **`fun`** — virtual balance, client RNG (`shared/rng-verify.ts`)
- Toggle: `GameModeToggle` + `useGameMode()`
- **Live** only when Phantom connected + `NUXT_PUBLIC_CASINO_PROGRAM_ID` set

Test: `/games/dice`, `/games/slot` with no wallet → roll/spin works.

## Read order

1. This file  
2. [`CONTEXT.md`](CONTEXT.md)  
3. Latest [`iterations/`](../iterations/) — [`04-fun-mode.md`](../iterations/04-fun-mode.md)  
4. Live Dice plan: [`iterations/04-plan-dice-game.md`](../iterations/04-plan-dice-game.md)

## Current priorities (host)

1. `anchor build/deploy` → `NUXT_PUBLIC_CASINO_PROGRAM_ID` + `pnpm copy-idl`  
2. Wire `useCasinoProgram` (deposit, withdraw, playDice)  
3. `useGameDice.rollLive()` + verify UI in `DiceGame.vue`  
4. Copy pattern to Slot live  
5. PO commit + deploy frontend URL

## Stack (fixed)

- Solana devnet + Anchor 0.30 (`programs/wibe-casino`)
- Nuxt 3 SPA, GSAP via `useBrutalMotion` only
- Phantom via `useWallet.ts` (needs `signTransaction` for live)

## Commands

```bash
pnpm dev
pnpm test:motion    # includes fun-mode tests
pnpm build
anchor build && pnpm copy-idl
```

## Rules

- **Fun mode never blocks on wallet** for default path  
- 1 iteration = 1 commit + RU report in [`iterations/`](../iterations/)  
- Update [`CONTEXT.md`](CONTEXT.md) after your task
