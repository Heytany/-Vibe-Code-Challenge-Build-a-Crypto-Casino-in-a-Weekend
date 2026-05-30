# Game: Corrupted Reels (Slot)

## Route

`/games/slot` → `components/games/SlotGame.vue`

## Modes (mandatory — ADR-014)

| Mode | Default | Wallet | Balance | RNG |
|------|---------|--------|---------|-----|
| **FUN** | yes | not required | virtual credits | client `computeReels` |
| **LIVE** | no | Phantom | on-chain | `play_slot` |

## On-chain (live only)

Instruction: `play_slot(bet, user_seed)`

- 3 reels, symbols 0-5
- Payout: triple ×10, pair ×2 (before house edge)
- Event: `SlotPlayed { reel1, reel2, reel3, ... }`

## Frontend

- Composable: `composables/useGameSlot.ts` — `spinFun()` / `spinLive()`
- Live: wire to Anchor `play_slot` (after Dice)

## UI

- FUN/LIVE toggle, 3 reels, bet, spin, `playWinBurst` on win
