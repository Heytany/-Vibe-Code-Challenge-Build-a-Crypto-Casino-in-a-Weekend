# Sprint context (live)

**Last updated:** 2026-05-30 — iteration 5 (Dice FUN playable)  
**Project name:** Brutal wibe  
**Current iteration:** 5 → [`iterations/05-dice-glitch-roll.md`](../iterations/05-dice-glitch-roll.md)

## Iteration 5 — Glitch Roll (FUN, ready to commit)

- [x] First game **playable without wallet** — `/games/dice`
- [x] Monster hero + 3D `DiceCube` + roll under cube + tabs (Play / Rules)
- [x] Matrix panel backdrop on win; jackpot variant on extreme rolls
- [x] Fun mode (ADR-014) + slot FUN spin
- [x] Tests: env, motion (8), rng-verify (14), build OK
- [ ] **PO:** commit `feat: iteration 5 — …` + optional `pnpm test:e2e`
- [ ] **Next (it.6):** LIVE dice — deploy, IDL, deposit/withdraw, Explorer verify, public URL

## Cloud handoff (it.3)

Claude committed monster lobby; **could not** deploy Anchor / sign Phantom in sandbox (~75% session limit). PO back on **Cursor** ($20 included limit reached).

## Challenge README — honest status

| Requirement | Status |
|-------------|--------|
| Testnet only | ✅ config devnet |
| Verifiable on-chain | ⚠️ math + program ready; LIVE wire-up pending |
| Public URL | ❌ deploy pending |
| Casino edge | ✅ FUN 200 bps + on-chain in `lib.rs` |
| Wallet → deposit → play → withdraw | ⚠️ connect ✅; rest LIVE it.6 |

## Dev / QA

```bash
pnpm dev                    # :3000
# FUN dice: /games/dice — no Phantom
pnpm test:env && pnpm test:motion && pnpm exec vitest run tests/rng-verify.test.ts && pnpm build
```

Tester: [`iterations/help.md`](../iterations/help.md)

## Roles

| Agent | Role |
|-------|------|
| **Cursor** | Primary — dice FUN, next LIVE on host |
| **Claude (Cloud)** | it.3 lobby only — blocked on deploy |
| **PO** | QA, commits, Phantom devnet, Vercel |

Deploy: [`specs/deploy.md`](specs/deploy.md) · LIVE plan: [`iterations/04-plan-dice-game.md`](../iterations/04-plan-dice-game.md)
