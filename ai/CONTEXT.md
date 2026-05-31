# Sprint context (live)

**Last updated:** 2026-05-31 — iteration 9 done (Claude/Cowork), ready to commit (PO)  
**Current iteration:** 9 → fixes (toast crash, Netlify env, word-wrap, mode header, speed radio) + devnet readiness analysis  
**Report:** [`iterations/09-fixes-deploy-readiness.md`](../iterations/09-fixes-deploy-readiness.md)

## Iteration 9 — done (PO commit) ⏳

- [x] Toast crash on fast rolls fixed (hoisted `showError` in Dice/Slot)
- [x] **Netlify deploy fix:** env-validation no longer fatal when chain env empty → FUN homepage loads
- [x] `ACCESS DENIED` wraps as whole words on mobile (`DancingText` word groups)
- [x] Game title + FUN/LIVE toggle + mode explanation moved above the hero
- [x] Speed control = segmented radio (clear state); auto-bar responsive at 320px
- [x] **Devnet readiness analysis:** [`specs/testnet-readiness.md`](specs/testnet-readiness.md) — FUN 100%, LIVE ~50% (program written, not deployed/wired)
- [x] **🐛 Slot RNG fix:** reels used a trailing domain byte → never paid (0% pairs). Now per-reel nonce stride (`+reel·0x9e3779b97f4a7c15`) in `lib.rs` + `rng-verify` → ~44% pairs. **Live needs program redeploy.**
- [x] Roll/spin button no longer jumps height (loading face single-line); ∞ toggle is a clear ON/OFF checkbox
- [ ] **PO host:** `anchor build && deploy` (RNG changed!) → set `NUXT_PUBLIC_*` in Netlify for LIVE; `pnpm build`/e2e; commit

---


## Iteration 8 — done (PO commit) ⏳

- [x] iOS/mobile: overlays anchored to visual viewport, `overscroll-behavior` fixes header detach (ADR-018)
- [x] Matrix + crack centered on current screen, fullscreen on iOS (`useViewportAnchor`, `getVisualViewport`)
- [x] Provably-fair "Fair" tab in both games — recompute via `rng-verify` (ADR-015)
- [x] Auto-roll + speed ×2 + fullscreen game mode (`GameAutoFsBar`, `useAutoPlay`, `useFullscreen`) (ADR-016)
- [x] Slot split-panel win animation 2/3 bands, alternating inverted code-sweep (ADR-017)
- [ ] **PO host:** `pnpm build`, `pnpm test:e2e`, `pnpm test:motion`; verify iOS Safari on device; commit
- Prior blocker: stale `.git/index.lock` — `rm -f .git/index.lock` if it reappears.

---


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
