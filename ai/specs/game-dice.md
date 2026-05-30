# Game: Glitch Roll (Dice)

## Route

`/games/dice` → `components/games/DiceGame.vue`

## On-chain

Instruction: `play_dice(bet, roll_under, target, user_seed)`

- `target`: 2-98
- Win: roll under/over target
- Event: `DicePlayed { roll, won, ... }`

## Frontend

- Composable: `composables/useGameDice.ts`
- Toast errors: `useBrutalToast().showError()`
- TODO: wire to Anchor `play_dice`

## UI (later)

- Terminal-style input for target + under/over toggle
- Glitch animation on result via `UiGlitchText`
