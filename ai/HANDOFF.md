# Brutal wibe — Claude / agent handoff (read first)

**Project:** Brutal wibe — brutalist on-chain crypto casino  
**Challenge:** Vibe-Code 48h build (Solana devnet, testnet only)  
**Phase:** GSAP motion base done — handoff Claude for on-chain + game logic

## Roles

| Who | Role |
|-----|------|
| Human | Product owner, UI/UX tester, Nuxt consultant |
| Cursor | Architect, `ai/` docs, env contract |
| You (Claude) | Implement features per `ai/specs/` and update `ai/CONTEXT.md` |

## Stack (fixed — do not change without ADR)

- **Chain:** Solana devnet + Anchor 0.30 (`programs/wibe-casino`)
- **Frontend:** Nuxt 3 SPA (`ssr: false`), Vue 3, Tailwind, Pinia, `@nuxtjs/i18n`
- **UI primitives:** Reka UI → wrappers in `components/ui/primitives/` — see [`specs/ui-primitives.md`](specs/ui-primitives.md)
- **Wallet:** Phantom (`composables/useWallet.ts`)
- **Games:** Dice «Glitch Roll» + Slot «Corrupted Reels»

## Read order

1. This file  
2. [`AGENT_ONBOARDING.md`](AGENT_ONBOARDING.md)  
3. [`CONTEXT.md`](CONTEXT.md) — **current status**  
4. [`PLAN.md`](PLAN.md) — full architecture  
5. Relevant [`specs/`](specs/) + [`decisions/`](decisions/)

## Current priorities

1. Deploy `wibe_casino` to devnet → set `NUXT_PUBLIC_CASINO_PROGRAM_ID` in `.env`  
2. Wire `useCasinoProgram` (deposit, withdraw, fetch balance)  
3. Implement `useGameDice` + Dice UI  
4. Implement `useGameSlot` + Slot UI + animations  
5. Human UI review pass

## Commands

```bash
pnpm install
cp .env.example .env
pnpm dev                    # :3000
pnpm test:env               # env contract
pnpm test:e2e               # Playwright smoke
anchor build && anchor test # when Solana/Anchor installed
pnpm copy-idl               # after anchor build
```

## Rules

- Long docs → `ai/` only. Code gets `@agent-context` file headers.  
- After your task → update [`CONTEXT.md`](CONTEXT.md).  
- New architecture choice → new ADR in `decisions/` + append [`DISCUSSION_LOG.md`](DISCUSSION_LOG.md).
- **Iterations (mandatory):** 1 iteration = 1 commit + RU report in [`iterations/`](../iterations/). See [`specs/iterations-workflow.md`](specs/iterations-workflow.md). Read latest report before coding.
