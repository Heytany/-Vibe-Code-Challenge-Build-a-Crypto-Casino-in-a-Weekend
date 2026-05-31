# RNG (on-chain)

## Formula

```
hash = fnv1a(recent_blockhash[0..32] || user_seed_le || nonce_le || domain)
roll   = (hash % 100) + 1                            // dice: 1-100, domain b"dice"
symbol = fnv1a(... nonce' ... b"slot") % 6           // slot: 0-5 per reel
         where nonce' = nonce + reel * 0x9e3779b97f4a7c15  (wrapping u64)
```

Dice domain: `b"dice"`. Slot domain: `b"slot"` with a **per-reel nonce stride**
(`SLOT_REEL_STRIDE = 0x9e3779b97f4a7c15`) instead of a trailing reel byte.

> **Why the stride (fix, iteration 10):** appending the reel index as a trailing byte mixed too
> weakly under FNV-1a — the three reels mod 6 came out ALWAYS distinct, so the slot could never
> pay a pair or triple (measured 0% over 100k spins). Folding `reel*STRIDE` into the nonce
> restores ~44% pair / ~2.8% triple. Mirrored in `lib.rs` and `shared/rng-verify.ts`.

## Verification (player)

1. Open transaction in Solana Explorer
2. Read `recent_blockhash` from tx context
3. Read `user_seed`, `game_nonce` from instruction args / events (`DicePlayed`, `SlotPlayed`)
4. Recompute hash off-chain — must match emitted roll/reels

## Implementation

- Rust: `programs/wibe-casino/src/lib.rs` — `hash_from_inputs`, `compute_roll`, `compute_symbol`
- Not Switchboard VRF (weekend scope)

## TODO

- ~~Expose verify helper in frontend `shared/rng-verify.ts` for UI "verify roll" link~~
  ✅ done (iteration 3): `shared/rng-verify.ts` + `tests/rng-verify.test.ts`, includes
  `base58Decode`, `computeRoll/computeSymbol/computeReels`, `verifyDice/verifySlot`, payout helpers.
