# Game: Glitch Roll (Dice)

## Route

`/games/dice` → `components/games/DiceGame.vue`

## Modes (mandatory — ADR-014)

| Mode | Default | Wallet | Balance | RNG |
|------|---------|--------|---------|-----|
| **FUN** | yes | not required | virtual 1000 credits | client `rng-verify` |
| **LIVE** | no | Phantom devnet | on-chain casino PDA | `play_dice` instruction |

Toggle: `components/games/GameModeToggle.vue` + `useGameMode()`.

## On-chain (live only)

Instruction: `play_dice(bet, roll_under, target, user_seed)`

- `target`: 2-98
- Win: roll under/over target
- Event: `DicePlayed { roll, won, ... }`

## Frontend

- Composable: `composables/useGameDice.ts` — `rollFun()` / `rollLive()`
- Toast errors: `useBrutalToast().showError()`
- Live: wire to Anchor `play_dice` (iteration 4)

## UI

- FUN/LIVE toggle, fun banner, bet, target slider, under/over, roll, result `UiGlitchText`
- Live: deposit/withdraw, verify on Explorer (when wired)
