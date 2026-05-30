# Brutal wibe — system architecture (summary)

Full plan: [`PLAN.md`](PLAN.md)

## Stack

| Layer | Tech |
|-------|------|
| Chain | Solana devnet, Anchor 0.30 |
| Program | `programs/wibe-casino` |
| Frontend | Nuxt 3 SPA, Tailwind, Pinia, i18n |
| UI primitives | Reka UI → `components/ui/primitives/*` |
| Wallet | Phantom via `useWallet` |

## Repo map

```
programs/wibe-casino/   Anchor program
composables/            Wallet, casino, games, toast
components/             Vue UI (ui/, games/, wallet/, layout/)
shared/                 errors.ts, env-contract.ts
ai/                     Agent docs (you are here)
tests/                  vitest env + Playwright e2e
```

## User flow

Connect Phantom → deposit SPL → play dice/slot → withdraw. All bets on-chain.

## PDAs

- `CasinoConfig`, `CasinoVault`, `UserBalance` per player
