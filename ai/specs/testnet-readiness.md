# Testnet (devnet) readiness — status

**Date:** 2026-05-30 · updated after iteration 15

TL;DR — **FUN and LIVE are production-ready on devnet.** Program deployed, frontend wired, Netlify live.

## ✅ Ready

| Area | State |
|------|-------|
| Anchor program | Deployed `BfdTrxqFfFhe4xA3XniqVWzVkQKX88za5yuA4FRq3ktw` — initialize/deposit/withdraw/play_dice/play_slot |
| Frontend client | `useCasinoProgram` — Program, balance refresh, deposit, withdraw, play, event parse |
| RNG verifiability | `shared/rng-verify.ts` + Provably Fair tab |
| Wallet | Phantom connect/disconnect, devnet |
| FUN gameplay | Dice + Slot, auto-roll, shared `useFunBalance` |
| LIVE gameplay | Deposit → play → withdraw via `GameFundsBar` |
| Env | `netlify.toml` + `.env.example`; FUN works without env |
| Public URL | [truebrutal.netlify.app](https://truebrutal.netlify.app) |

## PO QA checklist

1. FUN: `/games/dice` — roll without wallet  
2. LIVE: connect → deposit → play → withdraw  
3. Fair tab verify after LIVE round  
4. Phantom WIBE label: `pnpm devnet:token-meta` (once per mint)

## Risk notes

- `recent_blockhashes` sysvar deprecated but readable (first 32 bytes for RNG)
- SPL **0 decimals** on devnet mint — UI shows whole WIBE
- First deposit creates `UserBalance` PDA (`init_if_needed` on-chain)

Runbook: [`../../scripts/devnet-deploy.md`](../../scripts/devnet-deploy.md) · Tester: [`../../iterations/help.md`](../../iterations/help.md)
