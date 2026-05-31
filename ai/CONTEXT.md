# Sprint context (live)

**Last updated:** 2026-05-31 — iteration 13 done  
**Current iteration:** 13  
**Report:** [`iterations/13-live-ux-wibe-token-fair-fix.md`](../iterations/13-live-ux-wibe-token-fair-fix.md)

## Iteration 13 — done ✅

- [x] LIVE UX: casino vs Phantom balance, WIBE labels, deposit hints
- [x] Win toasts LIVE: payoutDelta, break-even at bet 1
- [x] Provably Fair LIVE: blockhashBase58 + sysvar bytes
- [x] Phantom metadata: `pnpm devnet:token-meta` → Brutal WIBE (WIBE)
- [x] help.md: Unknown Token / 10k demo mint explained
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
| Verifiable on-chain | ✅ program + Fair tab + Explorer links |
| Public URL | ✅ [truebrutal.netlify.app](https://truebrutal.netlify.app) |
| Casino edge | ✅ 200 bps on-chain |
| Wallet → deposit → play → withdraw | ✅ LIVE Dice + Slot |
| Two playable games | ✅ |
| Polished UX | ✅ it.13 LIVE funds + i18n |

## Dev / QA

```bash
pnpm dev
pnpm test:env && pnpm test:motion && pnpm exec vitest run tests/rng-verify.test.ts
pnpm exec playwright test
NUXT_IGNORE_LOCK=1 pnpm build
pnpm devnet:token-meta   # Phantom WIBE label (once per mint)
```

Tester: [`iterations/help.md`](../iterations/help.md)

## Roles

| Agent | Role |
|-------|------|
| **Cursor** | it.13 LIVE UX + metadata + Fair fix |
| **PO** | Netlify QA, submission materials |
