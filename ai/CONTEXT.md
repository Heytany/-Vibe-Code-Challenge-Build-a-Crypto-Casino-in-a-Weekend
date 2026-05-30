# Sprint context (live)

**Last updated:** 2026-05-30 — iteration 7 ready to commit (PO)  
**Current iteration:** 8 → LIVE wire-up + README challenge  
**Report:** [`iterations/07-access-denied-ux.md`](../iterations/07-access-denied-ux.md)

## Iteration 7 — ready (PO commit) ⏳

- [x] `error.vue` + `AccessDeniedScreen` — matrix loop, dancing «Access denied» (EN/RU/UK)
- [x] Catch-all 404, env fatal → same screen
- [x] i18n toasts (`errors.codes.*`), `showWin`, offline banner, LIVE `BrutalAlert`
- [x] `useBetField`, `BrutalSkeleton` on balance, `NuxtLoadingIndicator`
- [ ] **PO:** commit it.7 + hash в `iterations/README.md`

## Iteration 6 — done ✅

- [x] Slot FUN hero + stable layout — [`06-slot-corrupted-reels.md`](../iterations/06-slot-corrupted-reels.md)

## Iteration 5 — done ✅ (`ca5fae0`)

- [x] Dice FUN — [`05-dice-glitch-roll.md`](../iterations/05-dice-glitch-roll.md)

## Challenge README — honest status

| Requirement | Status |
|-------------|--------|
| Testnet only | ✅ config devnet |
| Verifiable on-chain | ⚠️ math + program ready; LIVE wire-up pending |
| Public URL | ❌ deploy pending |
| Casino edge | ✅ FUN 200 bps + on-chain in `lib.rs` |
| Wallet → deposit → play → withdraw | ⚠️ connect ✅; FUN play ✅; LIVE it.8 |
| Two playable games | ✅ FUN `/games/dice`, `/games/slot` |
| Error UX | ✅ access denied + i18n toasts (it.7) |

## Dev / QA

```bash
pnpm dev                    # :3000
# FUN: /games/dice, /games/slot — no Phantom
# 404 smoke: /games/nope
pnpm test:env && pnpm test:motion && pnpm exec vitest run tests/rng-verify.test.ts && pnpm build
```

Tester: [`iterations/help.md`](../iterations/help.md)

## Next (it.8)

1. `anchor deploy` + `pnpm copy-idl`
2. `useCasinoProgram` — deposit/withdraw, `rollLive`, `spinLive`
3. Verify Explorer UI
4. Vercel public URL

Deploy: [`specs/deploy.md`](specs/deploy.md) · LIVE plan: [`iterations/04-plan-dice-game.md`](../iterations/04-plan-dice-game.md)

## Roles

| Agent | Role |
|-------|------|
| **Cursor** | Primary — it.8 LIVE on host |
| **PO** | QA, commits, Phantom devnet, Vercel |
