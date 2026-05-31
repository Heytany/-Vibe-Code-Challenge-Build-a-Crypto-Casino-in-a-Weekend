# Games implementation — status (it.15)

**LIVE is wired.** FUN and LIVE both playable on Dice and Slot.

## Prereqs (done on devnet)

1. Program deployed → `BfdTrxqFfFhe4xA3XniqVWzVkQKX88za5yuA4FRq3ktw`
2. `.env` / Netlify: 4× `NUXT_PUBLIC_*` (see [`deploy.md`](deploy.md))
3. `types/idl/wibe_casino.json` + `pnpm copy-idl` after anchor build

## Implementation status

| Piece | File | State |
|-------|------|-------|
| On-chain RNG mirror | `shared/rng-verify.ts` | ✅ + tests |
| Fun mode | `useFunBalance`, `useGameMode`, ADR-014 | ✅ shared state |
| Casino client | `useCasinoProgram.ts` | ✅ deposit/withdraw/play/refresh |
| Dice | `useGameDice.ts`, `DiceGame.vue` | ✅ fun + live |
| Slot | `useGameSlot.ts`, `SlotGame.vue` | ✅ fun + live |
| Funds UX | `GameFundsBar.vue`, `CasinoActions.vue` | ✅ FUN refill / LIVE deposit |
| Bet UI | `GameBetInput.vue` | ✅ bet only in game panel |
| Provably fair | `ProvablyFair.vue` | ✅ fun + live verify |

## UX map

- **GameFundsBar** (`app.vue`): FUN on game routes; LIVE on game routes + lobby when connected
- **Game panel**: bet input only — no duplicate balances
- **Mode toggle**: header of each game page

## RNG contract (matches `lib.rs`)

```
hash = fnv1a( blockhash[0..32] || userSeed(u64 LE) || nonce(u64 LE) || domain )
dice:  roll   = hash % 100 + 1        domain = "dice"
slot:  symbol = hash % 6              domain = "slot", nonce' = nonce + reel·0x9e3779b97f4a7c15
```

> Slot uses a **per-reel nonce stride** (`SLOT_REEL_STRIDE`), NOT a trailing reel byte — a trailing
> byte under FNV-1a left the three reels always distinct (slot never paid). Matches `lib.rs` +
> `shared/rng-verify.ts`. The deployed program MUST be built from this version (redeploy if it was
> deployed before the stride fix), else on-chain results won't match the Fair-tab recompute.

Payouts: dice gross = bet·19500/1e4; slot ×10/×2; minus house edge 200 bps.

## Verification

`verifyDice` / `verifySlot` in Fair tab — recomputes from public inputs; LIVE links to Solana Explorer.
