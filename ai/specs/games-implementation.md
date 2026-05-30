# Games implementation — next-iteration handoff

Everything below is scaffolded and ready. The next agent wires it to the deployed program.

## Prereqs (do first)

1. `anchor build && anchor deploy --provider.cluster devnet` → copy program ID.
2. Set `NUXT_PUBLIC_CASINO_PROGRAM_ID`, `NUXT_PUBLIC_CASINO_TOKEN_MINT`, `NUXT_PUBLIC_SOLANA_RPC_URL` in `.env`.
3. `pnpm copy-idl` → IDL/types under the path `useCasinoProgram` expects. Create `@coral-xyz/anchor` Program.

## Already in place (iteration 3 prep)

| Piece | File | State |
|-------|------|-------|
| On-chain RNG mirror | `shared/rng-verify.ts` | ✅ done + tested (`tests/rng-verify.test.ts`) |
| Game constants (multipliers, target range, house edge cap) | `shared/rng-verify.ts` | ✅ mirror of `lib.rs` |
| Win / deposit motion | `useBrutalMotion().playWinBurst / playDepositPulse` | ✅ implemented |
| Game UI i18n | `games.common.*`, `games.dice.*`, `games.slot.*` (en/ru/uk) | ✅ keys ready |
| SEO per game | `useSeoMeta` in `pages/games/{dice,slot}.vue` | ✅ done |
| Dice composable | `composables/useGameDice.ts` | stub — throws `play_dice not wired` |
| Slot composable | `composables/useGameSlot.ts` | stub — throws `play_slot not wired` |
| Casino program client | `composables/useCasinoProgram.ts` | stub — `deposit/withdraw/refreshBalance` TODO |

## Wiring checklist

### `useCasinoProgram`

- Build `anchor.Program` from IDL + `programId` + a wallet adapter over `useWallet`.
- `refreshBalance()` → fetch `UserBalance` PDA `[USER_BALANCE_SEED, config, user]`; set `casinoBalance`.
- `deposit(amount)` → ATA transfer into `casino_vault` via `deposit` ix; on success `playDepositPulse(panelEl)` + `refreshBalance()`.
- `withdraw(amount)` → `withdraw` ix; refresh.
- Expose `playDice` / `playSlot` that send the ix with `recent_blockhashes` sysvar
  (`SYSVAR_RECENT_BLOCKHASHES_PUBKEY`) and a client-chosen `user_seed` (random u64).

### `useGameDice` / `useGameSlot`

- Replace the `TODO` throw with `useCasinoProgram().playDice({ bet, target, direction, userSeed })`.
- Parse the emitted `DicePlayed` / `SlotPlayed` event → set `lastRoll` / `reels`.
- On win → `playWinBurst(resultEl)`.
- Store `{ txSignature, userSeed, nonce, blockhash }` so the UI can call `verifyDice` / `verifySlot`.

### UI (`components/games/DiceGame.vue`, `SlotGame.vue`)

- Bet input + `games.common.bet` / `max` (max = casino balance).
- Dice: target slider (2–98) + under/over toggle (`games.dice.rollUnder/rollOver`), live win-chance.
- Slot: 3 reels with jitter/scanline spin; reveal symbols from event.
- Result line: `games.common.win/lose/payout/youRolled`.
- "Verify on Explorer" link (`games.common.verifyRoll`) → opens tx; a local recompute via
  `shared/rng-verify` shows `verifiedOk` / `verifiedFail`.
- Errors via `useBrutalToast().showError()` mapped from `WibeErrorCode`.

## RNG contract (must match `lib.rs`)

```
hash = fnv1a( blockhash[0..32] || userSeed(u64 LE) || nonce(u64 LE) || domain )
dice:  roll   = hash % 100 + 1        domain = "dice"
slot:  symbol = hash % 6              domain = "slot" + reelIndex(byte)
```

Payouts (integer math): dice gross = bet·19500/1e4; slot gross = bet·{10|2}; both minus
`gross·houseEdgeBps/1e4`. House edge ≤ 1000 bps on-chain. See `shared/rng-verify.ts`.

## Verification (paranoid player)

`verifyDice` / `verifySlot` take the explorer-visible `blockhash` (base58 → `base58Decode`),
`userSeed`, `nonce`, and the emitted result, and recompute locally — green if it matches.
