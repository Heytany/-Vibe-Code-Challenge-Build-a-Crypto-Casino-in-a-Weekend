# Testnet (devnet) readiness — analysis

**Date:** 2026-05-31 · author: Claude (Cowork)

TL;DR — **FUN mode is 100% ready and deployable now. LIVE on-chain is ~50%: the Solana program
is fully written, but it is not deployed and the frontend client is not wired.** Connecting to
devnet is the iteration-04 plan executed on a host with the Solana toolchain.

## ✅ Ready

| Area | State |
|------|-------|
| Anchor program logic | `programs/wibe-casino/src/lib.rs` — `initialize/deposit/withdraw/play_dice/play_slot`, FNV-1a verifiable RNG, `DicePlayed/SlotPlayed` events, PDAs, `#[error_code]`. Complete. |
| RNG verifiability | `shared/rng-verify.ts` mirrors the program byte-for-byte (+ tests). Provably-fair tab live in both games. |
| Wallet connect | `useWallet` (Phantom connect/disconnect, pubkey, connection from RPC). Works. |
| FUN gameplay | Dice + Slot fully playable client-side (same RNG), auto-roll, speed, fullscreen, win FX. |
| Deps | `@coral-xyz/anchor ^0.30`, `@solana/web3.js`, `@solana/spl-token` installed. |
| LIVE gating | `useCasinoProgram.isConfigured` + `useGameMode.canLive` already hide LIVE until env+wallet present. |
| Env handling | Empty chain env no longer breaks the app (FUN-only deploy works). |

## ❌ Blocking LIVE on devnet (must do on host with Rust + Solana CLI + Anchor 0.30)

1. **Program not deployed.** `declare_id!` and `Anchor.toml` are the placeholder
   `Wibe1111…`. Need: `anchor keys sync` → `anchor build` → `anchor deploy --provider.cluster devnet`,
   then put the real program id in `declare_id!`, `Anchor.toml`, and `.env`.
2. **No IDL / types.** `anchor build` hasn't run → no `target/idl/wibe_casino.json`, no `types/`.
   `pnpm copy-idl` must produce the IDL the frontend imports.
3. **Frontend client is a stub.** `composables/useCasinoProgram.ts` — `refreshBalance / deposit /
   withdraw` are TODO/throw; there is no `new Program(...)`, no `playDice/playSlot`. LIVE rolls
   throw "wire useCasinoProgram" by design.
4. **SPL token + casino init.** Create a devnet mint, mint test tokens, call `initialize(house_edge_bps)`.
5. **Verify-from-chain.** Live `verifyDice/verifySlot` need the tx signature + on-chain blockhash
   (read via `getTransaction`) — `rng-verify` already accepts them; just feed real values.

## Effort estimate (host)

| Step | Rough |
|------|-------|
| Deploy program + token + init + env | ~30–45 min |
| Wire `useCasinoProgram` (Program, balance, deposit, withdraw, playDice/playSlot) | ~2–3 h |
| Wire `useGameDice/Slot` live branches + parse events + live verify | ~1–2 h |
| QA on Phantom devnet (deposit→play→verify→withdraw) | ~1 h |

Everything is specced in [`games-implementation.md`](games-implementation.md) and
[`../../iterations/04-plan-dice-game.md`](../../iterations/04-plan-dice-game.md). No architecture
work remains — it is mechanical wiring against an already-correct program.

## Risk notes

- `recent_blockhashes` sysvar is deprecated but still readable; program reads its first 32 bytes.
- Watch SPL **decimals** when showing balances (program works in base units).
- Anchor 0.30: `.accounts({})` keys are camelCase.
- Cannot be done from the Cowork sandbox (no Rust/Solana toolchain, no Phantom, native modules
  built for macOS). Must run on the host / Cursor.
