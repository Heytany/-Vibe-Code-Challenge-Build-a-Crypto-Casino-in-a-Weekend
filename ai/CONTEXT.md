# Sprint context (live)

**Last updated:** 2026-05-31 — **final / it.19**  
**Current iteration:** 19 (marathon close)  
**Report:** [`iterations/19-final-marathon.md`](../iterations/19-final-marathon.md)

## Submission-ready ✅

| Requirement | Status |
|-------------|--------|
| Testnet only | ✅ devnet |
| Connect wallet | ✅ Phantom |
| Deposit → play → withdraw | ✅ LIVE Dice + Slot |
| Verifiable on-chain | ✅ Fair tab + blockhash in events (it.17) |
| Public URL | ✅ [truebrutal.netlify.app](https://truebrutal.netlify.app) |
| Casino edge | ✅ 200 bps on-chain |
| Two games | ✅ Dice + Slot (+ Wheel faucet it.18) |
| Polished UX | ✅ FUN/LIVE, funds bar, i18n, mobile, motion |

## Iteration 19 — final hotfixes ✅

- [x] `CasinoActions` — «Сумма (WIBE)», без дубля deposit label
- [x] `GameAutoFsBar` — mobile autoroll, Lucide ∞, skip-prompt после 3 cancel
- [x] `live-play-mutex` — очередь LIVE sign, fix Phantom freeze после reject
- [x] `useWheel` — cancelSpin при скрытом popup
- [x] Wheel page tabs: How it works + Trust (+ SOL rent note) — **commit pending PO**

## Iteration 18 — WIBE Wheel ✅

- [x] On-chain `init_faucet` / `spin_wheel`, skewed 1..1000, 24h cooldown
- [x] `WheelBanner`, `/games/wheel`, `pnpm devnet:faucet`
- [x] README wheel + trust narrative

## Iteration 17 — verifiable RNG ✅

- [x] Blockhash emitted in `DicePlayed` / `SlotPlayed` (and `WheelSpun`)
- [x] Fair tab uses event blockhash
- [x] Matrix route timing fix
- [ ] **PO:** redeploy program if devnet still on pre-it.17 build

## Iteration 16 — LIVE play IDL ✅

- [x] Fix play_dice/play_slot discriminators (101)
- [x] signing → animation order; cancel + auto-roll skip
- [x] LIVE default on connect; GameFundsBar on lobby

### Devnet env

```
NUXT_PUBLIC_SOLANA_NETWORK=devnet
NUXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NUXT_PUBLIC_CASINO_PROGRAM_ID=BfdTrxqFfFhe4xA3XniqVWzVkQKX88za5yuA4FRq3ktw
NUXT_PUBLIC_CASINO_TOKEN_MINT=He66seATY4XobvcwC8WZceMH3uncAqEx44T8HtLyttox
```

## Architecture (funds UX)

| Surface | FUN | LIVE |
|---------|-----|------|
| `GameFundsBar` on `/games/*` | fun credits + Refill | casino + Phantom + deposit/withdraw |
| Lobby `/` | hidden | WIBE strip when wallet + env |
| `/games/wheel` | — | faucet spin → casino balance |

## Dev / QA

```bash
pnpm dev
pnpm test:env && pnpm test:idl
pnpm exec vitest run tests/rng-verify.test.ts tests/live-play-mutex.test.ts
pnpm test:motion
pnpm build
pnpm devnet:faucet   # after program deploy with wheel ix
```

Tester: [`iterations/help.md`](../iterations/help.md) · Final: [`iterations/19-final-marathon.md`](../iterations/19-final-marathon.md)

## Roles

| Agent | Role |
|-------|------|
| **Claude (Cowork)** | it.3, 8–10, 17–18 — **4 Cloud session limits** |
| **Cursor** | it.11–19 — **>$40 on-demand** (+ $26 overage it.12–15, $20 included earlier) |
| **PO** | deploy, commits, Notion submission |
