# Game: Corrupted Reels (Slot)

## Route

`/games/slot` → `components/games/SlotGame.vue`

## On-chain

Instruction: `play_slot(bet, user_seed)`

- 3 reels, symbols 0-5
- Payout: triple ×10, pair ×2 (before house edge)
- Event: `SlotPlayed { reel1, reel2, reel3, ... }`

## Frontend

- Composable: `composables/useGameSlot.ts`
- TODO: wire to Anchor `play_slot`

## UI (later)

- Misaligned reel columns, scanlines, jitter animation
- Use custom Vue — not Reka (game-specific)
