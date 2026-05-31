# Sprint context (live)

**Last updated:** 2026-05-30 — iteration 11 ready, **PO commit**  
**Current iteration:** 11  
**Report:** [`iterations/11-mobile-toasts-devnet-phase-a.md`](../iterations/11-mobile-toasts-devnet-phase-a.md)

## Iteration 11 — ready (PO commit) ⏳

- [x] Toast viewport mobile fix
- [x] Mobile QA (tabs, overflow-x, header wallet)
- [x] Wallet UX: crack full-screen scrim, disconnect confirm, BrutalAlert Teleport + viewport anchor
- [x] Phantom Phase A — PO verified connect/disconnect cycles
- [x] [`iterations/help.md`](../iterations/help.md) updated
- [x] CI: pnpm version only from `packageManager` in package.json
- [ ] **PO:** commit it.11 + hash in README (agent does NOT commit)

---

## Iteration 10 — done (PO commit) ⏳

- [x] Slot split win animation, Reka UI (Dropdown/Slider/RadioGroup), mobile header 2-row, copy fixes
- [x] Slot RNG fix in `lib.rs` (needs redeploy for LIVE)
- [ ] **PO:** commit if not yet

## Iteration 9 — done (PO commit) ⏳

- [x] Toast crash fix, Netlify env non-fatal when empty, devnet readiness analysis
- [x] [`specs/testnet-readiness.md`](specs/testnet-readiness.md) — FUN 100%, LIVE ~50%

---

## Challenge README — honest status

| Requirement | Status |
|-------------|--------|
| Testnet only | ✅ config devnet |
| Verifiable on-chain | ⚠️ math + program ready; LIVE wire-up pending |
| Public URL | ⚠️ Netlify-ready; PO deploy |
| Casino edge | ✅ FUN 200 bps + on-chain in `lib.rs` |
| Wallet → deposit → play → withdraw | ⚠️ connect ✅; FUN play ✅; LIVE pending |
| Two playable games | ✅ FUN `/games/dice`, `/games/slot` |
| Error UX | ✅ access denied + i18n toasts |
| Mobile UX | ✅ it.11 toast viewport + wallet modals |

## Dev / QA

```bash
pnpm dev                    # :3000
# FUN: /games/dice, /games/slot — no Phantom, no env
# 404 smoke: /games/nope
NUXT_IGNORE_LOCK=1 pnpm build
pnpm test:env && pnpm test:motion && pnpm exec vitest run tests/rng-verify.test.ts
```

Tester: [`iterations/help.md`](../iterations/help.md) — **Phase A Phantom connect**

## After it.11 commit (LIVE devnet — next iteration TBD)

1. `anchor deploy` + SPL mint + `initialize` + **redeploy** (slot RNG fix)
2. `pnpm copy-idl` → wire `useCasinoProgram`
3. Netlify env: 4× `NUXT_PUBLIC_*`
4. LIVE QA: deposit → play → verify → withdraw

Deploy: [`specs/deploy.md`](specs/deploy.md) · LIVE plan: [`iterations/04-plan-dice-game.md`](../iterations/04-plan-dice-game.md) · readiness: [`specs/testnet-readiness.md`](specs/testnet-readiness.md)

## Roles

| Agent | Role |
|-------|------|
| **Cursor** | wire LIVE after PO deploy |
| **PO** | QA, commits, Phantom devnet, Netlify, anchor deploy |
