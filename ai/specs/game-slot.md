# Game: Corrupted Reels (Slot)

## Route

`/games/slot` → `components/games/SlotGame.vue`

## Modes (mandatory — ADR-014)

| Mode | Default | Wallet | Balance | RNG |
|------|---------|--------|---------|-----|
| **FUN** | yes | not required | virtual credits | client `computeReels` |
| **LIVE** | no | Phantom | on-chain | `play_slot` |

## UI (it.6)

- **`MonsterReelsHero.vue`** — slot-only mascot; cyclops eye fills head; 3 bare reels in `#bandit`
- **`SlotReelsPanel.vue`** — 3D flip per cell while spinning; spin button in `#action` (static during roll)
- **`MonsterHero.vue`** — lobby + dice only (not slot)
- Matrix backdrop on win; antenna twitch on spin
- Shared layout with dice: `bw-game-result-slot`, grid tab panels, hero min-height

## On-chain (live only)

Instruction: `play_slot(bet, user_seed)` — triple ×10, pair ×2, house edge on-chain.

## Frontend

- Composable: `composables/useGameSlot.ts` — `spinFun()` / `spinLive()`
- Super win: triple match (`isSlotSuperWin`)
