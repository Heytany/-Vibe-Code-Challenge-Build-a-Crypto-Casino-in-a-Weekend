# Sprint context (live)

**Last updated:** 2026-05-31 — iteration 12 ready, **PO commit + Netlify deploy**  
**Current iteration:** 12  
**Report:** [`iterations/12-live-wire-fun-live-fix.md`](../iterations/12-live-wire-fun-live-fix.md)

## Iteration 12 — ready (PO commit + deploy) ⏳

- [x] FUN/LIVE segmented radio + `isRealChainConfig` (no placeholder LIVE)
- [x] `useCasinoProgram` — deposit, withdraw, playDice, playSlot
- [x] Devnet program deployed: `BfdTrxqFfFhe4xA3XniqVWzVkQKX88za5yuA4FRq3ktw`
- [x] SPL mint + initialize + 10k demo tokens → Phantom PO
- [x] Buffer polyfill (`vite-plugin-node-polyfills`) — lobby boot OK
- [x] e2e 4/4, build OK, deploy docs updated
- [ ] **PO:** LIVE QA (deposit → play → withdraw)
- [x] **Live URL:** [truebrutal.netlify.app](https://truebrutal.netlify.app) (Netlify, GitHub deploy)
- [ ] **PO:** commit it.12 + hash in README (agent does NOT commit)

### Devnet env (local + Netlify)

```
NUXT_PUBLIC_SOLANA_NETWORK=devnet
NUXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NUXT_PUBLIC_CASINO_PROGRAM_ID=BfdTrxqFfFhe4xA3XniqVWzVkQKX88za5yuA4FRq3ktw
NUXT_PUBLIC_CASINO_TOKEN_MINT=He66seATY4XobvcwC8WZceMH3uncAqEx44T8HtLyttox
```

---

## Challenge README — honest status

| Requirement | Status |
|-------------|--------|
| Testnet only | ✅ devnet |
| Verifiable on-chain | ✅ program live + Fair tab |
| Public URL | ✅ [truebrutal.netlify.app](https://truebrutal.netlify.app) |
| Casino edge | ✅ 200 bps on-chain + FUN |
| Wallet → deposit → play → withdraw | ✅ wired + devnet deploy; PO LIVE QA |
| Two playable games | ✅ FUN + LIVE Dice/Slot |
| Error UX | ✅ access denied + i18n toasts |
| Mobile UX | ✅ it.11 |

## Dev / QA

```bash
pnpm dev                    # :3000 — needs real .env for LIVE
pnpm test:env && pnpm test:motion && pnpm exec playwright test
NUXT_IGNORE_LOCK=1 pnpm build
pnpm devnet:setup           # re-run chain setup (devnet only)
pnpm devnet:balance         # check SOL balance, no faucet spam
```

Tester: [`iterations/help.md`](../iterations/help.md) — Phantom devnet + LIVE QA

Deploy: [`specs/deploy.md`](specs/deploy.md)

## Roles

| Agent | Role |
|-------|------|
| **Cursor** | it.12 code + devnet setup done |
| **PO** | LIVE QA, commit, Netlify, live URL in CONTEXT |
