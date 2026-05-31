# Brutal wibe — agent handoff (read first)

**Project:** Brutal wibe — brutalist on-chain crypto casino on Solana devnet  
**Phase:** **Submission-ready (it.19 final)** — FUN + LIVE + Wheel faucet, [truebrutal.netlify.app](https://truebrutal.netlify.app)

## Roles

| Who | Role |
|-----|------|
| Human (PO) | Product owner, final QA, git commits — [`iterations/help.md`](../iterations/help.md) |
| **Cursor** | Primary implementer — it.12–15 LIVE wire, funds UX |
| Claude (Cloud) | Earlier iterations (lobby, slot, polish) |

## Mandatory: Fun mode (ADR-014)

Every game **must** work without wallet:

- Default mode: **`fun`** — virtual balance (`useFunBalance`), client RNG (`shared/rng-verify.ts`)
- Toggle: `GameModeToggle` + `useGameMode()` (shared module state)
- **Live** only when user selects LIVE + Phantom connected + real `NUXT_PUBLIC_*`

Test: `/games/dice`, `/games/slot` with no wallet → roll/spin works; `GameFundsBar` shows fun + Refill.

## LIVE flow (it.15)

1. Connect Phantom (devnet)  
2. Toggle **LIVE** on game page  
3. `GameFundsBar` → Deposit WIBE → casino balance updates  
4. Bet in Play tab → Roll/Spin on-chain  
5. Withdraw → Phantom  
6. Fair tab → verify + Explorer link  

Program: `BfdTrxqFfFhe4xA3XniqVWzVkQKX88za5yuA4FRq3ktw` · Mint: `He66seATY4XobvcwC8WZceMH3uncAqEx44T8HtLyttox`

## Read order

1. This file  
2. [`CONTEXT.md`](CONTEXT.md)  
3. Latest [`iterations/`](../iterations/) — [`19-final-marathon.md`](../iterations/19-final-marathon.md)

## Key files

| Area | Path |
|------|------|
| Chain client | `composables/useCasinoProgram.ts` |
| Funds UI | `components/layout/GameFundsBar.vue` |
| Fun credits | `composables/useFunBalance.ts` |
| Game mode | `composables/useGameMode.ts` |
| Dice / Slot | `composables/useGameDice.ts`, `useGameSlot.ts` |
| Provably fair | `components/games/ProvablyFair.vue`, `shared/rng-verify.ts` |
| Wheel faucet | `composables/useWheel.ts`, `components/games/WheelGame.vue` |
| LIVE mutex | `shared/live-play-mutex.ts` |

## Commands

```bash
pnpm dev
pnpm test:env && pnpm test:idl
pnpm exec vitest run tests/rng-verify.test.ts tests/live-play-mutex.test.ts
pnpm test:motion
pnpm build
pnpm exec playwright test
```

## Rules

- **Fun mode never blocks on wallet** for default path  
- 1 iteration = 1 commit + RU report in [`iterations/`](../iterations/) — **PO commits**  
- Update [`CONTEXT.md`](CONTEXT.md) after your task  
- Do not edit committed plan files in `.cursor/plans/`
