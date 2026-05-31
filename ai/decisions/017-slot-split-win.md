# ADR-017: Slot split-panel win animation

**Status:** accepted
**Date:** 2026-05-31

## Decision

On a slot win, `MatrixPanelBackdrop.playSplit(segments)` divides the win backdrop into N vertical
bands by matched symbols: pair (×2) → 2 bands, triple (×10) → 3 bands. Even bands run an
**inverted** code-sweep (`filter: invert`) in the opposite direction; odd bands run the normal
sweep — i.e. 2-line = normal+invert, 3-line = normal+invert+normal. Dice keeps the single `play()`.

## Consequences

- Visual payoff scales with win size, reusing the existing matrix backdrop (no new canvas system).
