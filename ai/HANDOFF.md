# Brutal wibe — Claude / agent handoff (read first)

**Project:** Brutal wibe — brutalist on-chain crypto casino  
**Challenge:** Vibe-Code 48h build (Solana devnet, testnet only)  
**Phase:** Iteration 2 in progress — GSAP motion + theme/locale polish before Cloud handoff

## Roles

| Who | Role |
|-----|------|
| Human (PO) | Product owner, UI tester — [`iterations/help.md`](../iterations/help.md) for Phantom QA |
| **Cursor** | **Setup** — architecture, `ai/`, env contract, motion foundation, deploy configs |
| **You (Claude / Cloud)** | **Operator** — implement features, deploy program, wire games, live URL |

Same split as Spark: setup is done; you run iterations 4+ without re-scaffolding.

## Stack (fixed — do not change without ADR)

- **Chain:** Solana devnet + Anchor 0.30 (`programs/wibe-casino`)
- **Frontend:** Nuxt 3 SPA (`ssr: false`), Vue 3, Tailwind, Pinia, `@nuxtjs/i18n`
- **UI primitives:** Reka UI → wrappers in `components/ui/primitives/`
- **Motion:** GSAP via [`useBrutalMotion()`](../composables/useBrutalMotion.ts) only — see [`specs/ui-motion.md`](specs/ui-motion.md)
- **Theme:** day/night via `stores/theme.ts` (ADR-012)
- **Wallet:** Phantom (`composables/useWallet.ts`)
- **Games:** Dice «Glitch Roll» + Slot «Corrupted Reels»

## Read order

1. This file  
2. [`AGENT_ONBOARDING.md`](AGENT_ONBOARDING.md)  
3. [`CONTEXT.md`](CONTEXT.md) — **current status**  
4. Latest [`iterations/`](../iterations/) report (RU)  
5. [`PLAN.md`](PLAN.md) + relevant [`specs/`](specs/)

## Current priorities (Cloud)

1. Deploy `wibe_casino` to devnet → set `NUXT_PUBLIC_CASINO_PROGRAM_ID`  
2. Wire `useCasinoProgram` (deposit, withdraw, fetch balance)  
3. Implement `useGameDice` + Dice UI  
4. Implement `useGameSlot` + Slot UI + `playWinBurst` / `playDepositPulse`  
5. Deploy frontend from Git → document live URL in `CONTEXT.md`  
6. Human UI review pass

## Commands

```bash
pnpm install
cp .env.example .env
pnpm dev                    # :3000
pnpm test:env               # env contract
pnpm test:motion            # motion unit tests
pnpm test:e2e               # Playwright smoke
pnpm build                  # .output/public for static host
anchor build && anchor test # when Solana/Anchor installed
pnpm copy-idl               # after anchor build
```

Deploy: [`specs/deploy.md`](specs/deploy.md)

## Rules

- Long docs → `ai/` only. Code gets `@agent-context` headers.  
- After your task → update [`CONTEXT.md`](CONTEXT.md).  
- New architecture choice → ADR in `decisions/` + [`DISCUSSION_LOG.md`](DISCUSSION_LOG.md).  
- **Iterations:** 1 iteration = 1 commit + RU report in [`iterations/`](../iterations/). See [`specs/iterations-workflow.md`](specs/iterations-workflow.md).  
- **Do not** import GSAP in pages — extend `useBrutalMotion`.
