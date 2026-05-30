# Brutal wibe — architecture plan (repo copy)

> Synced from Cursor architect session 2026-05-30. Do not edit the `.cursor/plans/` file — edit this + ADRs.

## Goal

Brutalist on-chain crypto casino for Vibe-Code challenge: connect wallet → deposit → play → withdraw on **Solana devnet**.

## Stack

Solana devnet · Anchor 0.30 · Nuxt 3 SPA · Phantom · Reka UI (headless) · i18n EN/RU/UK

## Games

1. **Glitch Roll** (dice) — `play_dice`
2. **Corrupted Reels** (slot) — `play_slot`

## Key paths

- Program: `programs/wibe-casino/`
- Wrappers: `components/ui/primitives/`
- Agent docs: `ai/`
- Env: `.env.example`, `shared/env-contract.ts`

## Phase 1 skeleton — DONE

Monorepo, ai/, env tests, e2e smoke, composables stubs, Reka wrappers.

## Phase 2 — NEXT

Deploy program, wire casino + games, polish, public URL.

See [`CONTEXT.md`](CONTEXT.md) for live status.
