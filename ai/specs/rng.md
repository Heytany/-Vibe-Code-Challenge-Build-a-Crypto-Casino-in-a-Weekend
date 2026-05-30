# RNG (on-chain)

## Formula

```
hash = fnv1a(recent_blockhash[0..32] || user_seed_le || nonce_le || domain)
roll = (hash % 100) + 1          // dice: 1-100
symbol = hash % 6                 // slot: 0-5 per reel
```

Domain bytes: `b"dice"` or `b"slot" + reel_index`.

## Verification (player)

1. Open transaction in Solana Explorer
2. Read `recent_blockhash` from tx context
3. Read `user_seed`, `game_nonce` from instruction args / events (`DicePlayed`, `SlotPlayed`)
4. Recompute hash off-chain — must match emitted roll/reels

## Implementation

- Rust: `programs/wibe-casino/src/lib.rs` — `hash_from_inputs`, `compute_roll`, `compute_symbol`
- Not Switchboard VRF (weekend scope)

## TODO

- Expose verify helper in frontend `shared/rng-verify.ts` for UI "verify roll" link
