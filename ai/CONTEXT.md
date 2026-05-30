# Sprint context (live)

**Last updated:** 2026-05-30 — iteration 6 committed  
**Current iteration:** 7 → LIVE wire-up + README challenge  
**Report:** [`iterations/06-slot-corrupted-reels.md`](../iterations/06-slot-corrupted-reels.md)

## Iteration 6 — done ✅

- [x] Slot FUN — `MonsterReelsHero`, `SlotReelsPanel` (3D flip, cyclops eye)
- [x] Shared game shell — stable layout dice + slot, `BrutalButton` loading
- [x] `playSlotSpin` timing-only; matrix on win; i18n EN/RU/UK

## Iteration 5 — done ✅ (ca5fae0)

- [x] Dice FUN — 3D cube, monster hero, tabs, matrix — [`05-dice-glitch-roll.md`](../iterations/05-dice-glitch-roll.md)

## Challenge README — honest status

| Requirement | Status |
|-------------|--------|
| Testnet only | ✅ config devnet |
| Verifiable on-chain | ⚠️ math + program ready; LIVE wire-up pending |
| Public URL | ❌ deploy pending |
| Casino edge | ✅ FUN 200 bps + on-chain in `lib.rs` |
| Wallet → deposit → play → withdraw | ⚠️ connect ✅; FUN play ✅ dice+slot; LIVE it.7 |
| Two playable games | ✅ FUN `/games/dice`, `/games/slot` |

## Dev / QA

```bash
pnpm dev                    # :3000
# FUN: /games/dice, /games/slot — no Phantom
pnpm test:env && pnpm test:motion && pnpm exec vitest run tests/rng-verify.test.ts && pnpm build
```

Tester: [`iterations/help.md`](../iterations/help.md)

## Next (it.7)

1. `anchor deploy` + `pnpm copy-idl`
2. `useCasinoProgram` — deposit/withdraw, `rollLive`, `spinLive`
3. Verify Explorer UI
4. Vercel public URL

Deploy: [`specs/deploy.md`](specs/deploy.md) · LIVE plan: [`iterations/04-plan-dice-game.md`](../iterations/04-plan-dice-game.md)

## Roles

| Agent | Role |
|-------|------|
| **Cursor** | Primary — it.7 LIVE on host |
| **PO** | QA, commits, Phantom devnet, Vercel |
