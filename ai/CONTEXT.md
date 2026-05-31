# Sprint context (live)

**Last updated:** 2026-05-30 — iteration 16 done  
**Current iteration:** 16  
**Report:** [`iterations/16-live-play-idl-fix.md`](../iterations/16-live-play-idl-fix.md)

## Iteration 16 — done ✅

- [x] Fix IDL discriminators `play_dice` / `play_slot` (101 InstructionFallbackNotFound)
- [x] LIVE flow: on-chain tx before animation (Dice + Slot)
- [x] Removed confusing Max withdraw button
- [x] `pnpm test:idl` guard + build OK

## Iteration 15 — done ✅

- [x] Deposit/refresh fix: immediate watch, raw UserBalance read, post-tx confirm + retry
- [x] `GameFundsBar` — FUN (refill) / LIVE (WIBE + deposit/withdraw); games always, lobby LIVE+connected
- [x] Game panel — `GameBetInput` bet only; shared `useFunBalance`
- [x] Single module-level balance/mode watches (no duplicate refresh)
- [x] Removed orphan `BalanceDisplay.vue`
- [x] Tests: env + motion + rng 14/14, build OK
- [x] **Live URL:** [truebrutal.netlify.app](https://truebrutal.netlify.app)

### Devnet env (local + Netlify)

```
NUXT_PUBLIC_SOLANA_NETWORK=devnet
NUXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NUXT_PUBLIC_CASINO_PROGRAM_ID=BfdTrxqFfFhe4xA3XniqVWzVkQKX88za5yuA4FRq3ktw
NUXT_PUBLIC_CASINO_TOKEN_MINT=He66seATY4XobvcwC8WZceMH3uncAqEx44T8HtLyttox
```

---

## Challenge README — status (submission-ready)

| Requirement | Status |
|-------------|--------|
| Testnet only | ✅ devnet |
| Connect wallet | ✅ Phantom |
| Deposit → play → withdraw | ✅ LIVE Dice + Slot via `GameFundsBar` |
| Verifiable on-chain | ✅ program + Fair tab + Explorer |
| Public URL | ✅ [truebrutal.netlify.app](https://truebrutal.netlify.app) |
| Casino edge | ✅ 200 bps on-chain |
| Two games | ✅ Dice + Slot |
| Polished UX | ✅ FUN/LIVE split, funds bar, i18n EN/RU/UK |

## Architecture (funds UX)

| Surface | FUN | LIVE |
|---------|-----|------|
| `GameFundsBar` on `/games/*` | fun credits + Refill | casino + Phantom WIBE + deposit/withdraw |
| Lobby `/` | hidden | visible when connected + LIVE |
| Game Play tab | bet input only | bet input only |

## Dev / QA

```bash
pnpm dev
pnpm test:env && pnpm test:idl && pnpm test:motion && pnpm exec vitest run tests/rng-verify.test.ts
pnpm exec playwright test
pnpm build
pnpm devnet:token-meta   # Phantom WIBE label (once per mint)
```

Tester: [`iterations/help.md`](../iterations/help.md)

## Roles

| Agent | Role |
|-------|------|
| **Cursor** | it.16 LIVE play IDL fix |
| **PO** | Netlify QA, submission commit |
