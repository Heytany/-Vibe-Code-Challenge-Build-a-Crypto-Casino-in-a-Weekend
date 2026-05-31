# ADR-016: Auto-roll, speed, fullscreen game mode

**Status:** accepted
**Date:** 2026-05-31

## Decision

- `composables/useAutoPlay.ts` — runs a game action N rounds (or ∞) with per-round delay,
  stop-on-win, cancellable.
- `composables/useFullscreen.ts` — fullscreens **document root** (not a child) so body-teleported
  win toasts stay visible; toggles `html.bw-fullscreen-game` to hide header/footer.
- `useBrutalMotion().setMotionSpeed(mult)` — `gsap.globalTimeline.timeScale`; x2 fast mode.
- `components/games/GameAutoFsBar.vue` — shared control bar (bet/roll, rounds + ∞, speed 1×/2×,
  stop-on-win, Start/Stop, Fullscreen) embedded in the play tab of Dice and Slot.
- Games expose `playOnce(): Promise<boolean>` (throws on invalid/insufficient → auto-roll stops).

## Consequences

- Auto-roll reuses the exact same play path (RNG, payouts, win FX) — no separate logic.
- Fullscreen requires a user gesture (button) — handled.
