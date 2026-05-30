# Sprint context (live)

**Last updated:** 2026-05-30 — iteration 1 complete (pending commit)  
**Project name:** Brutal wibe  
**Current iteration:** 1 → report [`iterations/01-kostyak-i-arhitektura.md`](../iterations/01-kostyak-i-arhitektura.md)

## Dev server

```bash
pnpm install
cp .env.example .env
pnpm dev          # http://localhost:3000 — auto-opens browser
```

**Note:** `ssr: false` requires `experimental.viteEnvironmentApi: true` in `nuxt.config.ts` (Nuxt 3.21.3+ regression fix).

## Done

- [x] Nuxt 3 SPA scaffold (lobby, dice/slot routes, i18n EN/RU/UK)
- [x] Brutalist CSS tokens + base components
- [x] Reka UI wrappers (toast, alert, accordion) — ADR-009
- [x] Anchor program scaffold (all instruction signatures)
- [x] Composables stubs (wallet, casino, games, toast)
- [x] Env contract + vitest + Playwright smoke
- [x] `ai/` handoff docs

## Not done

- [ ] Deploy program to devnet
- [ ] Real PROGRAM_ID + TOKEN_MINT in `.env`
- [ ] Wire `useCasinoProgram` (deposit/withdraw/balance)
- [ ] Wire `useGameDice` / `useGameSlot`
- [ ] Slot/dice animations polish
- [ ] Live URL deployment

## Env (placeholders)

| Variable | Status |
|----------|--------|
| `NUXT_PUBLIC_CASINO_PROGRAM_ID` | placeholder |
| `NUXT_PUBLIC_CASINO_TOKEN_MINT` | placeholder |

## Blockers

None for frontend UI work. Program deploy requires local Anchor toolchain.

## Priority order

1. Deploy + env IDs  
2. Deposit/withdraw  
3. Dice  
4. Slot  
5. Human UI review
